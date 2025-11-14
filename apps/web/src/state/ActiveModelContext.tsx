import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface CameraTarget {
  pos: [number, number, number]
  look: [number, number, number]
}

interface ActiveModelContextType {
  activeModelName: string | null
  setActiveModelName: (name: string | null) => void
  cameraTarget: CameraTarget
  setCameraTarget: (target: CameraTarget) => void
  discoveredNames: string[]
  addDiscovered: (name: string) => void
  bgTransformOrigin: { x: number, y: number } | null
  setBgTransformOrigin: (p: { x: number, y: number } | null) => void
  selectModelByName: (name: string) => void
  setSelectModelByName: (fn: (name: string) => void) => void
  transitionQuote: string | null
  showTransition: (quote: string) => void
  hideTransition: () => void
}

const ActiveModelContext = createContext<ActiveModelContextType | undefined>(undefined)

export const ActiveModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeModelName, setActiveModelName] = useState<string | null>(null)
  const [cameraTarget, setCameraTarget] = useState<CameraTarget>({
    pos: [0, 0, 12],
    look: [0, 0, 0]
  })
  const [discoveredNames, setDiscoveredNames] = useState<string[]>([])
  const [bgTransformOrigin, setBgTransformOrigin] = useState<{ x: number, y: number } | null>(null)
  const [transitionQuote, setTransitionQuote] = useState<string | null>(null)
  const selectRef = React.useRef<(name: string) => void>(() => {})
  const selectModelByName = useCallback((name: string) => {
    selectRef.current(name)
  }, [])
  const setSelectModelByName = useCallback((fn: (name: string) => void) => {
    selectRef.current = fn
  }, [])
  const addDiscovered = useCallback((name: string) => {
    setDiscoveredNames((prev) => (prev.includes(name) ? prev : [...prev, name]))
  }, [])
  const showTransition = useCallback((quote: string) => {
    setTransitionQuote(quote)
  }, [])
  const hideTransition = useCallback(() => {
    setTransitionQuote(null)
  }, [])

  const value: ActiveModelContextType = {
    activeModelName,
    setActiveModelName,
    cameraTarget,
    setCameraTarget,
    discoveredNames,
    addDiscovered,
    bgTransformOrigin,
    setBgTransformOrigin,
    selectModelByName,
    setSelectModelByName,
    transitionQuote,
    showTransition,
    hideTransition,
  }

  return (
    <ActiveModelContext.Provider value={value}>
      {children}
    </ActiveModelContext.Provider>
  )
}

export const useActiveModel = (): ActiveModelContextType => {
  const ctx = useContext(ActiveModelContext)
  if (!ctx) throw new Error('useActiveModel must be used within ActiveModelProvider')
  return ctx
}


