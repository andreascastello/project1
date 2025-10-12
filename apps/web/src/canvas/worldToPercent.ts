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
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  }
}


