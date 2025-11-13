import React, { Suspense, useCallback, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, HueSaturation } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useActiveModel } from '../state/ActiveModelContext'
import { SceneLights } from './SceneLights'
import { ModelCollection } from '../components/ModelCollection'
import { FluidCameraRig } from './FluidCameraRig'
import { useStableModelCache } from '../hooks/useStableModelCache'
import { models } from '../models/models.config'
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

// ndcX/ndcY dans [-1..1] : (-0.5,-0.5) = centre du quadrant bas-gauche
function computeFramedCameraPosition(
  camera: THREE.PerspectiveCamera | null,
  center: THREE.Vector3,
  distance: number,
  ndcX: number, // -1..1 (gauche..droite)
  ndcY: number  // -1..1 (bas..haut)
) {
  if (!camera) {
    // Fallback simple: placer la caméra face à l'objet sans décalage
    return new THREE.Vector3(center.x, center.y, center.z + distance)
  }

  const aspect = camera.aspect || (window.innerWidth / window.innerHeight)
  const fov = THREE.MathUtils.degToRad(camera.fov)
  const visibleHeight = 2 * Math.tan(fov / 2) * distance
  const visibleWidth = visibleHeight * aspect

  // Décalage en unités monde à cette distance.
  // Signe choisi pour que ndc négatif => on pousse la caméra à droite/haut
  // -> l'objet apparait à gauche/bas à l'écran.
  const offsetX = -ndcX * (visibleWidth / 2)   // +X caméra = droite écran
  const offsetY = -ndcY * (visibleHeight / 2)  // +Y caméra = haut écran

  // On part d'une position "en face" (axe Z), puis on décale en X/Y monde (caméra sans roll).
  const pos = new THREE.Vector3(center.x, center.y, center.z + distance)
  pos.x += offsetX
  pos.y += offsetY
  return pos
}

// Dual pass renderer: layer 1 (inactive) in grayscale, layer 2 (active) in color overlaid.
// When a model is active, we freeze the camera transform for pass 1 so the background appears static
// while OrbitControls move the live camera for the active object.
const DualPassRenderer: React.FC = () => {
  const { gl, camera, scene, raycaster, size } = useThree()
  const { activeModelName } = useActiveModel()
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

  const controlsRef = useRef<any>(null)
  const orbitInterruptRef = useRef(false)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const sizeRef = useRef<{ width: number, height: number } | null>(null)

  const handleSelect = useCallback((name: string) => {
    if (name === '') {
      setActiveModelName(null)
      setCameraTarget({ pos: [0, 0, 12], look: [0, 0, 0] })
      setBgTransformOrigin(null)
      // reset orbit target to scene origin
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0)
        controlsRef.current.update()
      }
      return
    }

    // Préférer l'objet réellement rendu (group + Center + transforms)
    const rendered = getRenderedObject(name)
    const targetObject = rendered ?? loaded[name]?.gltf.scene
    if (!targetObject) return

    // compute true center & distance from the actually rendered object
// compute true center & distance
const { center, distance } = computeFocusFromObject(targetObject)

    // Avant de bouger la caméra, mesurer la position écran du centre
    try {
      const cam = cameraRef.current
      const sz = sizeRef.current
      if (cam && sz) {
        const base = worldToPercent(center, cam, sz) // {x,y} en %
        const NDC_X = -0.3
        const NDC_Y = -0.3
        
        const dxPct = -NDC_X * 50
        const dyPct = -NDC_Y * 50
        
        const x = Math.max(0, Math.min(100, base.x + dxPct))
        const y = Math.max(0, Math.min(100, base.y + dyPct))
        setBgTransformOrigin({ x, y })
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
  }, [loaded, setActiveModelName, setCameraTarget, addDiscovered])

  // Expose handleSelect to context for external navigation controls
  React.useEffect(() => {
    setSelectModelByName(handleSelect)
  }, [handleSelect, setSelectModelByName])

  return (
    <>
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
