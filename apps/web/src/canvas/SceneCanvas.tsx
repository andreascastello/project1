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

const FOV_DEG = 75
const FOCUS_DISTANCE_MULTIPLIER = 3
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
  const { gl, camera, scene, raycaster } = useThree()
  const { activeModelName } = useActiveModel()
  const composerRef = React.useRef<any>(null)

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
    gl.render(scene, camera)

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
  const { activeModelName, setActiveModelName, setCameraTarget } = useActiveModel()
  const loaded = useStableModelCache() // ensure models are loaded

  const controlsRef = useRef<any>(null)
  const orbitInterruptRef = useRef(false)

  const handleSelect = useCallback((name: string) => {
    if (name === '') {
      setActiveModelName(null)
      setCameraTarget({ pos: [0, 0, 12], look: [0, 0, 0] })
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
    const { center, distance } = computeFocusFromObject(targetObject)

    const pos: [number, number, number] = [center.x, center.y, center.z + distance]
    setActiveModelName(name)
    setCameraTarget({ pos, look: [center.x, center.y, center.z] })

    if (controlsRef.current) {
      controlsRef.current.target.copy(center)
      controlsRef.current.update()
    }
  }, [loaded, setActiveModelName, setCameraTarget])

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
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
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
        enableZoom={!!activeModelName}
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
