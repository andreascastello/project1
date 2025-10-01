import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export const SceneLights: React.FC = () => {
  const ambRef = useRef<THREE.AmbientLight>(null)
  const hemiRef = useRef<THREE.HemisphereLight>(null)
  const dir1Ref = useRef<THREE.DirectionalLight>(null)
  const dir2Ref = useRef<THREE.DirectionalLight>(null)
  const spotRef = useRef<THREE.SpotLight>(null)

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
      <ambientLight ref={ambRef} intensity={0.9} />
      <hemisphereLight ref={hemiRef} color={0xffffff} groundColor={0x222222} intensity={0.6} />
      <directionalLight ref={dir1Ref} position={[10, 10, 5]} intensity={1.5} />
      <directionalLight ref={dir2Ref} position={[-8, 5, -6]} intensity={0.8} />
      <spotLight ref={spotRef} position={[0, 8, 8]} angle={0.6} penumbra={0.3} intensity={1.0} />
    </>
  )
}
