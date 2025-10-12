export interface ModelConfig {
  name: string
  path: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  layer?: 'background' | 'midground' | 'foreground' // Pour le z-positioning
  exposure?: number
  albumTitle?: string
  marqueeSpeedSec?: number
}
const degToRad = (deg: number) => deg * Math.PI / 180;

export const models: ModelConfig[] = [
  {
    name: "One Man Army",
    path: '/3D/Knight-draco.glb',
    position: [-6, -3, 2], // Premier plan
    rotation: [0, Math.PI, 0],
    scale: 3.0,
    layer: 'foreground',
    exposure: 0.8,
    albumTitle: 'ONE MAN ARMY',
    marqueeSpeedSec: 30,
  },
  {
    name: "Archives",
    path: '/3D/archive-draco.glb',
    position: [6.3, 5, 2], // Arrière plan
    rotation: [0, degToRad(-30), 0],
    scale: 1,
    layer: 'midground',
    exposure: 1,
    albumTitle: 'ARCHIVES',
    marqueeSpeedSec: 30,
  },
  {
    name: "Franc-Tireur Partisant",
    path: '/3D/childhood-draco.glb',
    position: [-13.3, -8.3, 2], // Arrière plan
    rotation: [0, degToRad(70), 0],
    scale: 0.8,
    layer: 'foreground',
    exposure: 0.4,
    albumTitle: 'FRANC-TIREUR PARTISANT',
    marqueeSpeedSec: 30,
  },
  {
    name: "Faded Flower",
    path: '/3D/faded_flower-draco.glb',
    position: [3, -7, 1], // Plan moyen
    rotation: [0, 0, 0],
    scale: 0.6,
    layer: 'midground',
    exposure: 50,
    albumTitle: 'FADED FLOWER',
    marqueeSpeedSec: 30,
  },
  {
    name: "Nameless Belligerent",
    path: '/3D/haunted_house-draco.glb',
    position: [1.5, -1, -1], // Plan moyen
    rotation: [0, degToRad(-21), 0],
    scale: 4.6,
    layer: 'background',
    exposure: 0.4,
    albumTitle: 'NAMELESS BELLIGERENT',
    marqueeSpeedSec: 30,
  },
  {
    name: "Closed Chapter",
    path: '/3D/closed_chapter-draco.glb',
    position: [7.2, -4, 2], // Arrière plan
    rotation: [0, degToRad(20), 0],
    scale: 1,
    layer: 'foreground',
    exposure: 2,
    albumTitle: 'CLOSED CHAPTER',
    marqueeSpeedSec: 30,
  },
  {
    name: "La Bête",
    path: '/3D/dragon-draco.glb',
    position: [0, 7, -2], // Premier plan
    rotation: [degToRad(90), degToRad(130), 0],
    scale: 3,
    layer: 'background',
    exposure: 2,
    albumTitle: 'LA BÊTE',
    marqueeSpeedSec: 30,
  },
]


