import React, { useMemo } from 'react'
import { useActiveModel } from '../state/ActiveModelContext'
import { models } from '../models/models.config'

export const ModelNavigator: React.FC = () => {
  const { activeModelName, selectModelByName } = useActiveModel()
  const names = useMemo(() => models.map(m => m.name), [])
  const isActive = !!activeModelName
  if (!isActive) return null

  const currentIndex = Math.max(0, names.findIndex(n => n === activeModelName))
  const goPrev = () => {
    const idx = (currentIndex - 1 + names.length) % names.length
    selectModelByName(names[idx])
  }
  const goNext = () => {
    const idx = (currentIndex + 1) % names.length
    selectModelByName(names[idx])
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
          cursor: 'pointer',
          color: '#fff',
          zIndex: 10,
          fontSize: 32,
          padding: '8px 10px',
          transition: 'opacity 0.2s',
          pointerEvents: 'auto',
        }}
        aria-label="Précédent"
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
          cursor: 'pointer',
          color: '#fff',
          zIndex: 10,
          fontSize: 32,
          padding: '8px 10px',
          transition: 'opacity 0.2s',
          pointerEvents: 'auto',
        }}
        aria-label="Suivant"
      >
        →
      </button>

      {/* Petits ronds d’indicateur */}
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
        {models.map((m) => (
          <div
            key={m.name}
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              boxSizing: 'border-box',
              border: '1px solid #fff',
              background: m.name === activeModelName ? '#fff' : 'transparent',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}


