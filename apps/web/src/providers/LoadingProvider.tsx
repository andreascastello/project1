import React, { createContext, useContext, useState, ReactNode } from 'react'
import { models } from '../constants'

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
          setLoadingState(prev => ({
            ...prev,
            isLoading: false,
      progress: 100,
      loadedCount: prev.totalModels,
          }))
  }

  const setError = (error: string) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      error
    }))
  }

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
