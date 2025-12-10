import type { ModelConfig } from '../models/models.config'
import { models as rawModels } from '../models/models.config'

// Nom du modèle portail (fleur) utilisé pour la transition vers la facette "baby"
export const PORTAL_MODEL_NAME = 'Faded Flower'

// Citation utilisée pour certaines transitions de facette
export const TRANSITION_QUOTE = "C'est juste un autre jour…"
export const TRANSITION_ARTIST_TITLE = 'FEMTOGO - UN AUTRE JOUR'

// Pile de fontes utilisée pour le marquee des albums
export const ALBUM_MARQUEE_FONT_STACK =
  `'SerpentCresh', 'Tusker Grotesk 5800 Super', 'Tusker Grotesk', 'Impact', 'Arial Black', system-ui, sans-serif`

// Re-export proprement typé des modèles 3D
export const models: ModelConfig[] = rawModels
export type { ModelConfig }


