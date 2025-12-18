import React from 'react'

interface LoadingScreenProps {
  error?: string | null
  /** Contrôle la visibilité avec un fondu doux */
  visible: boolean
  /** Variante visuelle : noir (défaut) ou blanc pour le boot initial */
  variant?: 'dark' | 'light'
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ error, visible, variant = 'dark' }) => {
  const isLight = variant === 'light'

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-end p-6 transition-opacity ${
        isLight ? 'bg-white text-black' : 'bg-fullBlack text-white'
      }`}
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        // Fade plus lent pour que le message reste visible un peu plus longtemps
        transition: 'opacity 1.2s ease-in-out',
      }}
      data-mouse-hint="Loading scene"
    >
      {error ? (
        <div
          className={`text-xs md:text-sm px-3 py-2 rounded ${
            isLight ? 'bg-white text-red-500' : 'bg-fullBlack text-red-400'
          }`}
        >
          <div className="font-semibold mb-1">Erreur de chargement</div>
          <p className="opacity-80">{error}</p>
        </div>
      ) : (
        <div className={`flex items-center ${isLight ? 'text-black/60' : 'text-white/70'}`}>
          {/* Simple spinner, le texte n'est visible que via MouseHintOverlay */}
          <div
            className={`h-6 w-6 border-2 rounded-full animate-spin ${
              isLight ? 'border-black/10 border-t-black' : 'border-white/20 border-t-white'
            }`}
          />
        </div>
      )}
    </div>
  )
}
