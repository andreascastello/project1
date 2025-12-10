import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface IntroVideoTransitionProps {
  /** Active la transition vers la vidéo lorsqu'il passe à true */
  isActive: boolean
  /** Optionnel : callback quand l'animation principale est terminée */
  onComplete?: () => void
}

export const IntroVideoTransition: React.FC<IntroVideoTransitionProps> = ({
  isActive,
  onComplete,
}) => {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const bgVideoRef = useRef<HTMLVideoElement | null>(null)
  const fgVideoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!isActive || !overlayRef.current) return

    const ctx = gsap.context((context) => {
      const overlay = overlayRef.current
      const bgVideo = bgVideoRef.current
      const fgVideo = fgVideoRef.current
      if (!overlay || !bgVideo || !fgVideo) return

      // On prépare les vidéos à partir du début mais on NE les joue PAS encore.
      bgVideo.pause()
      fgVideo.pause()
      bgVideo.currentTime = 0
      fgVideo.currentTime = 0

      gsap.set(overlay, { autoAlpha: 0 })
      // Vidéo de fond : zoomée pour vraiment remplir tout l'écran (reste figée ensuite)
      // On la décale légèrement vers la gauche avec xPercent
      gsap.set(bgVideo, { autoAlpha: 0, scale: 2, xPercent: -5, transformOrigin: '50% 50%' })
      // Vidéo centrale : plus petite, qui apparaîtra après un léger délai
      gsap.set(fgVideo, { autoAlpha: 0, scale: 0.5, transformOrigin: '50% 50%' })

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
      })

      tl.to(overlay, {
        autoAlpha: 1,
        duration: 0.8,
        ease: 'power2.inOut',
      })
        .to(
          bgVideo,
          {
            autoAlpha: 0.4,
            duration: 0.8,
          },
          '<'
        )
        .to(
          fgVideo,
          {
            autoAlpha: 1,
            scale: 0.5,
            duration: 0.9,
            // Quand la petite vidéo est totalement apparue, on lance les deux lectures en même temps
            onComplete: () => {
              bgVideo.play().catch(() => {})
              fgVideo.play().catch(() => {})
            },
          },
          '+=0.5' // commence un peu après que le fond soit en place
        )

      let finished = false
      let endTimeout: number | null = null

      const finishTransition = () => {
        if (finished) return
        finished = true

        if (endTimeout !== null) {
          window.clearTimeout(endTimeout)
          endTimeout = null
        }

        // Fin : on éteint les vidéos et on termine sur un écran noir plein
        const endTl = gsap.timeline({
          onComplete: () => {
            if (onComplete) onComplete()
          },
        })

        endTl
          .to(
            [fgVideo, bgVideo],
            {
              autoAlpha: 0,
              duration: 0.6,
              ease: 'power2.in',
            },
          )
          .to(
            overlay,
            {
              backgroundColor: '#000000',
              duration: 0.5,
              ease: 'power2.inOut',
            },
            '<'
          )
      }

      const handleEnded = () => {
        finishTransition()
      }

      // Fallback : timer basé sur la durée réelle de la vidéo centrale
      const scheduleEndTimeout = () => {
        if (!fgVideo.duration || Number.isNaN(fgVideo.duration)) return
        const remainingMs = (fgVideo.duration - fgVideo.currentTime) * 1000
        if (remainingMs > 0) {
          endTimeout = window.setTimeout(() => {
            finishTransition()
          }, remainingMs)
        }
      }

      if (fgVideo.readyState >= 1 && !Number.isNaN(fgVideo.duration)) {
        scheduleEndTimeout()
      } else {
        fgVideo.addEventListener('loadedmetadata', scheduleEndTimeout, { once: true })
      }

      fgVideo.addEventListener('ended', handleEnded)
      context.add(() => {
        fgVideo.removeEventListener('ended', handleEnded)
      })
    }, overlayRef)

    return () => {
      ctx.revert()
    }
  }, [isActive, onComplete])

  if (!isActive) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#AF0C08' }}
    >
      {/* Vidéo de fond, en transparence au-dessus du fond rouge */}
      <video
        ref={bgVideoRef}
        src="/videos/intro.webm"
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
      />

      {/* Vidéo principale centrée */}
      <video
        ref={fgVideoRef}
        src="/videos/intro.webm"
        className="relative w-full max-w-2xl aspect-video object-cover"
        muted
        playsInline
      />
    </div>
  )
}

export default IntroVideoTransition


