import React, { useState } from 'react'
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
import { LandingHero } from './ui/LandingHero'
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

// App wrapper avec tous les providers pour l'expérience 3D
const App: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'main'>('intro')

  if (phase === 'intro') {
    return (
      <LandingHero
        onIntroFinished={() => {
          setPhase('main')
        }}
      />
    )
  }

  return (
    <ActiveModelProvider>
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </ActiveModelProvider>
  )
}

export default App
