import { useLayoutEffect } from 'react'

/**
 * Verrouille le scroll global (html/body) quand `locked` est true.
 * - Pas de "jump" de la page : on fixe le body à la position actuelle.
 * - Bloque aussi wheel / touchmove pour éviter le scroll inertiel sur trackpad/mobile.
 */
export const useScrollLock = (locked: boolean) => {
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return
    if (!locked) return

    const html = document.documentElement
    const body = document.body
    const scrollY = window.scrollY

    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      overscroll: (html.style as any).overscrollBehavior,
    }

    html.style.overflow = 'hidden'
    ;(html.style as any).overscrollBehavior = 'none'
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'

    const prevent = (e: Event) => {
      e.preventDefault()
    }

    window.addEventListener('wheel', prevent, { passive: false })
    window.addEventListener('touchmove', prevent, { passive: false })

    return () => {
      window.removeEventListener('wheel', prevent as any)
      window.removeEventListener('touchmove', prevent as any)

      html.style.overflow = prev.htmlOverflow
      ;(html.style as any).overscrollBehavior = prev.overscroll
      body.style.overflow = prev.bodyOverflow
      body.style.position = prev.bodyPosition
      body.style.top = prev.bodyTop
      body.style.width = prev.bodyWidth

      window.scrollTo(0, scrollY)
    }
  }, [locked])
}


