import React, { useRef, useCallback, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Center } from '@react-three/drei'
import * as THREE from 'three'
import type { LoadedModel } from '../hooks/useStableModelCache'

interface ModelItemProps {
  loadedModel: LoadedModel
  isActive: boolean
  onSelect: (name: string) => void
  activeModelName: string | null
}

export const ModelItem: React.FC<ModelItemProps> = ({ loadedModel, isActive, onSelect, activeModelName }) => {
  const groupRef = useRef<THREE.Group>(null)

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


  useFrame((_, delta) => {
    if (groupRef.current && isActive) {
      groupRef.current.rotation.y += delta * 0.6
    }
  })

  const handleClick = useCallback((e: any) => {
    e.stopPropagation()
    // On peut cliquer pour sélectionner si aucun objet n'est actif
    // Ou on peut cliquer pour désélectionner si c'est l'objet actif
    if (!activeModelName) {
      onSelect(loadedModel.name)
    } else if (activeModelName === loadedModel.name) {
      onSelect('') // Désélectionner l'objet actif
    }
    // Si un autre objet est actif, on ne fait rien
  }, [activeModelName, onSelect, loadedModel.name])

  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation()
    // Curseur pointer seulement si on peut interagir avec cet objet
    const canInteract = !activeModelName || activeModelName === loadedModel.name
    document.body.style.cursor = canInteract ? 'pointer' : 'default'
  }, [activeModelName, loadedModel.name])

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = 'default'
  }, [])

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
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
