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
  const { activeModelName, bgTransformOrigin } = useActiveModel()

  // Calcul utilitaire
  const origin = bgTransformOrigin ? `${bgTransformOrigin.x}% ${bgTransformOrigin.y}%` : '50% 50%'
  const bgScale = activeModelName ? 2 : 1
  const bgBlur = activeModelName ? '20px' : '0px'
  const midBlur = activeModelName ? '12px' : '0px'
  const foreBlur = activeModelName ? '6px' : '0px'

  return (
    <>
      {/* Layer 1 - Background (le plus loin) */}
      <div
        className={`fixed inset-0 transition-[transform,filter] duration-500 ease-out`}
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
          transformOrigin: origin,
          transform: `scale(${bgScale})`,
          filter: `blur(${bgBlur})`
        }}
      />

      {/* Layer 2 - Midground (plan moyen) */}
      {midgroundImage && (
        <div
          className={`fixed inset-0 transition-[transform,filter] duration-500 ease-out`}
          style={{
            backgroundImage: `url(${midgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 2,
            transformOrigin: origin,
            filter: `blur(${midBlur})`,
            opacity: 0.8
          }}
        />
      )}

      {/* Layer 3 - Foreground (premier plan) */}
      {foregroundImage && (
        <div
          className={`fixed inset-0 transition-[transform,filter] duration-500 ease-out`}
          style={{
            backgroundImage: `url(${foregroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 3,
            transformOrigin: origin,
            filter: `blur(${foreBlur})`,
            opacity: 0.6
          }}
        />
      )}

      {/* Overlay sombre pour améliorer le contraste avec les 3D */}
      <div 
        className="fixed inset-0 bg-black transition-opacity duration-500"
        style={{ 
          zIndex: 4,
          opacity: activeModelName ? 0.4 : 0.2
        }}
      />
    </>
  )
}
