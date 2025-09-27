"use client"

import React, { useRef, useState, Suspense, forwardRef, useImperativeHandle, useCallback, useMemo } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Center, useGLTF } from "@react-three/drei"
import { Vector3 } from "three"
import femtogo from './assets/femtogo.png'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Canvas Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-black/50 text-white">
          <div className="text-center p-8">
            <h2 className="text-2xl mb-4">Erreur de rendu 3D</h2>
            <p className="mb-4">Une erreur s'est produite lors du chargement de la scène 3D.</p>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Configuration des modèles 3D (avec vos vrais modèles 3D)
const models = [
  {
    name: "Knight",
    path: '/3D/Knight-draco.glb',
    position: [0, -1, 0],
    backgroundPosition: { x: 50, y: 65 },
    rotation: [0, Math.PI, 0],
    scale: 1.0,
    color: "#8b5cf6",
  },
  {
    name: "Archive",
    path: '/3D/archive-draco.glb',
    position: [-6, 0, 0],
    backgroundPosition: { x: 10, y: 45 },
    rotation: [0, 0, 0],
    scale: 0.8,
    color: "#ef4444",
  },
  {
    name: "Childhood",
    path: '/3D/childhood-draco.glb',
    position: [6, 0, 0],
    backgroundPosition: { x: 90, y: 45 },
    rotation: [0, 0, 0],
    scale: 0.8,
    color: "#10b981",
  },
  {
    name: "Faded Flower",
    path: '/3D/faded_flower-draco.glb',
    position: [-4, 2, 0],
    backgroundPosition: { x: 25, y: 20 },
    rotation: [0, 0, 0],
    scale: 0.6,
    color: "#f59e0b",
  },
  {
    name: "Haunted House",
    path: '/3D/haunted_house-draco.glb',
    position: [0, 1, 0],
    backgroundPosition: { x: 50, y: 30 },
    rotation: [0, 0, 0],
    scale: 0.5,
    color: "#dc2626",
  },
  {
    name: "Closed Chapter",
    path: '/3D/closed_chapter-draco.glb',
    position: [-4, -2, 0],
    backgroundPosition: { x: 20, y: 80 },
    rotation: [0, 0, 0],
    scale: 0.7,
    color: "#7c3aed",
  },
  {
    name: "Dragon",
    path: '/3D/dragon-draco.glb',
    position: [4, 2, 0],
    backgroundPosition: { x: 75, y: 20 },
    rotation: [0, 0, 0],
    scale: 0.8,
    color: "#059669",
  },
]

// Composant pour synchroniser la caméra
const CameraSync = ({ cameraState }) => {
  const { camera } = useThree()
  
  React.useEffect(() => {
    if (cameraState && camera) {
      camera.position.set(...cameraState.position)
      camera.lookAt(...cameraState.target)
    }
  }, [cameraState, camera])

  return null
}

// Composant pour un modèle 3D individuel (avec vos vrais modèles 3D)
const Model3D = forwardRef(({ model, isActive, onActivate, onBackgroundZoom, activeModel, onCameraChange, isMainCanvas }, ref) => {
  const groupRef = useRef()
  const { camera } = useThree()
  const initialCameraPosition = useRef(new Vector3(0, 0, 12))
  const [isZooming, setIsZooming] = useState(false)
  const [currentRotation, setCurrentRotation] = useState([...model.rotation])

  // CORRECTION: Un modèle est cliquable SEULEMENT si aucun n'est actif
  const isClickable = activeModel === null

  // Configurer le chemin du décodeur Draco
  useGLTF.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
  const { scene } = useGLTF(model.path)

  useFrame((_, delta) => {
    if (groupRef.current && isActive && !isZooming) {
      groupRef.current.rotation.y += delta * 0.6
      setCurrentRotation([groupRef.current.rotation.x, groupRef.current.rotation.y, groupRef.current.rotation.z])
    }
  })

  const handleClick = useCallback((e) => {
    e.stopPropagation()

    // CORRECTION: Ne permettre le clic que si aucun modèle n'est actif
    if (!activeModel && isClickable) {
      setIsZooming(true)
      onActivate(model.name)

      const startPosition = camera.position.clone()
      const targetPosition = new Vector3(...model.position).add(new Vector3(0, 0, 3))
      const startTime = performance.now()
      const duration = 500

      const animateCamera = () => {
        const elapsed = performance.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)
        const eased = easeInOutCubic(progress)

        camera.position.lerpVectors(startPosition, targetPosition, eased)
        camera.lookAt(...model.position)

        onBackgroundZoom(1.8, model.backgroundPosition)
        onCameraChange(camera.position.toArray(), [model.position[0], model.position[1], model.position[2]])

        if (progress < 1) {
          requestAnimationFrame(animateCamera)
        } else {
          setIsZooming(false)
        }
      }
      requestAnimationFrame(animateCamera)
    }
  }, [activeModel, isClickable, camera, model, onActivate, onBackgroundZoom, onCameraChange])

  const exitModel = useCallback(() => {
    if (isActive && !isZooming) {
      setIsZooming(true)

      const startPosition = camera.position.clone()
      const targetPosition = initialCameraPosition.current
      const startRotation = [...currentRotation]
      const targetRotation = [...model.rotation]
      const startTime = performance.now()
      const duration = 500

      const animateCamera = () => {
        const elapsed = performance.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)
        const eased = easeInOutCubic(progress)

        camera.position.lerpVectors(startPosition, targetPosition, eased)
        camera.lookAt(0, 0, 0)

        onBackgroundZoom(1, { x: 50, y: 50 })
        onCameraChange(camera.position.toArray(), [0, 0, 0])

        if (groupRef.current) {
          groupRef.current.rotation.x = startRotation[0] + (targetRotation[0] - startRotation[0]) * eased
          groupRef.current.rotation.y = startRotation[1] + (targetRotation[1] - startRotation[1]) * eased
          groupRef.current.rotation.z = startRotation[2] + (targetRotation[2] - startRotation[2]) * eased
        }

        if (progress < 1) {
          requestAnimationFrame(animateCamera)
        } else {
          setIsZooming(false)
          setCurrentRotation([...model.rotation])
          onActivate(null)
        }
      }
      requestAnimationFrame(animateCamera)
    }
  }, [isActive, isZooming, camera, currentRotation, model.rotation, onBackgroundZoom, onCameraChange, onActivate])

  useImperativeHandle(ref, () => ({
    exitModel,
  }))

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        // CORRECTION: Curseur pointer seulement si cliquable
        document.body.style.cursor = isClickable ? "pointer" : "default"
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default"
      }}
      position={model.position}
      rotation={currentRotation}
      scale={isActive ? model.scale * 2.0 : model.scale}
    >
      <Center>
        {/* Vos vrais modèles 3D au lieu des cubes */}
        <primitive object={scene} />
      </Center>
    </group>
  )
})

