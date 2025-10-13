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
  bgTransformOrigin: { x: number, y: number } | null
  setBgTransformOrigin: (p: { x: number, y: number } | null) => void
  selectModelByName: (name: string) => void
  setSelectModelByName: (fn: (name: string) => void) => void
}

const ActiveModelContext = createContext<ActiveModelContextType | undefined>(undefined)

export const ActiveModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeModelName, setActiveModelName] = useState<string | null>(null)
  const [cameraTarget, setCameraTarget] = useState<CameraTarget>({
    pos: [0, 0, 12],
    look: [0, 0, 0]
  })
  const [bgTransformOrigin, setBgTransformOrigin] = useState<{ x: number, y: number } | null>(null)
  const selectRef = React.useRef<(name: string) => void>(() => {})
  const selectModelByName = useCallback((name: string) => {
    selectRef.current(name)
  }, [])
  const setSelectModelByName = useCallback((fn: (name: string) => void) => {
    selectRef.current = fn
  }, [])

  const value: ActiveModelContextType = {
    activeModelName,
    setActiveModelName,
    cameraTarget,
    setCameraTarget,
    bgTransformOrigin,
    setBgTransformOrigin,
    selectModelByName,
    setSelectModelByName,
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


