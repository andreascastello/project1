import React from 'react'
import { useActiveModel } from '../state/ActiveModelContext'

export const FacetTransitionOverlay: React.FC = () => {
  const { transitionQuote } = useActiveModel()
  const visible = !!transitionQuote

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#000',
        color: '#fff',
        fontFamily: '"Beauty Swing Personal Use", serif',
        display: 'grid',
        placeItems: 'center',
        pointerEvents: visible ? 'auto' : 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 400ms ease',
      }}
    >
      {visible && (
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <div style={{ fontSize: 30, marginBottom: 14 }}>
            “{transitionQuote}”
          </div>
          <div style={{ fontSize: 30 }}>
            FEMTOGO - UN AUTRE JOUR
          </div>
        </div>
      )}
    </div>
  )
}


