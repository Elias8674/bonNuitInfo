// src/types/rts/movement.ts
export interface Movement {
  id: string;
  sourceQ: number;
  sourceR: number;
  targetQ: number;
  targetR: number;
  troops: number;
  progress: number; // 0 à 1
  speed: number;
}

export interface AttackArrow {
  sourceQ: number;
  sourceR: number;
  targetQ: number;
  targetR: number;
  progress: number; // 0 à 1 pour l'animation
}

