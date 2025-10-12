export interface ModelConfig {
  name: string
  path: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  layer?: 'background' | 'midground' | 'foreground' // Pour le z-positioning
  exposure?: number
}
const degToRad = (deg: number) => deg * Math.PI / 180;

export const models: ModelConfig[] = [
  {
    name: "Knight",
    path: '/3D/Knight-draco.glb',
    position: [-6, -3, 2], // Premier plan
    rotation: [0, Math.PI, 0],
    scale: 3.0,
    layer: 'foreground',
    exposure: 0.8,
  },
  {
    name: "Archive",
    path: '/3D/archive-draco.glb',
    position: [6.3, 5, 2], // Arrière plan
    rotation: [0, degToRad(-30), 0],
    scale: 1,
    layer: 'midground',
    exposure: 1,
  },
  {
    name: "Childhood",
    path: '/3D/childhood-draco.glb',
    position: [-13.3, -8.3, 2], // Arrière plan
    rotation: [0, degToRad(70), 0],
    scale: 0.8,
    layer: 'foreground',
    exposure: 0.4,
  },
  {
    name: "Faded Flower",
    path: '/3D/faded_flower-draco.glb',
    position: [3, -7, 1], // Plan moyen
    rotation: [0, 0, 0],
    scale: 0.6,
    layer: 'midground',
    exposure: 50,
  },
  {
    name: "Haunted House",
    path: '/3D/haunted_house-draco.glb',
    position: [1.5, -1, -1], // Plan moyen
    rotation: [0, degToRad(-21), 0],
    scale: 4.6,
    layer: 'background',
    exposure: 0.4,
  },
  {
    name: "Closed Chapter",
    path: '/3D/closed_chapter-draco.glb',
    position: [7.2, -4, 2], // Arrière plan
    rotation: [0, degToRad(20), 0],
    scale: 1,
    layer: 'foreground',
    exposure: 2,
  },
  {
    name: "Dragon",
    path: '/3D/dragon-draco.glb',
    position: [0, 7, -2], // Premier plan
    rotation: [degToRad(90), degToRad(130), 0],
    scale: 3,
    layer: 'background',
    exposure: 2,
  },
]


