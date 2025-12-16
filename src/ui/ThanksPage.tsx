import React, { useRef } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/all'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(SplitText, useGSAP)

export const ThanksPage: React.FC = () => {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        const split = new SplitText('.thanks-title', { type: 'chars' })
        const chars = split.chars as HTMLElement[]

        if (chars.length > 0) {
          gsap.from(chars, {
            yPercent: 100,
            duration: 1.4,
            ease: 'expo.out',
            stagger: 0.08,
          })
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
      className="min-h-screen w-full bg-[#FAFAFA] text-black flex items-center justify-center"
      data-mouse-hint="Andréas CASTELLO - Creative developer"
    >
      <h1
        className="thanks-title text-[18vw] md:text-[10vw] leading-none text-center"
        style={{ fontFamily: "'Young Morin', system-ui, sans-serif" }}
      >
        Thanks
      </h1>
    </div>
  )
}

export default ThanksPage

