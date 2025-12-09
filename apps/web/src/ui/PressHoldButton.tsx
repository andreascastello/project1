import React, { useCallback, useRef, useState } from 'react'
import gsap from 'gsap'

interface PressHoldButtonProps {
  label?: string
  /** Durée nécessaire pour remplir complètement le bouton (en ms) */
  durationMs?: number
  /** Callback déclenché une seule fois lorsque le remplissage atteint 100 % */
  onComplete?: () => void
}

export const PressHoldButton: React.FC<PressHoldButtonProps> = ({
  label = 'Press & hold to start',
  durationMs = 1000,
  onComplete,
}) => {
  const [hasCompleted, setHasCompleted] = useState(false)

  const fillRef = useRef<HTMLDivElement | null>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  const resetFill = useCallback(() => {
    if (tweenRef.current) {
      tweenRef.current.kill()
      tweenRef.current = null
    }
    if (fillRef.current) {
      gsap.set(fillRef.current, {
        scaleX: 0,
        transformOrigin: '0% 50%', // gauche → droite
      })
    }
  }, [])

  const startHold = useCallback(() => {
    if (hasCompleted) return

    setHasCompleted(false)
    if (tweenRef.current) {
      tweenRef.current.kill()
      tweenRef.current = null
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
        if (onComplete) onComplete()
      },
    })
  }, [durationMs, hasCompleted, onComplete])

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
  }, [hasCompleted])

  return (
    <div className="flex items-center justify-center select-none">
      <div className="flex items-center justify-center gap-0 origin-center scale-50 md:scale-70">
        {/* Décor gauche */}
        <img
          src="/images/btn_heros.svg"
          alt=""
          aria-hidden="true"
          className="h-auto w-auto pointer-events-none -mr-7"
        />

        {/* Bouton central press & hold */}
        <button
          type="button"
          className="relative flex items-center justify-center outline-none"
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
        >
          <div className="relative w-[356px] h-[124px] flex items-center justify-center">
            {/* Wrapper masqué par le SVG : le masque est fixe, on révèle le fond noir à l’intérieur */}
            <div className="absolute inset-0 press-hold-mask z-0 overflow-hidden">
              <div
                ref={fillRef}
                className="h-full w-full bg-black"
                style={{ transform: 'scaleX(0)', transformOrigin: '0% 50%' }}
              />
            </div>

            {/* Capsule noire centrale toujours visible */}
            <div className="absolute z-10 px-2 py-3 bg-black flex items-center justify-center">
              <span className="text-white text-[12px] tracking-[0.12em] uppercase font-[Tusker Grotesk 5800 Super]">
                {label}
              </span>
            </div>
          </div>
        </button>

        {/* Décor droit (inversé horizontalement) */}
        <img
          src="/images/btn_heros.svg"
          alt=""
          aria-hidden="true"
          className="h-auto w-auto pointer-events-none -scale-x-100 -ml-7"
        />
      </div>
    </div>
  )
}

export default PressHoldButton


