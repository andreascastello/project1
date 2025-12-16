import React, { useRef } from 'react'
import gsap from 'gsap'
import { CustomEase, SplitText } from 'gsap/all'
import { useGSAP } from '@gsap/react'
import PressHoldButton from './PressHoldButton'

// Plugins GSAP nécessaires pour cette page
gsap.registerPlugin(CustomEase, SplitText)

// Même courbe "hop" que sur la page FEMTOGO
CustomEase.create(
  'hop',
  'M0,0 C0.71,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1'
)

export const BabyLandingHero: React.FC = () => {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      let hoverInitialized = false

      const ctx = gsap.context(() => {
        const heroSection = heroRef.current

        // Split du titre par mots (pour le hover) + chars (pour ajuster le dernier char spécial)
        const split = new SplitText('.baby-title', { type: 'words,chars' })
        const words = split.words as HTMLElement[]
        const chars = split.chars as HTMLElement[]

        // Classe pour gérer le hover mot par mot
        words.forEach((word) => word.classList.add('hover-word'))

        // Ajuster l'espacement entre le dernier \"a\" de Hayabusa et le char spécial final
        // -> on applique un léger margin-left négatif sur le tout dernier char
        const lastChar = chars[chars.length - 1]
        if (lastChar) {
          lastChar.style.marginLeft = '-0.6em'
        }

        const setupHover = () => {
          if (hoverInitialized) return
          hoverInitialized = true

          const previewContainer = previewRef.current
          const currentHeroSection = heroSection
          const buttonEl = buttonRef.current

          if (!words || words.length === 0 || !previewContainer) return

          let activeIndex = -1
          let hoveredCount = 0
          const visited = new Array(words.length).fill(false)
          let buttonShown = false

          words.forEach((target, index) => {
            let activeWrapper: HTMLDivElement | null = null
            let activeImg: HTMLImageElement | null = null

            const handleMouseOver = () => {
              if (activeIndex === index) return

              // Fermer proprement l'image précédente si besoin
              if (activeIndex !== -1) {
                const previous = words[activeIndex]
                const mouseoutEvent = new Event('mouseout')
                previous.dispatchEvent(mouseoutEvent)
              }

              activeIndex = index
              currentHeroSection?.classList.add('has-image')

              // Marquer le mot comme visité, et révéler le bouton une fois tous visités
              if (!visited[index]) {
                visited[index] = true
                hoveredCount += 1

                if (hoveredCount === words.length && !buttonShown && buttonEl) {
                  buttonShown = true
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

              const wrapper = document.createElement('div')
              wrapper.className =
                'hero-img-wrapper absolute top-0 h-full overflow-hidden will-change-[clip-path]'

              // Chaque mot contrôle une moitié d'écran :
              // index 0 -> moitié gauche, index 1 -> moitié droite
              wrapper.style.width = '50%'
              wrapper.style.left = index === 0 ? '0' : '50%'

              const img = document.createElement('img')
              img.src = `/images/bh_img${index + 1}.jpeg`
              img.alt = 'Preview'
              img.style.width = '100%'
              img.style.height = '100%'
              img.style.objectFit = 'cover'

              gsap.set(img, { scale: 1.25, opacity: 0 })

              wrapper.appendChild(img)
              previewContainer.appendChild(wrapper)

              activeWrapper = wrapper
              activeImg = img

              // État initial : cadre fermé
              gsap.set(wrapper, {
                clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
              })

              // Ouverture du cadre
              gsap.to(wrapper, {
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                duration: 0.5,
                ease: 'hop',
              })

              // Apparition + léger zoom out
              gsap.to(img, {
                opacity: 1,
                duration: 0.25,
                ease: 'power2.out',
              })

              gsap.to(img, {
                scale: 1,
                duration: 1.25,
                ease: 'power2.out',
              })
            }

            const handleMouseOut = (event: Event) => {
              const e = event as MouseEvent
              if (e.relatedTarget && (target as HTMLElement).contains(e.relatedTarget as Node)) return

              if (activeIndex === index) {
                activeIndex = -1
                currentHeroSection?.classList.remove('has-image')
              }

              if (activeImg && activeWrapper) {
                const imgToRemove = activeImg
                const wrapperToRemove = activeWrapper

                activeImg = null
                activeWrapper = null

                gsap.to(imgToRemove, {
                  opacity: 0,
                  duration: 0.5,
                  ease: 'power1.out',
                  onComplete: () => {
                    wrapperToRemove.remove()
                  },
                })
              }
            }

            target.addEventListener('mouseover', handleMouseOver)
            target.addEventListener('mouseout', handleMouseOut)
          })
        }

        if (words.length > 0) {
          const introTl = gsap.timeline()

          introTl
            .from(words, {
              yPercent: 100,
              duration: 1.4,
              ease: 'expo.out',
              stagger: 0.15,
            })
            .add(setupHover)
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
      data-mouse-hint="Try to hover"
    >
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center h-screen px-6 text-black overflow-hidden"
      >
        {/* Zone plein écran pour les images de prévisualisation (elles-mêmes seront limitées à une moitié) */}
        <div
          ref={previewRef}
          className="pointer-events-none absolute inset-0 w-full h-full z-10"
        />

        {/* Titre centré \"Baby Hayabusa\" */}
        <div className="baby-title relative w-full flex flex-col items-center justify-center flex-1 z-20">
          <h1
            className="block w-full text-center leading-none tracking-tight \
            text-[16vw] md:text-[11vw] cursor-pointer"
          >
            Baby Hayabusa
          </h1>
        </div>

        {/* Bouton press & hold en bas, qui n'apparaît qu'après hover sur les mots */}
        <div
          ref={buttonRef}
          className="hero-press-hold absolute bottom-8 left-1/2 -translate-x-1/2 z-30 opacity-0 pointer-events-none translate-y-4"
        >
          <PressHoldButton
            label="Press & hold to end"
            enableShake={false}
            variant="dark"
            onComplete={() => {
              // Déclencher la transition blanche vers la page de remerciements
              window.dispatchEvent(new CustomEvent('thanks:outro-complete'))
            }}
          />
        </div>
      </section>
    </div>
  )
}

export default BabyLandingHero
