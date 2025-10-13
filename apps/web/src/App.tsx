import React from 'react'
import { LoadingProvider, useLoading } from './providers/LoadingProvider'
import { ActiveModelProvider, useActiveModel } from './state/ActiveModelContext'
import { LoadingScreen } from './components/LoadingScreen'
import { SceneCanvas } from './canvas/SceneCanvas'
import { CSSBackground } from './components/CSSBackground'
import { AlbumMarquee } from './ui/AlbumMarquee'
import { ModelNavigator } from './ui/ModelNavigator'
import { ErrorBoundary } from './components/ErrorBoundary'
import './App.css'

// Composant principal de l'application avec cache
const AppContent: React.FC = () => {
  const { isLoading, progress, loadedCount, totalModels, error } = useLoading()
  const { activeModelName } = useActiveModel()

  // Afficher l'écran de loading tant que les modèles ne sont pas chargés
  if (isLoading || error) {
    return (
      <LoadingScreen 
        progress={progress}
        loadedCount={loadedCount}
        totalModels={totalModels}
        error={error}
      />
    )
  }

  // Une fois les modèles chargés, afficher l'application principale ultra fluide
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
      <div className="absolute top-8 left-8 text-white z-10 pointer-events-none" style={{ zIndex: 10 }}>
        <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">FEMTOGO - Collection 3D</h1>
        <p className="text-lg opacity-90 drop-shadow-md">
          {activeModelName ? 'Mode 3D actif - Utilisez la souris pour explorer' : 'Cliquez sur un élément pour l\'explorer'}
        </p>
        {activeModelName && <p className="text-sm opacity-75 mt-1">Modèle actif : {activeModelName}</p>}
      </div>
    </div>
  )
}

// App wrapper avec tous les providers
const App: React.FC = () => {
  return (
    <LoadingProvider>
      <ActiveModelProvider>
        <AppContent />
      </ActiveModelProvider>
    </LoadingProvider>
  )
}

export default App
