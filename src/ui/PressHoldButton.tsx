import React, { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface PressHoldButtonProps {
  label?: string
  /** Durée nécessaire pour remplir complètement le bouton (en ms) */
  durationMs?: number
  /** Callback déclenché une seule fois lorsque le remplissage atteint 100 % */
  onComplete?: () => void
  /** Active ou non l'effet de tremblement global de la page */
  enableShake?: boolean
  /** Variante visuelle du bouton (noir par défaut, ou blanc) */
  variant?: 'dark' | 'light'
}

export const PressHoldButton: React.FC<PressHoldButtonProps> = ({
  label = 'Press & hold to start',
  durationMs = 1000,
  onComplete,
  enableShake = true,
  variant = 'dark',
}) => {
  const [hasCompleted, setHasCompleted] = useState(false)

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const fillRef = useRef<HTMLDivElement | null>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const pageShakeTlRef = useRef<gsap.core.Timeline | null>(null)

  // Échelle de base plus petite
  useEffect(() => {
    if (wrapperRef.current) {
      gsap.set(wrapperRef.current, { scale: 0.6, transformOrigin: '50% 50%' })
    }
  }, [])

  const startPageEffects = useCallback(() => {
    const rootEl = document.getElementById('root')
    if (!rootEl) return

    if (pageShakeTlRef.current) {
      pageShakeTlRef.current.kill()
      pageShakeTlRef.current = null
    }

    // Petit tremblement en boucle (encore un peu plus accentué)
    const tl = gsap.timeline({ repeat: -1, defaults: { duration: 0.035, ease: 'none' } })
    tl.to(rootEl, { x: -8, y: 3 })
      .to(rootEl, { x: 8, y: -3 })
      .to(rootEl, { x: -3, y: -8 })
      .to(rootEl, { x: 3, y: 8 })

    pageShakeTlRef.current = tl
  }, [])

  const stopPageEffects = useCallback((instant = false) => {
    const rootEl = document.getElementById('root')

    if (pageShakeTlRef.current) {
      pageShakeTlRef.current.kill()
      pageShakeTlRef.current = null
    }

    if (!rootEl) return

    gsap.to(rootEl, {
      x: 0,
      y: 0,
      duration: instant ? 0 : 0.25,
      ease: 'power2.out',
    })
  }, [])

  const startHold = useCallback(() => {
    if (hasCompleted) return

    setHasCompleted(false)
    if (tweenRef.current) {
      tweenRef.current.kill()
      tweenRef.current = null
    }

    if (enableShake) {
      startPageEffects()
    }

    if (!fillRef.current) return

    tweenRef.current = gsap.to(fillRef.current, {
      scaleX: 1,
      duration: durationMs / 1000,
      ease: 'linear',
      transformOrigin: '0% 50%',
      onComplete: () => {
        tweenRef.current = null
        setHasCompleted(true)
        if (enableShake) {
          stopPageEffects(true)
        }
        if (onComplete) onComplete()
      },
    })
  }, [durationMs, enableShake, hasCompleted, onComplete, startPageEffects, stopPageEffects])

  const endHold = useCallback(() => {
    if (hasCompleted) return
    if (tweenRef.current) {
      tweenRef.current.kill()
      tweenRef.current = null
    }
    if (fillRef.current) {
      gsap.to(fillRef.current, {
        scaleX: 0,
        duration: 0.3,
        ease: 'power2.out',
        transformOrigin: '0% 50%',
      })
    }
    if (enableShake) {
      stopPageEffects()
    }
  }, [enableShake, hasCompleted, stopPageEffects])

  const handleHoverIn = useCallback(() => {
    if (!wrapperRef.current) return
    gsap.to(wrapperRef.current, {
      scale: 0.7,
      duration: 0.4,
      ease: 'power3.out',
    })
  }, [])

  const handleHoverOut = useCallback(() => {
    if (!wrapperRef.current) return
    gsap.to(wrapperRef.current, {
      scale: 0.6,
      duration: 0.4,
      ease: 'power3.out',
    })
  }, [])

  return (
    // Conteneur extérieur ne bloque jamais les clics sur la scène 3D
    <div className="flex items-center justify-center select-none pointer-events-none">
      <div className="relative flex items-center justify-center">
        {/* Groupe global (décors + zone centrale) qui scale avec GSAP */}
        <div
          ref={wrapperRef}
          className="flex items-center justify-center gap-0 origin-center pointer-events-none"
        >
          {/* Décor gauche (non cliquable) */}
          <img
            src="/images/btn_heros.svg"
            alt=""
            aria-hidden="true"
            className={`h-auto w-auto pointer-events-none -mr-7 ${
              variant === 'light' ? 'invert' : ''
            }`}
          />

          {/* Bouton central uniquement sur la zone masquée (seule zone cliquable) */}
          <button
            type="button"
            className="relative flex items-center justify-center outline-none pointer-events-auto"
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            onMouseEnter={handleHoverIn}
            onMouseLeave={handleHoverOut}
          >
            {/* Zone centrale masquée par le SVG */}
            <div className="relative w-[356px] h-[124px] flex items-center justify-center">
              <div className="absolute inset-0 press-hold-mask z-0 overflow-hidden">
                <div
                  ref={fillRef}
                  className={`h-full w-full ${variant === 'light' ? 'bg-white' : 'bg-black'}`}
                  style={{ transform: 'scaleX(0)', transformOrigin: '0% 50%' }}
                />
              </div>
            </div>
          </button>

          {/* Décor droit (non cliquable, inversé horizontalement) */}
          <img
            src="/images/btn_heros.svg"
            alt=""
            aria-hidden="true"
            className={`h-auto w-auto pointer-events-none -scale-x-100 -ml-7 ${
              variant === 'light' ? 'invert' : ''
            }`}
          />
        </div>

        {/* Capsule texte indépendante, qui ne scale pas (hors wrapperRef) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={`px-2 py-3 flex items-center justify-center scale-60 ${
              variant === 'light' ? 'bg-white' : 'bg-black'
            }`}
          >
            <span
              className={`text-[12px] tracking-[0.12em] uppercase font-[Tusker Grotesk 5800 Super] ${
                variant === 'light' ? 'text-black' : 'text-white'
              }`}
            >
              {label}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PressHoldButton


