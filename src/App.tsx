import React, { useEffect, useState } from 'react'
import { LoadingProvider, useLoading } from './providers/LoadingProvider'
import { ActiveModelProvider } from './state/ActiveModelContext'
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
import { ThanksPage } from './ui/ThanksPage'
import './App.css'
// Préchargement des modèles 3D (exécute useGLTF.preload pour chaque GLB dès le chargement de l'app)
import './hooks/useStableModelCache'

// Composant principal de l'application actuelle (expérience 3D)
const AppContent: React.FC = () => {
  const { isLoading, error } = useLoading()

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

const DESKTOP_MIN_WIDTH = 1024

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= DESKTOP_MIN_WIDTH,
  )

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_MIN_WIDTH)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return isDesktop
}

const App: React.FC = () => {
  const isDesktop = useIsDesktop()
  const [bootLoading, setBootLoading] = useState(true)
  const [phase, setPhase] = useState<'intro' | 'main' | 'babyLanding' | 'thanks'>('intro')
  const [babyFadeActive, setBabyFadeActive] = useState(false)
  const [thanksFadeActive, setThanksFadeActive] = useState(false)

  // Splash de boot blanc tout au début pour laisser le temps aux fontes/GSAP de s'initialiser
  useEffect(() => {
    let timeoutId: number | undefined
    let cancelled = false

    const finish = async () => {
      try {
        // Attendre que les polices soient prêtes si l'API est disponible
        const anyDoc = document as any
        if (anyDoc.fonts && anyDoc.fonts.ready) {
          await anyDoc.fonts.ready
        }
      } catch {
        // On ignore silencieusement si l'API n'est pas dispo
      }
      if (cancelled) return
      // Petit délai minimum pour éviter un flash trop court
      timeoutId = window.setTimeout(() => setBootLoading(false), 400)
    }

    if (document.readyState === 'complete') {
      void finish()
    } else {
      window.addEventListener('load', finish, { once: true } as any)
    }

    return () => {
      cancelled = true
      if (timeoutId) window.clearTimeout(timeoutId)
      window.removeEventListener('load', finish as any)
  }
  }, [])

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

  // Écoute globale : quand le PressHoldButton de fin de parcours Baby est complété,
  // on lance un fade blanc puis on passe sur la page de remerciements.
  useEffect(() => {
    const handler = () => {
      setThanksFadeActive(true)

      const toThanks = setTimeout(() => {
        setPhase('thanks')
      }, 600)

      const clearFade = setTimeout(() => {
        setThanksFadeActive(false)
      }, 1200)

      return () => {
        clearTimeout(toThanks)
        clearTimeout(clearFade)
      }
    }

    window.addEventListener('thanks:outro-complete', handler)
    return () => window.removeEventListener('thanks:outro-complete', handler)
  }, [])

  let content: React.ReactNode

  if (!isDesktop) {
    content = (
      <div className="w-full h-screen bg-white text-black flex flex-col items-center justify-center px-8 text-center">
        <p className="text-xs tracking-[0.35em] uppercase mb-4">
          Desktop experience only
        </p>
        <p className="text-sm sm:text-base max-w-md">
          Please visit on a computer.
        </p>
      </div>
    )
  } else if (phase === 'intro') {
    content = (
      <LandingHero
        onIntroFinished={() => {
          setPhase('main')
        }}
      />
    )
  } else if (phase === 'babyLanding') {
    content = <BabyLandingHero />
  } else if (phase === 'thanks') {
    content = <ThanksPage />
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
      <WhiteFadeOverlay active={babyFadeActive || thanksFadeActive} />
      {bootLoading && (
        <LoadingScreen
          visible
          error={null}
          variant="light"
        />
      )}
    </>
  )
}

export default App
