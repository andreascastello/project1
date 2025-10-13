import React, { useEffect, useRef, useState } from 'react'
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

  // Origine animée pour simuler un déplacement de caméra lors du changement de modèle
  const [animatedOrigin, setAnimatedOrigin] = useState<{ x: number, y: number }>({ x: 50, y: 50 })
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const target = bgTransformOrigin ?? { x: 50, y: 50 }
    const start = { x: animatedOrigin.x, y: animatedOrigin.y }
    const duration = 500
    const startTime = performance.now()

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration)
      const e = easeOutCubic(t)
      const nx = start.x + (target.x - start.x) * e
      const ny = start.y + (target.y - start.y) * e
      setAnimatedOrigin({ x: nx, y: ny })
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [bgTransformOrigin])

  // Calcul utilitaire
  const origin = `${animatedOrigin.x}% ${animatedOrigin.y}%`
  const bgScale = activeModelName ? 2 : 1
  const bgBlur = activeModelName ? '20px' : '0px'
  const midBlur = activeModelName ? '12px' : '0px'
  const foreBlur = activeModelName ? '6px' : '0px'

  return (
    <>
      {/* Layer 1 - Background (le plus loin) */}
      <div
        className={`fixed inset-0`}
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
          transformOrigin: origin,
          transform: `scale(${bgScale})`,
          filter: `blur(${bgBlur})`,
          transition: 'transform 500ms ease-out, filter 500ms ease-out'
        }}
      />

      {/* Layer 2 - Midground (plan moyen) */}
      {midgroundImage && (
        <div
          className={`fixed inset-0`}
          style={{
            backgroundImage: `url(${midgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 2,
            transformOrigin: origin,
            filter: `blur(${midBlur})`,
            transition: 'transform 500ms ease-out, filter 500ms ease-out',
            opacity: 0.8
          }}
        />
      )}

      {/* Layer 3 - Foreground (premier plan) */}
      {foregroundImage && (
        <div
          className={`fixed inset-0`}
          style={{
            backgroundImage: `url(${foregroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 3,
            transformOrigin: origin,
            filter: `blur(${foreBlur})`,
            transition: 'transform 500ms ease-out, filter 500ms ease-out',
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
