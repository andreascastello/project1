import React, { useRef, useState } from 'react'
import gsap from 'gsap'
import { CustomEase, SplitText } from 'gsap/all'
import { useGSAP } from '@gsap/react'
import PressHoldButton from './PressHoldButton'
import IntroVideoTransition from './IntroVideoTransition'

// Enregistrer les plugins nécessaires pour cette page
gsap.registerPlugin(CustomEase, SplitText)

// Courbe d'animation personnalisée façon "hop"
CustomEase.create(
  'hop',
  'M0,0 C0.71,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1'
)

interface LandingHeroProps {
  onIntroFinished?: () => void
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onIntroFinished }) => {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      // Flag local pour éviter de ré-attacher les listeners plusieurs fois
      let hoverInitialized = false

      const ctx = gsap.context(() => {
        const heroSection = heroRef.current

        // --- SplitText + animation d'entrée du titre FEMTOGO puis du "welcome to" ---
        const femtoSplit = new SplitText('.femtogo-title', { type: 'chars' })
        const femtoChars = femtoSplit.chars as HTMLElement[]

        // Ajout de la classe pour le style/hover sur chaque caractère
        femtoChars.forEach((char) => char.classList.add('hover-char'))

        // Fonction qui n'active le hover qu'une fois l'intro terminée
        const setupHoverAfterIntro = () => {
          if (hoverInitialized) return
          hoverInitialized = true

          const previewContainer = previewRef.current
          const currentHeroSection = heroRef.current
          const hoverTargets = femtoChars
          const buttonEl = buttonRef.current

          if (!hoverTargets || hoverTargets.length === 0) return

          // On peut vivre sans previewContainer (juste pas d'images),
          // mais on a besoin du bouton pour l'unlock.
          if (!buttonEl) return

          let activeClientsIndex = -1
          let hoveredCount = 0
          const visited = new Array(hoverTargets.length).fill(false)
          let buttonShown = false

          hoverTargets.forEach((target, index) => {
            let activeClientImgWrapper: HTMLDivElement | null = null
            let activeClientImg: HTMLImageElement | null = null

            const handleMouseOver = () => {
              // Même logique que dans ton script : si c'est déjà l'actif, on ne refait rien
              if (activeClientsIndex === index) return

              // Si un autre texte est déjà actif, on déclenche son mouseout pour fermer proprement l'image
              if (activeClientsIndex !== -1) {
                const previousClient = hoverTargets[activeClientsIndex]
                const mouseoutEvent = new Event('mouseout')
                previousClient.dispatchEvent(mouseoutEvent)
              }

              activeClientsIndex = index

              // Marquer la lettre comme visitée pour le déblocage du bouton
              if (!visited[index]) {
                visited[index] = true
                hoveredCount += 1

                if (hoveredCount === hoverTargets.length && !buttonShown) {
                  buttonShown = true
                  // Révéler le bouton press & hold une fois que toutes les lettres ont été survolées
                  gsap.to(buttonEl, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.9,
                    ease: 'expo.out',
                    onStart: () => {
                      buttonEl.style.pointerEvents = 'auto'
                    },
                  })
                }
              }

              currentHeroSection?.classList.add('has-image')

              if (previewContainer) {
                const clientImgWrapper = document.createElement('div')
                clientImgWrapper.className =
                  'hero-img-wrapper absolute inset-0 overflow-hidden will-change-[clip-path]'

                const clientImg = document.createElement('img')

                // Chaque target utilise une image basée sur son index (img1.jpeg, img2.jpeg, etc.)
                clientImg.src = `/images/img${index + 1}.jpeg`
                clientImg.alt = 'Preview'
                // Remplir tout le cadre comme dans l'exemple de base
                clientImg.style.width = '100%'
                clientImg.style.height = '100%'
                clientImg.style.objectFit = 'cover'

                gsap.set(clientImg, { scale: 1.25, opacity: 0 })

                clientImgWrapper.appendChild(clientImg)
                previewContainer.appendChild(clientImgWrapper)

                activeClientImgWrapper = clientImgWrapper
                activeClientImg = clientImg

                // État initial : même clip-path que dans ton CSS (tout fermé au centre)
                gsap.set(clientImgWrapper, {
                  clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
                })

                // Ouverture du cadre
                gsap.to(clientImgWrapper, {
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                  duration: 0.5,
                  ease: 'hop',
                })

                // Apparition
                gsap.to(clientImg, {
                  opacity: 1,
                  duration: 0.25,
                  ease: 'power2.out',
                })

                gsap.to(clientImg, {
                  scale: 1,
                  duration: 1.25,
                  ease: 'power2.out',
                })
              }
            }

            const handleMouseOut = (event: Event) => {
              const e = event as MouseEvent
              // Comme dans ton script : si on passe d'un enfant du même élément, on ne ferme pas
              if (e.relatedTarget && (target as HTMLElement).contains(e.relatedTarget as Node)) return

              if (activeClientsIndex === index) {
                activeClientsIndex = -1
                currentHeroSection?.classList.remove('has-image')
              }

              if (activeClientImg && activeClientImgWrapper) {
                const clientImgToRemove = activeClientImg
                const clientImgWrapperToRemove = activeClientImgWrapper

                activeClientImg = null
                activeClientImgWrapper = null

                gsap.to(clientImgToRemove, {
                  opacity: 0,
                  duration: 0.5,
                  ease: 'power1.out',
                  onComplete: () => {
                    clientImgWrapperToRemove.remove()
                  },
                })
              }
            }

            target.addEventListener('mouseover', handleMouseOver)
            target.addEventListener('mouseout', handleMouseOut)
          })
        }

        if (femtoChars.length > 0) {
          // Timeline d'intro : FEMTOGO lettre par lettre, puis "welcome to"
          const introTl = gsap.timeline()

          introTl
            .from(femtoChars, {
              yPercent: 100,
              duration: 1.8,
              ease: 'expo.out',
              stagger: 0.05,
            })
            .from(
              '.sub-title',
              {
                y: 15,
                opacity: 0,
                duration: 0.6,
                ease: 'expo.out',
              },
              '-=1' // commence avant la fin complète de FEMTOGO pour apparaître plus vite
            )
            // À la fin de la timeline, on active le hover
            .add(setupHoverAfterIntro)
        }

      }, rootRef)

      return () => {
        ctx.revert()
      }
    },
    { scope: rootRef }
  )

  return (
    <div
      ref={rootRef}
      className="min-h-screen w-full bg-[#FAFAFA] text-black relative overflow-x-hidden"
    >
      <div>
        {/* Section texte d’accueil façon affiche */}
        <section
          id="hero"
          ref={heroRef}
          className="relative flex flex-col items-center justify-center h-screen px-6 text-black overflow-hidden"
        >
          {/* Aperçu d'image centré, dimensionné comme dans le projet initial */}
          <div
            ref={previewRef}
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] h-[75vh] z-10"
          />

          {/* Bloc central : titres */}
          <div className="relative w-full flex flex-col items-center justify-center flex-1">
            {/* Conteneur commun pour aligner les largeurs */}
            <div className="relative w-full max-w-5xl">
              {/* Gros FEMTOGO en arrière-plan, split par SplitText, uniquement en contour */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <h1
                  className="femtogo-title block w-full text-center leading-none tracking-tight 
                  text-[20vw] md:text-[14vw] cursor-pointer"
                >
                  FEMTOGO
                </h1>
              </div>

              {/* Texte welcome to centré horizontalement mais positionné vers le bas du hero */}
              <div className="sub-title absolute inset-x-0 top-1/2 -translate-y-1/2 
              translate-y-[-15%] flex items-center justify-center pointer-events-none z-20">
                <h2
                  className="block w-full text-center 
                  leading-none text-[15vw] md:text-[9.6vw] select-none 
                  pointer-events-none text-white stroke-black-shadow"
                >
                  Welcome to
                </h2>
              </div>
            </div>

          </div>

          {/* Bouton press & hold en bas du hero, qui n'apparaît qu'après hover sur toutes les lettres */}
          <div
            ref={buttonRef}
            className="hero-press-hold absolute bottom-1 left-1/2 -translate-x-1/2 z-30 opacity-0 pointer-events-none translate-y-4"
          >
            <PressHoldButton onComplete={() => {
              // Quand le bouton est complètement rempli : lancer la transition vidéo
              window.dispatchEvent(new CustomEvent('femtogo:intro-complete'))
            }} />
          </div>
        </section>
      </div>
      {/* Overlay de transition vidéo d'intro */}
      <IntroVideoTransitionWrapper onFinished={onIntroFinished} />
    </div>
  )
}

export default LandingHero

// Petit wrapper pour connecter l'événement global du bouton à la transition vidéo
const IntroVideoTransitionWrapper: React.FC<{ onFinished?: () => void }> = ({ onFinished }) => {
  const [active, setActive] = useState(false)

  React.useEffect(() => {
    const handler = () => setActive(true)
    window.addEventListener('femtogo:intro-complete', handler)
    return () => window.removeEventListener('femtogo:intro-complete', handler)
  }, [])

  return <IntroVideoTransition isActive={active} onComplete={onFinished} />
}
