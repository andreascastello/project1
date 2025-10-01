import React from 'react'
import { useActiveModel } from '../state/ActiveModelContext'
import femtogoImage from '../assets/femtogo.png'

interface CSSBackgroundProps {
  backgroundImage?: string
  midgroundImage?: string
  foregroundImage?: string
}

export const CSSBackground: React.FC<CSSBackgroundProps> = ({
  backgroundImage = femtogoImage,
  midgroundImage,
  foregroundImage
}) => {
  const { activeModelName } = useActiveModel()

  // Classes CSS pour les différents zooms selon les layers
  const getLayerClass = (layer: 'background' | 'midground' | 'foreground') => {
    if (!activeModelName) return 'scale-100'
    
    // Zoom unifié quand un modèle est sélectionné
    switch (layer) {
      case 'background':
        return 'scale-120' // Zoom subtil 1.2x
      case 'midground':
        return 'scale-140' // Zoom moyen 1.4x
      case 'foreground':
        return 'scale-180' // Zoom fort 1.8x
      default:
        return 'scale-100'
    }
  }

  return (
    <>
      {/* Layer 1 - Background (le plus loin) */}
      <div
        className={`fixed inset-0 transition-transform duration-500 ease-out ${getLayerClass('background')}`}
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
          transformOrigin: 'center center'
        }}
      />

      {/* Layer 2 - Midground (plan moyen) */}
      {midgroundImage && (
        <div
          className={`fixed inset-0 transition-transform duration-500 ease-out ${getLayerClass('midground')}`}
          style={{
            backgroundImage: `url(${midgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 2,
            transformOrigin: 'center center',
            opacity: 0.8 // Légère transparence pour l'effet de profondeur
          }}
        />
      )}

      {/* Layer 3 - Foreground (premier plan) */}
      {foregroundImage && (
        <div
          className={`fixed inset-0 transition-transform duration-500 ease-out ${getLayerClass('foreground')}`}
          style={{
            backgroundImage: `url(${foregroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 3,
            transformOrigin: 'center center',
            opacity: 0.6 // Plus transparente pour laisser voir les layers derrière
          }}
        />
      )}

      {/* Overlay sombre pour améliorer le contraste avec les 3D */}
      <div 
        className="fixed inset-0 bg-black/30 transition-opacity duration-500"
        style={{ 
          zIndex: 4,
          opacity: activeModelName ? 0.4 : 0.2 // Plus sombre quand focus
        }}
      />
    </>
  )
}
