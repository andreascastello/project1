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
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center text-white max-w-md mx-auto px-6">
        {/* Logo ou titre */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            FEMTOGO
          </h1>
          <p className="text-gray-400 text-sm">
            Chargement de l'expérience 3D...
          </p>
        </div>

        {error ? (
          /* Affichage d'erreur */
          <div className="text-red-400">
            <div className="text-xl mb-2">❌ Erreur de chargement</div>
            <p className="text-sm text-gray-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (
          /* Barre de progression */
          <div>
            {/* Barre de progression visuelle */}
            <div className="w-full bg-gray-800 rounded-full h-2 mb-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Informations de progression */}
            <div className="flex justify-between text-sm text-gray-400 mb-6">
              <span>Modèles 3D: {loadedCount}/{totalModels}</span>
              <span>{progress}%</span>
            </div>

            {/* Animation de chargement */}
            <div className="flex justify-center space-x-1 mb-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>

            {/* Message de chargement */}
            <p className="text-gray-500 text-xs">
              {progress < 50 
                ? "Initialisation des modèles 3D..." 
                : progress < 90 
                ? "Optimisation des textures..." 
                : "Finalisation..."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
