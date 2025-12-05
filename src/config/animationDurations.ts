// ═══════════════════════════════════════════════════════════════
// DURÉES DES ANIMATIONS - MODIFIER ICI POUR AJUSTER LA VITESSE
// ═══════════════════════════════════════════════════════════════

import { PlayerState } from '../types/player';

// Durées des états du joueur (en frames) - CORRESPONDENT EXACTEMENT AU NOMBRE DE FRAMES DISPONIBLES
export const STATE_DURATIONS: Record<PlayerState, number> = {
  [PlayerState.IDLE]: 0, // Pas d'animation
  [PlayerState.WALKING]: 0, // Animation en boucle (9 frames)
  [PlayerState.ATTACKING]: 0, // Utilise ATTACK_DURATION selon le type
  [PlayerState.PUSHING]: 10, // Pousette (pas d'animation spécifique)
  [PlayerState.HIT]: 4, // Prendre un coup (4 frames: 31-34)
  [PlayerState.GETTING_UP]: 3, // Se relever (3 frames: 38-40)
  [PlayerState.ROLLING]: 7, // Roulade (7 frames: 41-47)
  [PlayerState.SUPER_ATTACKING]: 17, // Super attaque (17 frames: 50-66)
  [PlayerState.GRAB_THROWING]: 3, // Projection (3 frames: 35-37)
  [PlayerState.DEFENDING]: 0, // Pas d'animation
  [PlayerState.JUMPING]: 0, // Pas d'animation
};

// Durées des attaques (en frames) - CORRESPONDENT EXACTEMENT AU NOMBRE DE FRAMES DISPONIBLES
export const ATTACK_DURATION = {
  light: 6,   // Coup léger (6 frames: 10-15)
  medium: 6,  // Coup moyen (6 frames: 25-30)
  heavy: 9,   // Coup lourd (9 frames: 16-24)
} as const;

// Durées pour le renderer (utilisées pour calculer le progrès de l'animation)
export const RENDER_DURATIONS = {
  hit: 4,              // 4 frames (31-34)
  grabThrowing: 3,     // 3 frames (35-37)
  gettingUp: 3,       // 3 frames (38-40)
  rolling: 7,         // 7 frames (41-47)
  superAttacking: 17, // 17 frames (50-66)
} as const;

