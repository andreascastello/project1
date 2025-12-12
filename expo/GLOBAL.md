# Règle et stack globales

Notre plateforme de distributeurs connectés permet de réserver jusqu'à deux produits via smartphone (web/mobile) et de les récupérer via un QR code unique. Intégration programme de fidélité, suivi temps réel des stocks, et back-office admin.

Exigences système:
- Décrémenter le stock à la réservation.
- Invalider les QR codes expirés ou déjà utilisés.
- Journaliser les opérations de points de fidélité par utilisateur (code-barres personnel).
- Historique fidélité consultable et échange de récompenses.
- UI moderne, fluide, accessible (WCAG) sur toutes plateformes.

Tech stack UI (web):
- React (TypeScript) + Vite.
- Router: React Router (routes: dark/light/album/:id).
- 3D: react-three-fiber + @react-three/drei.
- Animations: framer-motion.
- State: XState ou Zustand.
- UI: Tailwind CSS (+ shadcn/ui si besoin).
- Marquee: CSS-only.
- Persistance: localStorage (albums visités, statut d'unlock).
- Assets 3D: glTF/GLB, Draco, textures WebP/AVIF.

Notes d’accessibilité:
- Contrastes AA, focus visible, commandes clavier complètes, motion-reduce respecté.
