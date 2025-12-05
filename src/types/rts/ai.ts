// src/types/rts/ai.ts
export interface AIConfig {
  attackCooldown: number; // Temps entre les attaques
  minTroopsToAttack: number; // Nombre minimum de troupes pour attaquer
  expansionPriority: number; // Priorité d'expansion (0-1)
}

export interface AIDecision {
  sourceQ: number;
  sourceR: number;
  targetQ: number;
  targetR: number;
  troops: number;
}

