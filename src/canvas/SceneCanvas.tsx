import React, { Suspense, useCallback, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, HueSaturation } from '@react-three/postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useActiveModel } from '../state/ActiveModelContext'
import { SceneLights } from './SceneLights'
import { ModelCollection } from '../components/ModelCollection'
import { FluidCameraRig } from './FluidCameraRig'
import { useStableModelCache } from '../hooks/useStableModelCache'
import { useScrollLock } from '../hooks/useScrollLock'
import { models } from '../constants'
import { getRenderedObject } from '../state/RenderedObjectRegistry'
import { worldToPercent } from './worldToPercent'

const FOV_DEG = 75
const FOCUS_DISTANCE_MULTIPLIER = 2.3

function computeFocusFromObject(root: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(root)
  const center = box.getCenter(new THREE.Vector3())
  const sphere = box.getBoundingSphere(new THREE.Sphere())
  const radius = sphere.radius || 1
  const fov = THREE.MathUtils.degToRad(FOV_DEG)
  const distance = (radius / Math.tan(fov / 2)) * FOCUS_DISTANCE_MULTIPLIER // comfort multiplier
  return { center, distance }
}

// Dual pass renderer: layer 1 (inactive) in grayscale, layer 2 (active) in color overlaid.
// When a model is active, we freeze the camera transform for pass 1 so the background appears static
// while OrbitControls move the live camera for the active object.
const DualPassRenderer: React.FC = () => {
  const { gl, camera, scene, raycaster, size } = useThree()
  const { activeModelName, facet } = useActiveModel()
  const composerRef = React.useRef<any>(null)

  // Choix du cadrage NDC (-1..1). (-0.5, -0.5) = centre du quadrant bas-gauche
  const NDC_X = -0.3
  const NDC_Y = -0.3

  // Freeze camera transform when entering an active focus
  const frozenPos = React.useRef(new THREE.Vector3())
  const frozenQuat = React.useRef(new THREE.Quaternion())
  const hasFrozen = React.useRef(false)

  React.useEffect(() => {
    if (activeModelName) {
      frozenPos.current.copy(camera.position)
      frozenQuat.current.copy(camera.quaternion)
      hasFrozen.current = true
    } else {
      hasFrozen.current = false
    }
  }, [activeModelName, camera])

  useFrame(() => {
    gl.setClearColor(0x000000, 0)

    // Mode "baby": rendu simple en couleur sans pass gris
    if (facet === 'baby') {
      camera.layers.enable(1)
      camera.layers.enable(2)
      gl.autoClear = true
      // Appliquer le cadrage décentré en page détail comme côté FEMTOGO
      if (activeModelName && (camera as any).isPerspectiveCamera) {
        const fullW = size.width
        const fullH = size.height
        const offsetX = Math.round(-NDC_X * fullW * 0.5)
        const offsetY = Math.round(NDC_Y * fullH * 0.5)
        ;(camera as THREE.PerspectiveCamera).setViewOffset(fullW, fullH, offsetX, offsetY, fullW, fullH)
        camera.updateProjectionMatrix()
      }
      gl.render(scene, camera)
      if ((camera as any).isPerspectiveCamera) {
        (camera as THREE.PerspectiveCamera).clearViewOffset()
        camera.updateProjectionMatrix()
      }
      return
    }

    // Save live camera transform
    const livePos = new THREE.Vector3().copy(camera.position)
    const liveQuat = new THREE.Quaternion().copy(camera.quaternion)

    // PASS 1: grayscale on layer 1 (inactive). If active, render with frozen camera so background is static
    camera.layers.set(1)
    gl.autoClear = true
    if (hasFrozen.current) {
      camera.position.copy(frozenPos.current)
      camera.quaternion.copy(frozenQuat.current)
      camera.updateMatrixWorld()
    }
    composerRef.current?.render()

    // Restore live camera for the color overlay
    if (hasFrozen.current) {
      camera.position.copy(livePos)
      camera.quaternion.copy(liveQuat)
      camera.updateMatrixWorld()
    }

    // PASS 2: color overlay of layer 2 (active)
    camera.layers.set(2)
    gl.autoClear = false
    gl.clearDepth()

    // Déplacer le centre de projection uniquement pour la pass couleur
    if (activeModelName && (camera as any).isPerspectiveCamera) {
      const fullW = size.width
      const fullH = size.height
      const offsetX = Math.round(-NDC_X * fullW * 0.5)
      const offsetY = Math.round(NDC_Y * fullH * 0.5)
      ;(camera as THREE.PerspectiveCamera).setViewOffset(fullW, fullH, offsetX, offsetY, fullW, fullH)
      camera.updateProjectionMatrix()
    }

    gl.render(scene, camera)

    // Réinitialiser l'offset immédiatement après
    if ((camera as any).isPerspectiveCamera) {
      (camera as THREE.PerspectiveCamera).clearViewOffset()
      camera.updateProjectionMatrix()
    }

    // Restore layers so raycaster sees both
    camera.layers.enable(1)
    camera.layers.enable(2)
    raycaster.layers.enable(1)
    raycaster.layers.enable(2)
  }, 2)

  return (
    <EffectComposer ref={composerRef} scene={scene} camera={camera} enabled={false}>
      <HueSaturation saturation={-1} />
    </EffectComposer>
  )
}

