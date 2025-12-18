import React, { useRef, useState, useEffect } from 'react'
import { useActiveModel } from '../state/ActiveModelContext'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { TRANSITION_QUOTE, TRANSITION_ARTIST_TITLE } from '../constants'

const QUOTE_DISPLAY_SECONDS = 2.5
const MID_OFFSET_SECONDS = 0.21 // léger décalage après le milieu de la vidéo

export const InkTransitionOverlay: React.FC = () => {
  const { inkVisible, stopInk, facet, setFacet } = useActiveModel()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const midPauseHandleRef = useRef<gsap.core.Tween | null>(null)
  const quoteHideHandleRef = useRef<gsap.core.Tween | null>(null)
  const [showQuote, setShowQuote] = useState(false)
  const quoteRef = useRef<HTMLDivElement | null>(null)
  const facetRef = useRef(facet)

  // On simplifie : on utilise toujours la version webm
  const inkVideoSrc = '/videos/ink.webm'

  useEffect(() => {
    facetRef.current = facet
  }, [facet])

  useGSAP(
    () => {
      const container = containerRef.current
      const video = videoRef.current
      if (!container) return

      if (inkVisible) {
        // Apparition de la couche d'encre
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

            const scheduleMidPauseAndQuote = () => {
              if (!video.duration || Number.isNaN(video.duration)) return
              const playbackRate = video.playbackRate || 1
              const midDelay = (video.duration / 2 + MID_OFFSET_SECONDS) / playbackRate

              if (midPauseHandleRef.current && typeof midPauseHandleRef.current.kill === 'function') {
                midPauseHandleRef.current.kill()
              }
              if (quoteHideHandleRef.current && typeof quoteHideHandleRef.current.kill === 'function') {
                quoteHideHandleRef.current.kill()
              }

              midPauseHandleRef.current = gsap.to({}, {
                duration: midDelay,
                onComplete: () => {
                  try {
                    video.pause()
                  } catch {}

                  // Changer de facette exactement au moment où la citation apparaît
                  if (facetRef.current === 'femtogo') {
                    setFacet('baby')
                  }

                  setShowQuote(true)

                  quoteHideHandleRef.current = gsap.to({}, {
                    duration: QUOTE_DISPLAY_SECONDS,
                    onComplete: () => {
                      setShowQuote(false)
                      try {
                        video.play().catch(() => {})
                      } catch {}
                    }
                  })
                }
              })
            }

            if (video.readyState >= 1 && !Number.isNaN(video.duration)) {
              scheduleMidPauseAndQuote()
            } else {
              const onLoaded = () => {
                scheduleMidPauseAndQuote()
              }
              video.addEventListener('loadedmetadata', onLoaded, { once: true })
            }
          } catch {}
        }
      } else {
        // Disparition de la couche d'encre
        gsap.to(container, { opacity: 0, duration: 0.35, ease: 'power2.inOut' })

        if (midPauseHandleRef.current && typeof midPauseHandleRef.current.kill === 'function') {
          midPauseHandleRef.current.kill()
          midPauseHandleRef.current = null
        }
        if (quoteHideHandleRef.current && typeof quoteHideHandleRef.current.kill === 'function') {
          quoteHideHandleRef.current.kill()
          quoteHideHandleRef.current = null
        }

        setShowQuote(false)

        if (video) {
          try { video.pause() } catch {}
          try { video.currentTime = 0 } catch {}
        }
      }
    },
    { dependencies: [inkVisible], scope: containerRef }
  )

  // Animation d'apparition / disparition de la citation
  useGSAP(
    () => {
      const el = quoteRef.current
      if (!el) return

      // On s'assure qu'aucun tween précédent ne vient interférer
      gsap.killTweensOf(el)

      if (showQuote) {
        gsap.fromTo(
          el,
          { opacity: 0, x: 50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            ease: 'power2.out',
          }
        )
      } else {
        gsap.to(el, {
          // Le texte glisse vers la gauche en disparaissant
          x: -100,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
        })
      }
    },
    { dependencies: [showQuote], scope: quoteRef }
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
      {showQuote && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            pointerEvents: 'none',
          }}
        >
          <div
            ref={quoteRef}
            style={{
              color: '#fff',
              fontFamily: '"Beauty Swing Personal Use", serif',
              textAlign: 'center',
              padding: '0 24px',
            }}
          >
            <div style={{ fontSize: 30, marginBottom: 14 }}>
              “{TRANSITION_QUOTE}”
            </div>
            <div style={{ fontSize: 30 }}>
              {TRANSITION_ARTIST_TITLE}
            </div>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        src={inkVideoSrc}
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