// Composant pour gérer la collection de modèles 3D
const ModelCollection = forwardRef(
  ({ onBackgroundZoom, onActivate, activeModel, onCameraChange, colorMode = false, isMainCanvas = true }, ref) => {
    const modelRefs = useRef({})

    const handleActivate = (modelName) => {
      if (onActivate) onActivate(modelName)
    }

    const exitActiveModel = () => {
      if (activeModel && modelRefs.current[activeModel]) {
        modelRefs.current[activeModel].exitModel()
      }
    }

    // CORRECTION: Always call useImperativeHandle, regardless of conditions
    useImperativeHandle(ref, () => ({
      exitModel: exitActiveModel,
      isActive: activeModel !== null,
    }))

    return (
      <group>
        {models.map((model) => {
          // Calculer si le modèle doit être affiché
          const shouldRender = !(
            (colorMode && model.name !== activeModel) ||
            (isMainCanvas && model.name === activeModel)
          )

          // Retourner le composant ou null, mais toujours après avoir appelé les hooks
          return shouldRender ? (
            <Model3D
              key={model.name}
              ref={(ref) => {
                if (ref) {
                  modelRefs.current[model.name] = ref
                }
              }}
              model={model}
              isActive={activeModel === model.name}
              onActivate={handleActivate}
              onBackgroundZoom={onBackgroundZoom}
              activeModel={activeModel}
              onCameraChange={onCameraChange}
              isMainCanvas={isMainCanvas}
            />
          ) : (
            <group key={model.name} visible={false} />
          )
        })}
      </group>
    )
  },
)

