import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useActiveModel } from '../state/ActiveModelContext'

type Props = { enabled?: boolean }

export const FluidCameraRig: React.FC<Props> = ({ enabled = true }) => {
  const { camera } = useThree()
  const { cameraTarget, activeModelName } = useActiveModel()

  const tmp = useRef(new THREE.Vector3())
  const arrivedRef = useRef(false)
  const lastActiveRef = useRef<string | null>(null)
  const lastTargetPos = useRef(new THREE.Vector3())

  useFrame((_, dt) => {
    if (!enabled) return

    // Desired camera position from state
    const desired = tmp.current.set(
      cameraTarget.pos[0],
      cameraTarget.pos[1],
      cameraTarget.pos[2]
    )

    // When a model is active, we only ease UNTIL we arrive once, then we stop updating position
    if (activeModelName) {
      const switched = lastActiveRef.current !== activeModelName
      const movedTarget = lastTargetPos.current.distanceToSquared(desired) > 1e-6
      if (switched || movedTarget) {
        arrivedRef.current = false
        lastActiveRef.current = activeModelName
        lastTargetPos.current.copy(desired)
      }

      if (!arrivedRef.current) {
        const lerp = 1 - Math.pow(0.001, dt)
        camera.position.lerp(desired, lerp)
        if (camera.position.distanceToSquared(desired) < 1e-4) {
          camera.position.copy(desired)
          arrivedRef.current = true // hand control fully to OrbitControls
        }
      }

      // IMPORTANT: do NOT call lookAt while active; OrbitControls owns orientation
      return
    }

    // No active model: smoothly follow the target and keep looking at it
    const lerp = 1 - Math.pow(0.001, dt)
    camera.position.lerp(desired, lerp)
    camera.lookAt(
      cameraTarget.look[0],
      cameraTarget.look[1],
      cameraTarget.look[2]
    )

    // Reset arrival bookkeeping when leaving active state
    arrivedRef.current = false
    lastActiveRef.current = null
    lastTargetPos.current.copy(desired)
  })

  return null
}
