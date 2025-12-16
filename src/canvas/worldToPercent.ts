import * as THREE from 'three'

export interface PercentPoint {
  x: number // 0..100
  y: number // 0..100
}

export function worldToPercent(world: THREE.Vector3, camera: THREE.Camera, size: { width: number, height: number }): PercentPoint {
  const ndc = world.clone().project(camera)
  const x = ((ndc.x + 1) / 2) * 100
  const y = ((-ndc.y + 1) / 2) * 100
  return {
    // Ne pas clamp pour permettre des origines de transformation au-delà de [0..100] et renforcer l'effet aux extrêmes
    x,
    y,
  }
}


