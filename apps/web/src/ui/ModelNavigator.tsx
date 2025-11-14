import React, { useMemo } from 'react'
import { useActiveModel } from '../state/ActiveModelContext'
import { models } from '../models/models.config'

export const ModelNavigator: React.FC = () => {
  const { activeModelName, selectModelByName, discoveredNames } = useActiveModel()
  const allNames = useMemo(() => models.map(m => m.name), [])
  // Ordre "normal" de navigation (exclure le portail)
  const orderedNames = useMemo(() => allNames.filter(n => n !== 'Faded Flower'), [allNames])
  const discoveredSet = useMemo(() => new Set(discoveredNames), [discoveredNames])
  const isActive = !!activeModelName
  // Pas d'overlay si aucun actif
  if (!isActive) return null
  const discoveredCountInOrder = orderedNames.filter(n => discoveredSet.has(n)).length
  const canNavigate = discoveredCountInOrder >= 2

  const currentIndex = Math.max(0, orderedNames.findIndex(n => n === activeModelName))
  const goPrev = () => {
    if (!canNavigate) return
    const len = orderedNames.length
    for (let step = 1; step <= len; step++) {
      const idx = (currentIndex - step + len) % len
      const candidate = orderedNames[idx]
      if (discoveredSet.has(candidate)) {
        selectModelByName(candidate)
        break
      }
    }
  }
  const goNext = () => {
    if (!canNavigate) return
    const len = orderedNames.length
    for (let step = 1; step <= len; step++) {
      const idx = (currentIndex + step) % len
      const candidate = orderedNames[idx]
      if (discoveredSet.has(candidate)) {
        selectModelByName(candidate)
        break
      }
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
      {/* Left arrow */}
      <button
        onClick={goPrev}
        style={{
          position: 'absolute',
          left: 30,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          cursor: canNavigate ? 'pointer' : 'not-allowed',
          color: '#fff',
          zIndex: 10,
          fontSize: 32,
          padding: '8px 10px',
          transition: 'opacity 0.2s',
          pointerEvents: 'auto',
          opacity: canNavigate ? 1 : 0.35,
        }}
        aria-label="Précédent"
        disabled={!canNavigate}
      >
        ←
      </button>

      {/* Right arrow */}
      <button
        onClick={goNext}
        style={{
          position: 'absolute',
          right: 30,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          cursor: canNavigate ? 'pointer' : 'not-allowed',
          color: '#fff',
          zIndex: 10,
          fontSize: 32,
          padding: '8px 10px',
          transition: 'opacity 0.2s',
          pointerEvents: 'auto',
          opacity: canNavigate ? 1 : 0.35,
        }}
        aria-label="Suivant"
        disabled={!canNavigate}
      >
        →
      </button>

      {/* Petits ronds d’indicateur (affichés dès le 1er découvert) */}
      <div
        style={{
          position: 'fixed',
          bottom: 30,
          left: 30,
          display: 'flex',
          gap: 10,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        {orderedNames.map((n) => (
          <div
            key={n}
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              boxSizing: 'border-box',
              border: discoveredNames.includes(n) ? '1px solid #fff' : '1px dashed rgba(255,255,255,0.3)',
              background: n === activeModelName ? '#fff' : 'transparent',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}