export const SceneCanvas: React.FC = () => {
  const { activeModelName, setActiveModelName, setCameraTarget, setBgTransformOrigin, setSelectModelByName, addDiscovered } = useActiveModel()
  const loaded = useStableModelCache() // ensure models are loaded

  // Lock scroll quand une 3D est en vue détail
  useScrollLock(!!activeModelName)

  const controlsRef = useRef<any>(null)
  const orbitInterruptRef = useRef(false)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const sizeRef = useRef<{ width: number, height: number } | null>(null)
  // Memoriser l'origine de fond "au repos" (sans focus/zoom) pour chaque modèle
  const baseBgOriginRef = useRef<Map<string, { x: number, y: number }>>(new Map())
  // Mémoriser l'origine de fond réellement utilisée (après calcul complet) par modèle
  const lastFocusedBgOriginRef = useRef<Map<string, { x: number, y: number }>>(new Map())

  // Overlay de fondu noir au reset
  const resetOverlayRef = React.useRef<HTMLDivElement | null>(null)
  const [resetSeq, setResetSeq] = React.useState(0)

  // Recalculer les origines "au repos" quand la scène est prête et qu'aucun focus n'est actif
  React.useEffect(() => {
    if (activeModelName) return
    const cam = cameraRef.current
    const sz = sizeRef.current
    if (!cam || !sz) return
    const nextMap = new Map<string, { x: number, y: number }>()
    for (const m of models) {
      const rendered = getRenderedObject(m.name)
      const targetObject = rendered ?? loaded[m.name]?.gltf.scene
      if (!targetObject) continue
      const { center } = computeFocusFromObject(targetObject)
      const base = worldToPercent(center, cam, sz)
      nextMap.set(m.name, base)
    }
    baseBgOriginRef.current = nextMap
  }, [activeModelName, loaded])

  const handleSelect = useCallback((name: string) => {
    if (name === '') {
      // Incrémenter une séquence de reset pour déclencher l'animation GSAP du fondu noir + reset caméra/scène
      setResetSeq((s) => s + 1)
      return
    }

    // Préférer l'objet réellement rendu (group + Center + transforms)
    const rendered = getRenderedObject(name)
    const targetObject = rendered ?? loaded[name]?.gltf.scene
    if (!targetObject) return

    // compute true center & distance from the actually rendered object
    const { center, distance } = computeFocusFromObject(targetObject)

    // Avant de bouger la caméra, déterminer l'origine background à appliquer
    try {
      // 1) Priorité: si on a déjà mémorisé l'origine EXACTE utilisée lors d'un focus précédent de ce modèle, on la réutilise telle quelle (cohérence parfaite).
      const lastExact = lastFocusedBgOriginRef.current.get(name)
      if (lastExact) {
        setBgTransformOrigin(lastExact)
      } else {
        // 2) Sinon, on part de l'origine "au repos" (indépendante du focus) puis on ajoute le décalage de cadrage
        const baseFromMemo = baseBgOriginRef.current.get(name)
        const NDC_X = -0.3
        const NDC_Y = -0.3
        const dxPct = -NDC_X * 50
        const dyPct = -NDC_Y * 50
        if (baseFromMemo) {
          // Ne pas clamp pour permettre un pivot hors du cadre et accentuer le mouvement aux extrêmes
          const x = baseFromMemo.x + dxPct
          const y = baseFromMemo.y + dyPct
          const origin = { x, y }
          setBgTransformOrigin(origin)
          lastFocusedBgOriginRef.current.set(name, origin)
        } else {
          // 3) Fallback: calcul immédiat via caméra courante
          const cam = cameraRef.current
          const sz = sizeRef.current
          if (cam && sz) {
            const base = worldToPercent(center, cam, sz)
            const x = base.x + dxPct
            const y = base.y + dyPct
            const origin = { x, y }
            setBgTransformOrigin(origin)
            lastFocusedBgOriginRef.current.set(name, origin)
          }
        }
      }
    } catch {}

    // Position "en face"; la projection décentrée sera appliquée en pass 2 via setViewOffset
    const pos: [number, number, number] = [center.x, center.y, center.z + distance]
    addDiscovered(name)
    setActiveModelName(name)
    setCameraTarget({ pos, look: [center.x, center.y, center.z] })
    if (controlsRef.current) {
      controlsRef.current.target.copy(center)
      controlsRef.current.update()
    }
  }, [loaded, setActiveModelName, setCameraTarget, setBgTransformOrigin, addDiscovered])

  // Animation GSAP du fondu noir + reset de la caméra/scène
  useGSAP(
    () => {
      if (resetSeq === 0) return
      const overlay = resetOverlayRef.current
      if (!overlay) return

      const tl = gsap.timeline()

      // 1) Fade-in rapide du noir
      tl.fromTo(
        overlay,
        { opacity: 0, pointerEvents: 'none' },
        {
          opacity: 1,
          pointerEvents: 'auto',
          duration: 0.3,
          ease: 'power2.out',
        }
      )

      // 2) Une fois le noir en place, remettre la scène/caméra à l'état initial
      tl.add(() => {
        setActiveModelName(null)
        setCameraTarget({ pos: [0, 0, 12], look: [0, 0, 0] })
        setBgTransformOrigin(null)
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0, 0)
          controlsRef.current.update()
        }
      })

      // 3) Laisser le temps aux animations internes (FluidCameraRig, opacités) de se stabiliser, puis fade-out
      tl.to(overlay, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        delay: 0.4,
        onComplete: () => {
          gsap.set(overlay, { pointerEvents: 'none' })
        },
      })
    },
    { dependencies: [resetSeq], scope: resetOverlayRef }
  )

  // Expose handleSelect to context for external navigation controls
  React.useEffect(() => {
    setSelectModelByName(handleSelect)
  }, [handleSelect, setSelectModelByName])

  // ESC: quitter la vue active et revenir à l'état initial
  React.useEffect(() => {
    if (!activeModelName) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSelect('')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeModelName, handleSelect])

  return (
    <>
      {/* Fondu noir léger quand on quitte la page détail pour laisser la caméra/scene se remettre en place */}
      <div
        ref={resetOverlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 200,
        }}
      />
      {activeModelName && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50 }}>
          <button
            onClick={() => handleSelect('')}
            style={{
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer'
            }}
          >
            Quitter
          </button>
        </div>
      )}
      <Canvas
      camera={{ position: [0, 0, 12], fov: 75 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false, depth: true }}
      shadows={false}
      frameloop="always"
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 5 }}
      onCreated={(state) => {
        const { gl, camera, size } = state as any
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        gl.setSize(window.innerWidth, window.innerHeight)
        gl.setClearColor(0x000000, 0)
        cameraRef.current = camera as THREE.PerspectiveCamera
        sizeRef.current = { width: size.width, height: size.height }
      }}
    >
      <SceneLights />
      <Suspense fallback={null}>
          <DualPassRenderer />
          <FluidCameraRig enabled interruptRef={orbitInterruptRef} />
        <ModelCollection activeModelName={activeModelName} onSelect={handleSelect} />
        <Environment preset="night" environmentIntensity={0.4} />
      </Suspense>
      <OrbitControls
        ref={controlsRef}
        enabled={!!activeModelName}
        enableRotate={!!activeModelName}
        enableZoom={false}
        enablePan={false}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.9}
        zoomSpeed={0.8}
        minDistance={1}
        maxDistance={50}
          // Marquer l'interaction utilisateur pour interrompre le lerp auto
          onStart={() => { orbitInterruptRef.current = true }}
      />
      </Canvas>
    </>
  )
}
