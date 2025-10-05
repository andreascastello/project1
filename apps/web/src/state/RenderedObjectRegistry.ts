import * as THREE from 'three'

// Registre simple pour associer un nom de modèle au groupe réellement rendu
const renderedObjects = new Map<string, THREE.Object3D>()

export function registerRenderedObject(name: string, object: THREE.Object3D) {
  renderedObjects.set(name, object)
}

export function unregisterRenderedObject(name: string, object?: THREE.Object3D) {
  const current = renderedObjects.get(name)
  if (!object || current === object) {
    renderedObjects.delete(name)
  }
}

export function getRenderedObject(name: string): THREE.Object3D | null {
  return renderedObjects.get(name) ?? null
}


