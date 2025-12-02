import React, { useEffect } from 'react'
import { useStableModelCache } from '../hooks/useStableModelCache'
import { ModelItem } from './ModelItem'
import { useActiveModel } from '../state/ActiveModelContext'
import { useLoading } from '../providers/LoadingProvider'

interface ModelCollectionProps {
  activeModelName: string | null
  onSelect: (name: string) => void
  colorMode?: boolean
}

export const ModelCollection: React.FC<ModelCollectionProps> = ({ activeModelName, onSelect, colorMode = false }) => {
  const loadedModels = useStableModelCache()
  const { facet } = useActiveModel()
  const { setLoaded } = useLoading()

  // Une fois que les modèles sont réellement chargés (Suspense résolu),
  // on peut signaler au provider de masquer l'écran de loading.
  useEffect(() => {
    setLoaded()
  }, [setLoaded])

  return (
    <group>
      {Object.values(loadedModels)
        .filter((loadedModel) => (loadedModel.facet ?? 'femtogo') === facet)
        .map((loadedModel) => {
        // Tous les modèles sont rendus depuis le cache stable
        return (
          <ModelItem
            key={loadedModel.name}
            loadedModel={loadedModel}
            isActive={activeModelName === loadedModel.name}
            onSelect={onSelect}
            activeModelName={activeModelName}
          />
        )
      })}
    </group>
  )
}


