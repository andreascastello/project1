import React from 'react'

interface LoadingScreenProps {
  error?: string | null
  /** Contrôle la visibilité avec un fondu doux */
  visible: boolean
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ error, visible }) => {
  return (
    <div
      className="fixed inset-0 bg-fullBlack z-50 flex items-end justify-end p-6 transition-opacity"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        // Fade plus lent pour que le message reste visible un peu plus longtemps
        transition: 'opacity 1.2s ease-in-out',
      }}
      data-mouse-hint="Loading scene"
    >
      {error ? (
        <div className="text-red-400 text-xs md:text-sm bg-fullBlack px-3 py-2 rounded">
          <div className="font-semibold mb-1">Erreur de chargement</div>
          <p className="opacity-80">{error}</p>
        </div>
      ) : (
        <div className="flex items-center text-white/70">
          {/* Simple spinner, le texte n'est visible que via MouseHintOverlay */}
          <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
