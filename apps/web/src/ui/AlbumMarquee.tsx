import React, { useMemo, useRef, useLayoutEffect, useState } from 'react'
import { useActiveModel } from '../state/ActiveModelContext'
import { models, ALBUM_MARQUEE_FONT_STACK } from '../constants'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

function useMeasureWidth(text: string, gapPx: number, fontPx: number, letterSpacingEm: number) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)

  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el) return
    const update = () => {
      setW(el.getBoundingClientRect().width + gapPx)
    }
    const ro = new ResizeObserver(update)
    ro.observe(el)
    update()
    return () => ro.disconnect()
  }, [text, gapPx, fontPx, letterSpacingEm])

  return { ref: measureRef, width: w }
}

export const AlbumMarquee: React.FC = () => {
  const { activeModelName } = useActiveModel()
  const model = useMemo(
    () => models.find(m => m.name === activeModelName) ?? null,
    [activeModelName]
  )

  const gapPx = 55
  const fontPx = 120
  const letterSpacingEm = 0
  const text = (model?.albumTitle ?? '').toUpperCase()
  const speedSec = model?.marqueeSpeedSec ?? 30

  const { ref: measureRef, width: unitWidth } = useMeasureWidth(
    text,
    gapPx,
    fontPx,
    letterSpacingEm
  )
  const trackRef = useRef<HTMLDivElement>(null)

  // calcul répètes + largeur (largeur d'un track A; Track B est sa copie)
  const { reps, trackWidthPx } = useMemo(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1920
    const safeUnit = Math.max(1, unitWidth)
    // Nombre de blocs nécessaires pour couvrir la largeur d'écran,
    // avec un peu de marge pour éviter les trous, sur UN seul track.
    const r = Math.max(3, Math.ceil(vw / safeUnit))
    return {
      reps: r,
      trackWidthPx: safeUnit * r,
    }
  }, [unitWidth])

  useGSAP(
    () => {
      const track = trackRef.current
      if (!track) return
      if (!text || trackWidthPx <= 0) return

      const tl = gsap.timeline()

      // Intro smooth de tout le bloc depuis le bas (sans accumuler les fades entre changements de modèle)
      tl.fromTo(
        track,
        { yPercent: 30, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        }
      )

      // Puis scroll infini, qui démarre juste après l'intro
      tl.to(track, {
        x: -trackWidthPx,
        duration: speedSec,
        ease: 'none',
        repeat: -1,
      })
    },
    { dependencies: [text, trackWidthPx, speedSec], scope: trackRef }
  )

  if (!model || !model.albumTitle) return null

  return (
    <>
      {/* mesure offscreen */}
      <div style={{ position: 'fixed', top: -9999, left: -9999 }}>
        <div
          ref={measureRef}
          style={{
            fontFamily: ALBUM_MARQUEE_FONT_STACK,
            fontSize: `${fontPx}px`,
            letterSpacing: `${letterSpacingEm}em`,
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </div>
      </div>

      {/* marquee */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 4,
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: '100%',
            overflowX: 'hidden',
            overflowY: 'visible',
            paddingTop: '10%',
            paddingBottom: '8px',
          }}
        >
          <div
            ref={trackRef}
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              whiteSpace: 'nowrap',
              willChange: 'transform',
            }}
          >
            {/* Track A */}
            <div
              style={{
                display: 'flex',
                gap: `${gapPx}px`,
                paddingRight: `${gapPx}px`,
              }}
            >
              {Array.from({ length: reps }).map((_, i) => (
                <span
                  className="marquee-title"
                  key={`a-${i}`}
                  style={{
                    fontFamily: ALBUM_MARQUEE_FONT_STACK,
                    fontSize: `${fontPx}px`,
                    letterSpacing: `${letterSpacingEm}em`,
                    lineHeight: 1.12,
                    color: '#C6C6C5',
                  }}
                >
                  {text}
                </span>
              ))}
            </div>

            {/* Track B */}
            <div
              style={{
                display: 'flex',
                gap: `${gapPx}px`,
                paddingRight: `${gapPx}px`,
              }}
            >
              {Array.from({ length: reps }).map((_, i) => (
                <span
                  key={`b-${i}`}
                  style={{
                    fontFamily: ALBUM_MARQUEE_FONT_STACK,
                    fontSize: `${fontPx}px`,
                    letterSpacing: `${letterSpacingEm}em`,
                    lineHeight: 1.12,
                    color: '#C6C6C5',
                  }}
                >
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}