function App() {
  const [backgroundTransform, setBackgroundTransform] = useState({ scale: 1, position: { x: 50, y: 50 } })
  const [controlsEnabled, setControlsEnabled] = useState(false)
  const [activeModel, setActiveModel] = useState(null)
  const [cameraState, setCameraState] = useState({ position: [0, 0, 12], target: [0, 0, 0] })
  const modelRef = useRef()
  const colorCanvasRef = useRef()
  const colorModelRef = useRef()

  const handleBackgroundZoom = useCallback((scale, position) => {
    setBackgroundTransform({ scale, position })
  }, [])

  const handleActivate = useCallback((modelName) => {
    setActiveModel(modelName)
    setControlsEnabled(modelName !== null)
  }, [])

  // Synchroniser les caméras
  const handleCameraChange = useCallback((position, target) => {
    setCameraState({ position, target })
  }, [])

  // Fonction pour quitter le modèle actif
  const exitActiveModel = useCallback(() => {
    if (activeModel) {
      // Essayer d'abord avec le canvas couleur (où est le modèle actif)
      if (colorModelRef.current?.exitModel) {
        colorModelRef.current.exitModel()
      } else if (modelRef.current?.exitModel) {
        // Fallback sur le canvas principal
        modelRef.current.exitModel()
      } else {
        // Fallback manuel avec animation
        setControlsEnabled(false)
        
        // Animation de retour de caméra
        const startPosition = cameraState.position
        const targetPosition = [0, 0, 12]
        const startTime = performance.now()
        const duration = 500

        const animateCamera = () => {
          const elapsed = performance.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)
          const eased = easeInOutCubic(progress)

          const currentPos = [
            startPosition[0] + (targetPosition[0] - startPosition[0]) * eased,
            startPosition[1] + (targetPosition[1] - startPosition[1]) * eased,
            startPosition[2] + (targetPosition[2] - startPosition[2]) * eased,
          ]

          setCameraState({ position: currentPos, target: [0, 0, 0] })
          setBackgroundTransform({ 
            scale: 1.8 + (1 - 1.8) * eased, 
            position: { x: 50, y: 50 } 
          })

          if (progress < 1) {
            requestAnimationFrame(animateCamera)
          } else {
            setActiveModel(null)
            setBackgroundTransform({ scale: 1, position: { x: 50, y: 50 } })
            setCameraState({ position: [0, 0, 12], target: [0, 0, 0] })
          }
        }
        requestAnimationFrame(animateCamera)
      }
    }
  }, [activeModel, cameraState])

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={{
          backgroundImage: `url(${femtogo})`,
          backgroundSize: "cover",
          backgroundPosition: `${backgroundTransform.position.x}% ${backgroundTransform.position.y}%`,
          backgroundRepeat: "no-repeat",
          transform: `scale(${backgroundTransform.scale})`,
          transformOrigin: `${backgroundTransform.position.x}% ${backgroundTransform.position.y}%`,
        }}
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Canvas principal en grayscale - TOUJOURS visible */}
      <ErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 12], fov: 75 }}
          style={{
            filter: activeModel ? "grayscale(1) brightness(0.3)" : "grayscale(1)",
            transition: "filter 0.3s ease-out",
          }}
          onCreated={({ gl }) => {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
          }}
        >
          <ambientLight intensity={0.9} />
          <hemisphereLight skyColor={0xffffff} groundColor={0x222222} intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <directionalLight position={[-8, 5, -6]} intensity={0.8} />
          <spotLight position={[0, 8, 8]} angle={0.6} penumbra={0.3} intensity={1.0} castShadow />
          <Suspense fallback={null}>
            <CameraSync cameraState={cameraState} />
            <ModelCollection
              ref={modelRef}
              onBackgroundZoom={handleBackgroundZoom}
              onActivate={handleActivate}
              activeModel={activeModel}
              onCameraChange={handleCameraChange}
              isMainCanvas={true}
            />
            <Environment preset="night" environmentIntensity={0.7} />
          </Suspense>
          <OrbitControls
            enabled={false} // Désactivé sur le canvas principal
            enableZoom={false}
            enableRotate={false}
            enablePan={false}
          />
        </Canvas>
      </ErrorBoundary>

      {/* Canvas superposé en couleur pour le modèle actif SEULEMENT */}
      {activeModel && (
        <ErrorBoundary>
          <Canvas
            ref={colorCanvasRef}
            camera={{
              position: cameraState.position,
              fov: 75,
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "auto", // Permettre les interactions
              zIndex: 2,
            }}
            onCreated={({ gl }) => {
              gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            }}
          >
            <ambientLight intensity={0.9} />
            <hemisphereLight skyColor={0xffffff} groundColor={0x222222} intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            <directionalLight position={[-8, 5, -6]} intensity={0.8} />
            <spotLight position={[0, 8, 8]} angle={0.6} penumbra={0.3} intensity={1.0} castShadow />
            <Suspense fallback={null}>
              <ModelCollection
                ref={colorModelRef}
                onBackgroundZoom={handleBackgroundZoom}
                onActivate={handleActivate}
                activeModel={activeModel}
                onCameraChange={handleCameraChange}
                colorMode={true}
                isMainCanvas={false}
              />
              <Environment preset="night" environmentIntensity={0.7} />
            </Suspense>
            {/* OrbitControls SEULEMENT sur le canvas couleur */}
            <OrbitControls
              enabled={controlsEnabled}
              enableZoom={controlsEnabled}
              enableRotate={controlsEnabled}
              enablePan={false}
              maxDistance={6}
              minDistance={2}
              target={activeModel ? models.find((m) => m.name === activeModel)?.position : [0, 0, 0]}
              makeDefault={false}
            />
          </Canvas>
        </ErrorBoundary>
      )}

      <div className="absolute top-8 left-8 text-white z-10" style={{ zIndex: 10 }}>
        <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">FEMTOGO - Collection 3D</h1>
        <p className="text-lg opacity-90 drop-shadow-md">
          {controlsEnabled
            ? "Mode 3D actif - Utilisez la souris pour explorer"
            : "Cliquez sur un élément pour l'explorer"}
        </p>
        {activeModel && <p className="text-sm opacity-75 mt-1">Modèle actif : {activeModel}</p>}
      </div>

      {controlsEnabled && (
        <button
          onClick={exitActiveModel}
          className="absolute top-8 right-8 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 z-10 drop-shadow-lg"
          style={{ zIndex: 10 }}
        >
          ✕ Quitter le mode 3D
        </button>
      )}
    </div>
  )
}

export default App
