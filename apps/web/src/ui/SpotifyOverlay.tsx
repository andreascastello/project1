import React from 'react'
import { models } from '../constants'
import { useActiveModel } from '../state/ActiveModelContext'

const CARD_WIDTH = 300
const GAP_RIGHT = 200
const ANIM_MS = 500

export const SpotifyOverlay: React.FC = () => {
  const { activeModelName } = useActiveModel()

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
        style={{
          pointerEvents: 'auto',
          // Rendu 100% natif Spotify: pas de fond ni bordure ni ombre
          transform: 'translateY(8px)',
          opacity: 0,
          animation: `spotify-enter ${ANIM_MS}ms ease forwards`,
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

      <style>{`
        @keyframes spotify-enter {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}


