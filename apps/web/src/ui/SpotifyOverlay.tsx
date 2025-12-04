import React, { useRef } from 'react'
import { models } from '../constants'
import { useActiveModel } from '../state/ActiveModelContext'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const CARD_WIDTH = 300
const GAP_RIGHT = 200
const ANIM_SEC = 0.8

export const SpotifyOverlay: React.FC = () => {
  const { activeModelName } = useActiveModel()
  const cardRef = useRef<HTMLDivElement>(null)

  // Animation d'entrée smooth du player Spotify lorsque l'on arrive sur la page détail
  useGSAP(
    () => {
      const card = cardRef.current
      if (!card) return
      if (!activeModelName) return
      // Masquer immédiatement l'ancien contenu, pour éviter de voir le changement d'album
      gsap.set(card, { x: 20, opacity: 0 })

      // Puis faire entrer le nouveau player avec un léger décalage
      gsap.to(card, {
        x: 0,
        opacity: 1,
        duration: ANIM_SEC,
        delay: ANIM_SEC, // laisser le temps au marquee / 3D et au nouvel embed de se charger
        ease: 'power3.out',
      })
    },
    { dependencies: [activeModelName], scope: cardRef }
  )

  if (!activeModelName) return null

  const config = models.find(m => m.name === activeModelName)
  if (!config || !config.spotifyEmbedUrl) return null

  // Construit l'URL d'embed finale avec les paramètres recommandés par Spotify
  const iframeSrc = config.spotifyEmbedUrl.includes('?')
    ? `${config.spotifyEmbedUrl}&utm_source=generator&theme=0`
    : `${config.spotifyEmbedUrl}?utm_source=generator&theme=0`

  return (
    <div
      style={{
        position: 'fixed',
        top: '54%',
        right: GAP_RIGHT,
        zIndex: 60,
        width: CARD_WIDTH,
        pointerEvents: 'none',
        transform: 'translateY(-50%)',
      }}
      aria-live="polite"
    >
      <div
        ref={cardRef}
        style={{
          pointerEvents: 'auto',
          // Rendu 100% natif Spotify: pas de fond ni bordure ni ombre
        }}
      >
        <iframe
          data-testid="embed-iframe"
          title={`Spotify - ${config.albumTitle ?? activeModelName}`}
          src={iframeSrc}
          width="100%"
          height="450"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          style={{ borderRadius: 12, display: 'block' }}
        />
      </div>

    </div>
  )
}


