import React, { useMemo } from 'react'
import { useActiveModel } from '../state/ActiveModelContext'
import { models, PORTAL_MODEL_NAME } from '../constants'
import { PressHoldButton } from './PressHoldButton'

export const ModelNavigator: React.FC = () => {
  const { activeModelName, selectModelByName, discoveredNames, facet, setFacet } = useActiveModel()
  const allModels = useMemo(() => models, [])
  const allNames = useMemo(() => allModels.map(m => m.name), [allModels])
  const displayNames = useMemo(() => allNames.filter(n => n !== PORTAL_MODEL_NAME), [allNames])
  const nameToFacet = useMemo(() => {
    const map = new Map<string, 'femtogo' | 'baby'>()
    for (const m of allModels) map.set(m.name, (m.facet ?? 'femtogo') as 'femtogo' | 'baby')
    return map
  }, [allModels])

  // Ordre de navigation selon la facette (exclure le portail)
  const orderedNames = useMemo(() => {
    if (facet === 'baby') {
      return allModels.filter(m => (m.facet ?? 'femtogo') === 'baby').map(m => m.name)
    }
    return displayNames
  }, [facet, allModels, displayNames])

  const discoveredSet = useMemo(() => new Set(discoveredNames), [discoveredNames])
  // Hooks toujours appelés, même si on rend null plus bas
  const babyNames = useMemo(
    () => allModels.filter(m => (m.facet ?? 'femtogo') === 'baby').map(m => m.name),
    [allModels]
  )
  const babyFoundAll = useMemo(() => {
    if (babyNames.length === 0) return false
    return babyNames.every(n => discoveredNames.includes(n))
  }, [babyNames, discoveredNames])
  const isActive = !!activeModelName
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
      {isActive && (
        <>
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
        </>
      )}

      {/* Indicateurs visibles uniquement en page détail (quand un modèle est actif) */}
      {isActive && (
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
          {displayNames.map((n) => (
            <div
              key={n}
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                boxSizing: 'border-box',
                border: discoveredNames.includes(n) ? '1px solid #fff' : '1px dashed rgba(255,255,255,0.35)',
                background: n === activeModelName ? '#fff' : 'transparent',
                transition: 'background 0.3s',
                // Griser les modèles de l'autre facette
                opacity: (facet === 'femtogo' && (nameToFacet.get(n) === 'baby')) || (facet === 'baby' && (nameToFacet.get(n) === 'femtogo')) ? 0.25 : 1,
              }}
            />
          ))}
        </div>
      )}
      {/* Fin de parcours Baby Hayabusa :
          une fois tous les modèles \"baby\" trouvés et aucun modèle actif,
          on affiche un PressHoldButton qui enverra vers la landing Baby Hayabusa. */}
      {facet === 'baby' && babyFoundAll && !isActive && (
        <div
          style={{
            position: 'fixed',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 11,
            pointerEvents: 'auto',
          }}
        >
          <PressHoldButton
            label="Press & hold to continue"
            enableShake={false}
            variant="light"
            onComplete={() => {
              window.dispatchEvent(new CustomEvent('baby:return-to-landing'))
            }}
          />
        </div>
      )}
    </div>
  )
}


