import React, { useRef, useCallback, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Center } from '@react-three/drei'
import * as THREE from 'three'
import type { LoadedModel } from '../hooks/useStableModelCache'
import { registerRenderedObject, unregisterRenderedObject } from '../state/RenderedObjectRegistry'
import { useActiveModel } from '../state/ActiveModelContext'
import { models, PORTAL_MODEL_NAME } from '../constants'

interface ModelItemProps {
  loadedModel: LoadedModel
  isActive: boolean
  onSelect: (name: string) => void
  activeModelName: string | null
}

export const ModelItem: React.FC<ModelItemProps> = ({ loadedModel, isActive, onSelect, activeModelName }) => {
  const groupRef = useRef<THREE.Group>(null)
  const materialsRef = useRef<Array<{ mesh: THREE.Mesh, material: any }>>([])
  const layerObjectsRef = useRef<THREE.Object3D[]>([])
  // La rotation par drag est gérée par OrbitControls côté scène
  const { discoveredNames, facet, playInk } = useActiveModel()
  const isPortal = loadedModel.name === PORTAL_MODEL_NAME
  // Débloquer le portail uniquement quand TOUTES les 3D FEMTOGO (hors portail) sont découvertes
  const otherNames = useMemo(
    () => models
      .filter(m => (m.facet ?? 'femtogo') === 'femtogo' && m.name !== PORTAL_MODEL_NAME)
      .map(m => m.name),
    []
  )
  // Pour faciliter les tests: rendre le portail toujours cliquable
  const isPortalUnlocked = isPortal ? true : otherNames.every(n => discoveredNames.includes(n))

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
    // En facet "baby": forcer layer 2 (couleur), sinon logique normale
    const targetLayer = facet === 'baby' ? 2 : (isPortalUnlocked ? 2 : (isActive ? 2 : 1))
    for (const obj of layerObjectsRef.current) {
      if (obj && (obj as any).layers && typeof (obj as any).layers.set === 'function') {
        obj.layers.set(targetLayer)
      }
    }
  }, [isActive, isPortalUnlocked, facet])

  // Mémoïser le clone pour éviter de le recréer à chaque render
  const clonedScene = useMemo(() => {
    return loadedModel.gltf.scene.clone()
  }, [loadedModel.gltf.scene])

  // Indexer et mémoriser les matériaux pour gérer l'opacité sans retraverser en continu
  useEffect(() => {
    const group = groupRef.current
    materialsRef.current = []
    layerObjectsRef.current = []
    if (!group) return

    const layerObjects: THREE.Object3D[] = []

    group.traverse((child: any) => {
      if (!child.isMesh || !child.material) return
      const pushMaterial = (mesh: any, mat: any) => {
        if (!mat.userData.__baseOpacity) {
          mat.userData.__baseOpacity = typeof mat.opacity === 'number' ? mat.opacity : 1
        }
        mat.transparent = true
        materialsRef.current.push({ mesh, material: mat })

        // Indexer les objets qui portent réellement les materials (meshes) pour changer les layers plus tard
        if (!layerObjects.includes(mesh)) {
          layerObjects.push(mesh)
        }
      }
      if (Array.isArray(child.material)) {
        child.material.forEach((mat: any) => pushMaterial(child, mat))
      } else {
        pushMaterial(child, child.material)
      }
    })

    layerObjectsRef.current = layerObjects
  }, [clonedScene])

  // Lerp d'opacité pour faire disparaître les layers background/midground lorsque un modèle est actif
  useFrame((_, dt) => {
    const shouldFade = !!activeModelName && !isActive && (loadedModel.layer === 'background' || loadedModel.layer === 'midground' || loadedModel.layer === 'foreground')
    const threshold = 0.02
    // 500ms approx smoothing
    const k = 1 - Math.pow(0.001, dt / 0.5)
    for (const { mesh, material } of materialsRef.current) {
      const base = material.userData.__baseOpacity ?? 1
      const target = shouldFade ? 0 : base
      const current = typeof material.opacity === 'number' ? material.opacity : 1
      const next = THREE.MathUtils.lerp(current, target, k)
      if (Math.abs(next - current) > 1e-4) {
        material.opacity = next
        material.needsUpdate = true
      }
      const below = next < threshold
      // Eviter le sur-rendu et améliorer les perfs quand invisible
      material.depthWrite = !below
      // IMPORTANT: si ce modèle devient actif, le rendre visible immédiatement
      mesh.visible = isActive ? true : !below
    }
  })

  // Ajuster l'exposition en multipliant la couleur de base par le scalar.
  // Si le modèle est actif, on revient à l'exposition "normale" (1.0).
  useEffect(() => {
    const exposure = isActive ? 1 : (loadedModel.exposure ?? 1)

    const applyExposure = (material: any) => {
      if (!material || !material.color) return
      // Mémoriser la couleur de base pour éviter l'accumulation aux re-renders
      if (!material.userData.__baseColor) {
        material.userData.__baseColor = material.color.clone()
      }
      material.color.copy(material.userData.__baseColor).multiplyScalar(exposure)
      material.needsUpdate = true
    }

    for (const { material } of materialsRef.current) {
      applyExposure(material)
    }
  }, [loadedModel.name, loadedModel.exposure, isActive])

  const { setActiveModelName: setActive } = useActiveModel() as any

  const handleClick = useCallback((e: any) => {
    e.stopPropagation()
    // Portail: lancer la vidéo d'encre.
    // Le basculement vers la facette "baby" est maintenant synchronisé
    // au milieu de l'animation directement dans InkTransitionOverlay.
    if (isPortal) {
      playInk()
      return
    }
    // On peut cliquer pour sélectionner si aucun objet n'est actif
    // Ou on peut cliquer pour désélectionner si c'est l'objet actif
    if (!activeModelName) {
      onSelect(loadedModel.name)
    } else if (activeModelName === loadedModel.name) {
      // Ne plus quitter/désélectionner en cliquant sur l'actif
    }
    // Si un autre objet est actif, on ne fait rien
  }, [activeModelName, onSelect, loadedModel.name, isPortal, isPortalUnlocked, playInk])

  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation()
    // Quand un modèle est actif, on ne rend rien "cliquable"
    const canInteract = !activeModelName && (!isPortal || true)
    if (!canInteract) return
    document.body.style.cursor = 'pointer'
  }, [activeModelName, loadedModel.name, isPortal, isPortalUnlocked])

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
      scale={isActive ? loadedModel.scale * (loadedModel.focusScaleMultiplier ?? 1.3) : loadedModel.scale}
    >
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </group>
  )
}
