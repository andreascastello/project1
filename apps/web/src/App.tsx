import React, { useEffect, useState } from 'react'
import { LoadingProvider, useLoading } from './providers/LoadingProvider'
import { ActiveModelProvider, useActiveModel } from './state/ActiveModelContext'
import { LoadingScreen } from './components/LoadingScreen'
import { SceneCanvas } from './canvas/SceneCanvas'
import { CSSBackground } from './components/CSSBackground'
import { AlbumMarquee } from './ui/AlbumMarquee'
import { ModelNavigator } from './ui/ModelNavigator'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SpotifyOverlay } from './ui/SpotifyOverlay'
import { InkTransitionOverlay } from './ui/InkTransitionOverlay'
import { MouseHintOverlay } from './ui/MouseHintOverlay'
import { LandingHero } from './ui/LandingHero'
import { BabyLandingHero } from './ui/BabyLandingHero'
import './App.css'

// Composant principal de l'application actuelle (expérience 3D)
const AppContent: React.FC = () => {
  const { isLoading, progress, loadedCount, totalModels, error } = useLoading()
  const { activeModelName } = useActiveModel()

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* Background CSS 3 layers - ultra optimisé */}
      <CSSBackground />
      <AlbumMarquee />
      <ModelNavigator />
      
      {/* Canvas 3D unique avec filtre N&B */}
      <ErrorBoundary>
        <SceneCanvas />
      </ErrorBoundary>
      
      {/* UI overlay optimisé */}
      <SpotifyOverlay />
      <InkTransitionOverlay />

      {/* Écran de loading en overlay pendant que les modèles 3D se chargent réellement,
          avec un fondu doux à la disparition */}
      <LoadingScreen
        progress={progress}
        loadedCount={loadedCount}
        totalModels={totalModels}
        error={error}
        visible={isLoading || !!error}
      />
    </div>
  )
}

// Petit overlay de fade blanc réutilisable
const WhiteFadeOverlay: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#FAFAFA',
        pointerEvents: 'none',
        opacity: active ? 1 : 0,
        transition: 'opacity 0.6s ease-in-out',
        zIndex: 200,
      }}
    />
  )
}

// App wrapper avec tous les providers pour l'expérience 3D
const App: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'main' | 'babyLanding'>('intro')
  const [babyFadeActive, setBabyFadeActive] = useState(false)

  // Écoute globale : quand le PressHoldButton de fin Baby Hayabusa est complété,
  // on lance un fade blanc puis on passe sur la landing Baby.
  useEffect(() => {
    const handler = () => {
      setBabyFadeActive(true)

      // Laisser le temps au fade d'arriver à 100 %, puis changer de phase
      const toLanding = setTimeout(() => {
        setPhase('babyLanding')
      }, 600)

      // Puis retirer doucement le fade (il disparaît sur BabyLanding, fond déjà blanc)
      const clearFade = setTimeout(() => {
        setBabyFadeActive(false)
      }, 1200)

      return () => {
        clearTimeout(toLanding)
        clearTimeout(clearFade)
      }
    }

    window.addEventListener('baby:return-to-landing', handler)
    return () => window.removeEventListener('baby:return-to-landing', handler)
  }, [])

  let content: React.ReactNode

  if (phase === 'intro') {
    content = (
      <LandingHero
        onIntroFinished={() => {
          setPhase('main')
        }}
      />
    )
  } else if (phase === 'babyLanding') {
    content = <BabyLandingHero />
  } else {
    content = (
      <ActiveModelProvider>
        <LoadingProvider>
          <AppContent />
        </LoadingProvider>
      </ActiveModelProvider>
    )
  }

  return (
    <>
      {content}
      {/* Overlay global pour les hints souris (actif sur toutes les phases) */}
      <MouseHintOverlay />
      <WhiteFadeOverlay active={babyFadeActive} />
    </>
  )
}

export default App
