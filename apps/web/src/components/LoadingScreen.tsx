import React from 'react'

interface LoadingScreenProps {
  progress: number
  loadedCount: number
  totalModels: number
  error?: string | null
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  progress, 
  loadedCount, 
  totalModels, 
  error 
}) => {
  return (
    <div className="fixed inset-0 bg-fullBlack z-50 flex items-end justify-end p-6">
      {error ? (
        <div className="text-red-400 text-xs md:text-sm bg-fullBlack px-3 py-2 rounded">
          <div className="font-semibold mb-1">Erreur de chargement</div>
          <p className="opacity-80">{error}</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-white/70">
          <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-xs md:text-sm tracking-[0.2em] uppercase">
            Loading {loadedCount}/{totalModels}
          </span>
        </div>
      )}
    </div>
  )
}
