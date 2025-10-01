import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useActiveModel } from '../state/ActiveModelContext'

interface FluidCameraRigProps {
  enabled?: boolean
}

export const FluidCameraRig: React.FC<FluidCameraRigProps> = ({ enabled = true }) => {
  const { cameraTarget, activeModelName } = useActiveModel()
  const tmpVec = useRef(new THREE.Vector3())
  const tmpVec2 = useRef(new THREE.Vector3())

  useFrame(({ camera }, delta) => {
    if (!enabled) return

    // Position de la caméra avec lerp ultra fluide
    tmpVec.current.set(...cameraTarget.pos)
    camera.position.lerp(tmpVec.current, delta * 4) // Plus rapide pour plus de fluidité

    // Look at avec lerp fluide
    tmpVec2.current.set(...cameraTarget.look)
    
    // Calculer la direction actuelle de la caméra
    const currentLookAt = new THREE.Vector3()
    camera.getWorldDirection(currentLookAt)
    currentLookAt.add(camera.position)
    
    // Lerp vers la nouvelle cible
    currentLookAt.lerp(tmpVec2.current, delta * 4)
    camera.lookAt(currentLookAt)

    // FOV dynamique pour un effet de zoom plus immersif
    const targetFOV = activeModelName ? 60 : 75 // FOV plus serré quand actif
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, delta * 3)
    camera.updateProjectionMatrix()
  })

  return null
}
