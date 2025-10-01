import React from 'react'
import { useStableModelCache } from '../hooks/useStableModelCache'
import { ModelItem } from './ModelItem'

interface ModelCollectionProps {
  activeModelName: string | null
  onSelect: (name: string) => void
  colorMode?: boolean
}

export const ModelCollection: React.FC<ModelCollectionProps> = ({ activeModelName, onSelect, colorMode = false }) => {
  const loadedModels = useStableModelCache()

  return (
    <group>
      {Object.values(loadedModels).map((loadedModel) => {
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


