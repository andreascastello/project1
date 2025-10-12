import React, { useRef, useCallback, useMemo, useEffect } from 'react'
import { Center } from '@react-three/drei'
import * as THREE from 'three'
import type { LoadedModel } from '../hooks/useStableModelCache'
import { registerRenderedObject, unregisterRenderedObject } from '../state/RenderedObjectRegistry'

interface ModelItemProps {
  loadedModel: LoadedModel
  isActive: boolean
  onSelect: (name: string) => void
  activeModelName: string | null
}

export const ModelItem: React.FC<ModelItemProps> = ({ loadedModel, isActive, onSelect, activeModelName }) => {
  const groupRef = useRef<THREE.Group>(null)
  // La rotation par drag est gérée par OrbitControls côté scène

  // Enregistrer le groupe réellement rendu pour le calcul de focus/centre
  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    registerRenderedObject(loadedModel.name, group)
    return () => {
      unregisterRenderedObject(loadedModel.name, group)
    }
  }, [loadedModel.name])

  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    const targetLayer = isActive ? 2 : 1
    group.traverse((obj: any) => {
      if (obj && obj.layers && typeof obj.layers.set === 'function') {
        obj.layers.set(targetLayer)
      }
    })
  }, [isActive])

  // Mémoïser le clone pour éviter de le recréer à chaque render
  const clonedScene = useMemo(() => {
    return loadedModel.gltf.scene.clone()
  }, [loadedModel.gltf.scene])

  // Ajuster l'exposition en multipliant la couleur de base par le scalar
  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    const exposure = loadedModel.exposure ?? 1

    const applyExposure = (material: any) => {
      if (!material || !material.color) return
      // Mémoriser la couleur de base pour éviter l'accumulation aux re-renders
      if (!material.userData.__baseColor) {
        material.userData.__baseColor = material.color.clone()
      }
      material.color.copy(material.userData.__baseColor).multiplyScalar(exposure)
      material.needsUpdate = true
    }

    group.traverse((child: any) => {
      if (!child.isMesh || !child.material) return
      if (Array.isArray(child.material)) {
        child.material.forEach((mat: any) => applyExposure(mat))
      } else {
        applyExposure(child.material)
      }
    })
  }, [loadedModel.name, loadedModel.exposure])

  const handleClick = useCallback((e: any) => {
    e.stopPropagation()
    // On peut cliquer pour sélectionner si aucun objet n'est actif
    // Ou on peut cliquer pour désélectionner si c'est l'objet actif
    if (!activeModelName) {
      onSelect(loadedModel.name)
    } else if (activeModelName === loadedModel.name) {
      // Ne plus quitter/désélectionner en cliquant sur l'actif
    }
    // Si un autre objet est actif, on ne fait rien
  }, [activeModelName, onSelect, loadedModel.name])

  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation()
    const canInteract = !activeModelName || activeModelName === loadedModel.name
    if (!canInteract) return
    document.body.style.cursor = 'pointer'
  }, [activeModelName, loadedModel.name])

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = 'default'
  }, [])

  // Supprimer les handlers de drag pour ne pas interférer avec OrbitControls
  const handlePointerDown = undefined as any
  const handlePointerMove = undefined as any
  const handlePointerUp = undefined as any

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={undefined}
      onPointerMove={undefined}
      onPointerUp={undefined}
      position={loadedModel.position}
      rotation={loadedModel.rotation}
      scale={isActive ? loadedModel.scale * 1.3 : loadedModel.scale}
    >
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </group>
  )
}
