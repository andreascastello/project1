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
        amb: { intensity: 0.8, color: 0xfff0cc },
        hemi: { sky: 0xffe6bf, ground: 0x3a2414, intensity: 0.9 },
        dir1: { color: 0xffd18a, intensity: 2.2, position: [6, 9, 10] as [number, number, number] },
        dir2: { color: 0xff8a5f, intensity: 1.0, position: [6, 4, -8] as [number, number, number] },
        spot: { color: 0xffe6c6, intensity: 1.5, angle: 0.55, penumbra: 0.4, position: [0, 9, 8] as [number, number, number] },
      }
    }
    // FEMTOGO - garder l’éclairage d’origine, on ajustera plus tard via exposure
    return {
      amb: { intensity: 0.9, color: 0xffffff },
      hemi: { sky: 0xffffff, ground: 0x222222, intensity: 0.6 },
      dir1: { color: 0xffffff, intensity: 1.5, position: [10, 10, 5] as [number, number, number] },
      dir2: { color: 0xffffff, intensity: 0.8, position: [-8, 5, -6] as [number, number, number] },
      spot: { color: 0xffffff, intensity: 1.0, angle: 0.6, penumbra: 0.3, position: [0, 8, 8] as [number, number, number] },
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
      <ambientLight ref={ambRef} intensity={cfg.amb.intensity} color={cfg.amb.color} />
      <hemisphereLight ref={hemiRef} color={cfg.hemi.sky} groundColor={cfg.hemi.ground} intensity={cfg.hemi.intensity} />
      <directionalLight ref={dir1Ref} color={cfg.dir1.color} position={cfg.dir1.position} intensity={cfg.dir1.intensity} />
      <directionalLight ref={dir2Ref} color={cfg.dir2.color} position={cfg.dir2.position} intensity={cfg.dir2.intensity} />
      <spotLight ref={spotRef} color={cfg.spot.color} position={cfg.spot.position} angle={cfg.spot.angle} penumbra={cfg.spot.penumbra} intensity={cfg.spot.intensity} />
    </>
  )
}
