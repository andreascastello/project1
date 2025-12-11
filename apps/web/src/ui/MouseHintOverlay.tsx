import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/**
 * Overlay de texte qui suit la souris.
 * Le message affiché dépend de l'attribut `data-mouse-hint` le plus proche
 * dans la hiérarchie DOM sous le curseur.
 */
export const MouseHintOverlay: React.FC = () => {
  const [hint, setHint] = useState<string | null>(null)
  const bubbleRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const bubble = bubbleRef.current
      if (!bubble) return

      const { clientX, clientY } = event

      // Suivi smooth de la souris
      gsap.to(bubble, {
        x: clientX + 16,
        y: clientY + 16,
        // Durée un peu plus longue pour créer un léger décalage
        duration: 0.7,
        ease: 'power3.out',
      })

      // Cherche un data-mouse-hint sur la cible ou ses parents
      let node = event.target as HTMLElement | null
      let found: string | null = null
      while (node) {
        if (node.getAttribute) {
          const attr = node.getAttribute('data-mouse-hint')
          if (attr) {
            found = attr
            break
          }
        }
        node = node.parentElement
      }

      setHint(found)
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  // Pas de hint actif → rien à afficher
  const isVisible = !!hint

  return (
    <div
      ref={bubbleRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 150,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease-out',
      }}
    >
      {hint && (
        <div
          style={{
            padding: '6px 12px',
            borderRadius: 999,
            color: '#B3B3B3',
            fontSize: 11,
            letterSpacing: '0.08em',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          {hint}
        </div>
      )}
    </div>
  )
}

export default MouseHintOverlay
