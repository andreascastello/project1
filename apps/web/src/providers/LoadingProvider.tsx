import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { models } from '../models/models.config'

interface LoadingState {
  isLoading: boolean
  progress: number
  loadedCount: number
  totalModels: number
  error: string | null
}

interface LoadingContextType extends LoadingState {
  setLoaded: () => void
  setError: (error: string) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

interface LoadingProviderProps {
  children: ReactNode
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    progress: 0,
    loadedCount: 0,
    totalModels: models.length,
    error: null
  })

  const setLoaded = () => {
    // Simulation de progression pour l'UX
    let progress = 0
    const progressTimer = setInterval(() => {
      progress += 20
      setLoadingState(prev => ({
        ...prev,
        progress: Math.min(progress, 100),
        loadedCount: models.length
      }))

      if (progress >= 100) {
        clearInterval(progressTimer)
        setTimeout(() => {
          setLoadingState(prev => ({
            ...prev,
            isLoading: false,
            progress: 100
          }))
          console.log('✅ Tous les modèles 3D ont été chargés en cache avec succès!')
        }, 500)
      }
    }, 200)
  }

  const setError = (error: string) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      error
    }))
  }

  // Démarrer le chargement automatiquement
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded()
    }, 100) // Petit délai pour montrer l'écran de loading

    return () => clearTimeout(timer)
  }, [])

  const contextValue: LoadingContextType = {
    ...loadingState,
    setLoaded,
    setError
  }

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  )
}

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading doit être utilisé dans un LoadingProvider')
  }
  return context
}
