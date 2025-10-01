import { useGLTF } from '@react-three/drei'
import type { GLTF } from 'three-stdlib'
import { models, type ModelConfig } from '../models/models.config'

// Configurer Draco decoder
useGLTF.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')

// Précharger tous les modèles une seule fois au niveau du module
models.forEach((model) => useGLTF.preload(model.path))

export interface LoadedModel extends ModelConfig {
  gltf: GLTF
}

// Hook simple qui utilise useGLTF de manière stable
export const useStableModelCache = (): Record<string, LoadedModel> => {
  const loadedModels: Record<string, LoadedModel> = {}
  
  // Charger tous les modèles - useGLTF gère le cache automatiquement
  models.forEach((modelConfig) => {
    const gltf = useGLTF(modelConfig.path) as GLTF
    loadedModels[modelConfig.name] = { ...modelConfig, gltf }
  })

  return loadedModels
}
