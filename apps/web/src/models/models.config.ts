export interface ModelConfig {
  name: string
  path: string
  position: [number, number, number]
  backgroundPosition: { x: number; y: number }
  rotation: [number, number, number]
  scale: number
  color: string
  layer?: 'background' | 'midground' | 'foreground' // Pour le z-positioning
}

export const models: ModelConfig[] = [
  {
    name: "Knight",
    path: '/3D/Knight-draco.glb',
    position: [0, -1, 2], // Premier plan
    backgroundPosition: { x: 50, y: 65 },
    rotation: [0, Math.PI, 0],
    scale: 1.0,
    color: "#8b5cf6",
    layer: 'foreground',
  },
  {
    name: "Archive",
    path: '/3D/archive-draco.glb',
    position: [-6, 0, -2], // Arrière plan
    backgroundPosition: { x: 10, y: 45 },
    rotation: [0, 0, 0],
    scale: 0.8,
    color: "#ef4444",
    layer: 'background',
  },
  {
    name: "Childhood",
    path: '/3D/childhood-draco.glb',
    position: [6, 0, -2], // Arrière plan
    backgroundPosition: { x: 90, y: 45 },
    rotation: [0, 0, 0],
    scale: 0.8,
    color: "#10b981",
    layer: 'background',
  },
  {
    name: "Faded Flower",
    path: '/3D/faded_flower-draco.glb',
    position: [-4, 2, 0], // Plan moyen
    backgroundPosition: { x: 25, y: 20 },
    rotation: [0, 0, 0],
    scale: 0.6,
    color: "#f59e0b",
    layer: 'midground',
  },
  {
    name: "Haunted House",
    path: '/3D/haunted_house-draco.glb',
    position: [0, 1, 0], // Plan moyen
    backgroundPosition: { x: 50, y: 30 },
    rotation: [0, 0, 0],
    scale: 0.5,
    color: "#dc2626",
    layer: 'midground',
  },
  {
    name: "Closed Chapter",
    path: '/3D/closed_chapter-draco.glb',
    position: [-4, -2, -2], // Arrière plan
    backgroundPosition: { x: 20, y: 80 },
    rotation: [0, 0, 0],
    scale: 0.7,
    color: "#7c3aed",
    layer: 'background',
  },
  {
    name: "Dragon",
    path: '/3D/dragon-draco.glb',
    position: [4, 2, 2], // Premier plan
    backgroundPosition: { x: 75, y: 20 },
    rotation: [0, 0, 0],
    scale: 0.8,
    color: "#059669",
    layer: 'foreground',
  },
]


