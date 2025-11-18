import React, { useMemo, useRef, useLayoutEffect, useState } from 'react'
import { useActiveModel } from '../state/ActiveModelContext'
import { models } from '../models/models.config'

const FONT_STACK = `'SerpentCresh', 'Tusker Grotesk 5800 Super', 'Tusker Grotesk', 'Impact', 'Arial Black', system-ui, sans-serif`

function useMeasureWidth(text: string, gapPx: number, fontPx: number, letterSpacingEm: number) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(el.getBoundingClientRect().width + gapPx))
    ro.observe(el)
    setW(el.getBoundingClientRect().width + gapPx)
    return () => ro.disconnect()
  }, [text, gapPx, fontPx, letterSpacingEm])
  return { ref: measureRef, width: w }
}

export const AlbumMarquee: React.FC = () => {
  const { activeModelName } = useActiveModel()
  const model = useMemo(() => models.find(m => m.name === activeModelName) ?? null, [activeModelName])

  // Définir toutes les valeurs avant toute condition pour garder un ordre de hooks stable
  const gapPx = 55
  const fontPx = 120
  const letterSpacingEm = 0
  const text = (model?.albumTitle ?? '').toUpperCase()
  const speedSec = model?.marqueeSpeedSec ?? 30

  const { ref: measureRef, width: unitWidth } = useMeasureWidth(text, gapPx, fontPx, letterSpacingEm)
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920
  const reps = Math.max(3, Math.ceil(vw / Math.max(1, unitWidth)) + 2)
  const trackWidthPx = Math.max(1, unitWidth) * reps
  const animName = `marquee_left_${Math.round(trackWidthPx)}_${speedSec}`

  // Rendu conditionnel APRÈS les hooks pour éviter un ordre variable
  if (!model || !model.albumTitle) return null

  return (
    <>
      <div style={{ position: 'fixed', top: -9999, left: -9999 }}>
        <div
          ref={measureRef}
          style={{
            fontFamily: FONT_STACK,
            fontSize: `${fontPx}px`,
            letterSpacing: `${letterSpacingEm}em`,
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </div>
      </div>

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
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              whiteSpace: 'nowrap',
              willChange: 'transform',
              animation: `${animName} ${speedSec}s linear infinite`,
            }}
          >
            {/* Track A */}
            <div style={{ display: 'flex', gap: `${gapPx}px`, paddingRight: `${gapPx}px` }}>
              {Array.from({ length: reps }).map((_, i) => (
                <span
                  key={`a-${i}`}
                  style={{
                    fontFamily: FONT_STACK,
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
            {/* Track B (clone) */}
            <div style={{ display: 'flex', gap: `${gapPx}px`, paddingRight: `${gapPx}px` }}>
              {Array.from({ length: reps }).map((_, i) => (
                <span
                  key={`b-${i}`}
                  style={{
                    fontFamily: FONT_STACK,
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

      <style>{`
        @keyframes ${animName} {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${trackWidthPx}px); }
        }
      `}</style>
    </>
  )
}


