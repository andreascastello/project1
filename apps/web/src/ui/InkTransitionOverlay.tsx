import React, { useMemo, useRef } from 'react'
import { useActiveModel } from '../state/ActiveModelContext'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export const InkTransitionOverlay: React.FC = () => {
  const { inkVisible, stopInk } = useActiveModel()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const inkUrl = useMemo(() => new URL('../assets/ink.webm', import.meta.url).href, [])

  useGSAP(
    () => {
      const container = containerRef.current
      const video = videoRef.current
      if (!container) return

      if (inkVisible) {
        gsap.fromTo(
          container,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: 'power2.out' }
        )
        if (video) {
          try {
            video.playbackRate = 4
            video.currentTime = 0
            video.play().catch(() => {})
          } catch {}
        }
      } else {
        gsap.to(container, { opacity: 0, duration: 0.35, ease: 'power2.inOut' })
        if (video) {
          try { video.pause() } catch {}
          try { video.currentTime = 0 } catch {}
        }
      }
    },
    { dependencies: [inkVisible], scope: containerRef }
  )

  return (
    <div
      ref={containerRef}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'transparent',
        pointerEvents: 'none',
        // Valeur initiale uniquement; GSAP gère ensuite l'opacity.
        opacity: 0,
      }}
    >
      <video
        ref={videoRef}
        src={inkUrl}
        playsInline
        muted
        preload="auto"
        onEnded={() => stopInk()}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}

