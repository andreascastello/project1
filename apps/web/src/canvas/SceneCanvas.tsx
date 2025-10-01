import React, { Suspense, useCallback } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, HueSaturation } from '@react-three/postprocessing'
import * as THREE from 'three'
import { SceneLights } from './SceneLights'
import { ModelCollection } from '../components/ModelCollection'
import { FluidCameraRig } from './FluidCameraRig'
import { useActiveModel } from '../state/ActiveModelContext'
import { models } from '../models/models.config'


const DualPassRenderer: React.FC = () => {
  const { gl, camera, scene, raycaster } = useThree()
  const composerRef = React.useRef<any>(null)

  useFrame((_, dt) => {
    // Transparent clear to see CSS background
    gl.setClearColor(0x000000, 0)

    // PASS 1: render layer 1 (all non-active models) in grayscale via composer
    camera.layers.set(1)
    gl.autoClear = true
    composerRef.current?.render()

    // PASS 2: render only active layer (2) in color over the top
    camera.layers.set(2)
    gl.autoClear = false
    gl.clearDepth()
    gl.render(scene, camera)

    // Restore layers for R3F raycaster (so clicks see both active + inactive models)
    camera.layers.enable(1)
    camera.layers.enable(2)

    // Also restore raycaster layers so pointer events hit both layers
    raycaster.layers.enable(1)
    raycaster.layers.enable(2)

    // Optional: restore full layers for any subsequent operations (not strictly needed)
    // camera.layers.enable(1); camera.layers.enable(2)
  }, 2)

  return (
    <EffectComposer ref={composerRef} scene={scene} camera={camera} enabled={false}>
      <HueSaturation saturation={-1} />
    </EffectComposer>
  )
}

export const SceneCanvas: React.FC = () => {
  const { activeModelName, setActiveModelName, setCameraTarget } = useActiveModel()

  const handleSelect = useCallback((name: string) => {
    if (name === '') {
      // Désélectionner - remettre la caméra en position initiale
      setActiveModelName(null)
      setCameraTarget({ pos: [0, 0, 12], look: [0, 0, 0] })
      return
    }
    
    const model = models.find(m => m.name === name)
    if (!model) return
    // Calcul d'une position caméra simple devant le modèle
    const distance = 3 + model.scale * 0.5
    const pos: [number, number, number] = [
      model.position[0],
      model.position[1],
      model.position[2] + distance,
    ]
    setActiveModelName(name)
    setCameraTarget({ pos, look: model.position })
  }, [setActiveModelName, setCameraTarget])

  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 75 }}
      dpr={[1, 2]}
      gl={{ 
        antialias: true, 
        alpha: true, // Transparence pour voir le background derrière
        powerPreference: "high-performance",
        stencil: false,
        depth: true
      }}
      shadows={false}
      frameloop="always"
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 5, // Au-dessus des 3 layers CSS (1,2,3) + overlay (4)
      }}
    >
      <SceneLights />
      <Suspense fallback={null}>
        {/* N&B de toute la scène + overlay couleur pour l'actif */}
        <DualPassRenderer />
        
        <FluidCameraRig enabled={true} />
        <ModelCollection activeModelName={activeModelName} onSelect={handleSelect} />
        <Environment preset="night" environmentIntensity={0.4} />
      </Suspense>
      <OrbitControls enabled={false} enableZoom={false} enableRotate={false} enablePan={false} />
    </Canvas>
  )
}
