import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useActiveModel } from '../state/ActiveModelContext'

export const SceneLights: React.FC = () => {
  const ambRef = useRef<THREE.AmbientLight>(null)
  const hemiRef = useRef<THREE.HemisphereLight>(null)
  const dir1Ref = useRef<THREE.DirectionalLight>(null)
  const dir2Ref = useRef<THREE.DirectionalLight>(null)
  const spotRef = useRef<THREE.SpotLight>(null)
  const { facet } = useActiveModel()

  const cfg = useMemo(() => {
    if (facet === 'baby') {
      return {
        amb: { intensity: 0.8, color: 0xF4A261 },
        hemi: { sky: 0xF4A261, ground: 0x3a2414, intensity: 0.9 },
        // Rouge (gizmo) = dir1 : lumière principale / key
        dir1: { color: 0xffd18a, intensity: 2.2, position: [5, 9, -5] as [number, number, number] },
        // Bleu (gizmo) = dir2 : lumière secondaire / fill / rim
        dir2: { color: 0xffffff, intensity: 1.0, position: [-8, 5, -6] as [number, number, number] },
        // Jaune (gizmo) = spot : faisceau plus focalisé
        spot: { color: 0xffffff, intensity: 1.0, angle: 0.55, penumbra: 0.4, position: [0, 9, 8] as [number, number, number] },
      }
    }
    // FEMTOGO - ambiance "minuit" bleu-gris globale
    return {
      // Ambiance générale sombre, légèrement bleutée
      amb: { intensity: 0.9, color: 0xBFD8FF },
      // Ciel bleu-gris froid, sol très sombre
      hemi: { sky: 0xBFD8FF, ground: 0x474747, intensity: 0.8 },
      // Rouge (gizmo) = dir1 : lumière principale / key (lune)
      // Lune froide, bleu clair qui sculpte bien les volumes
      dir1: { color: 0xaec6ff, intensity: 1.8, position: [5, 9, -5] as [number, number, number] },
      // Bleu (gizmo) = dir2 : lumière secondaire / fill / rim, plus sombre
      dir2: { color: 0xFFFFFF, intensity: 0.7, position: [-8, 5, -6] as [number, number, number] },
      // Jaune (gizmo) = spot : petit renfort de lune un peu plus doux
      spot: { color: 0xFFFFFF, intensity: 0.9, angle: 0.6, penumbra: 0.3, position: [0, 8, 8] as [number, number, number] },
    }
  }, [facet])

  useEffect(() => {
    const enable = (l: any) => {
      if (!l || !l.layers) return
      l.layers.enable(1)
      l.layers.enable(2)
    }
    enable(ambRef.current)
    enable(hemiRef.current)
    enable(dir1Ref.current)
    enable(dir2Ref.current)
    enable(spotRef.current)
  }, [])

  return (
    <>
      <ambientLight
        ref={ambRef}
        intensity={cfg.amb.intensity}
        color={cfg.amb.color}
      />
      <hemisphereLight
        ref={hemiRef}
        color={cfg.hemi.sky}
        groundColor={cfg.hemi.ground}
        intensity={cfg.hemi.intensity}
      />
      <directionalLight
        ref={dir1Ref}
        color={cfg.dir1.color}
        position={cfg.dir1.position}
        intensity={cfg.dir1.intensity}
      />
      <directionalLight
        ref={dir2Ref}
        color={cfg.dir2.color}
        position={cfg.dir2.position}
        intensity={cfg.dir2.intensity}
      />
      <spotLight
        ref={spotRef}
        color={cfg.spot.color}
        position={cfg.spot.position}
        angle={cfg.spot.angle}
        penumbra={cfg.spot.penumbra}
        intensity={cfg.spot.intensity}
      />
    </>
  )
}
