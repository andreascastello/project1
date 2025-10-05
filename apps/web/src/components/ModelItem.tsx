import React, { useRef, useCallback, useMemo, useEffect } from 'react'
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
  const draggingRef = useRef(false)
  const lastPointerRef = useRef<{ x: number, y: number } | null>(null)

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

  // Drag rotation uniquement pour l'objet actif
  const handlePointerDown = useCallback((e: any) => {
    if (!isActive) return
    e.stopPropagation()
    draggingRef.current = true
    lastPointerRef.current = { x: e.clientX, y: e.clientY }
  }, [isActive])

  const handlePointerMove = useCallback((e: any) => {
    if (!isActive || !draggingRef.current) return
    e.stopPropagation()
    const group = groupRef.current
    if (!group || !lastPointerRef.current) return
    const dx = e.clientX - lastPointerRef.current.x
    const dy = e.clientY - lastPointerRef.current.y
    lastPointerRef.current = { x: e.clientX, y: e.clientY }
    // Rotation simple: horizontale autour de Y, verticale autour de X
    const rotationSpeed = 0.005
    group.rotation.y += dx * rotationSpeed
    group.rotation.x += dy * rotationSpeed
  }, [isActive])

  const handlePointerUp = useCallback((e: any) => {
    if (!isActive) return
    e.stopPropagation()
    draggingRef.current = false
    lastPointerRef.current = null
  }, [isActive])

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
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
