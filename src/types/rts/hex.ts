// src/types/rts/hex.ts
export type Faction = 'bigtech' | 'opensource' | 'neutral';
export type TerrainType = 'code-editor' | 'text-editor' | 'browser' | 'os' | 'database' | 'neutral';

export interface Hex {
  q: number;
  r: number;
  faction: Faction;
  terrainType: TerrainType;
  workforce: number; // Nombre de communautés présentes
  maxWorkforce: number; // Capacité maximale
  appName?: string; // Nom de l'application open source
  isConverted?: boolean; // True si la base a été convertie (pas initiale)
}

export interface HexGameState {
  hexes: Hex[];
  workforce: number; // Workforce totale disponible
  controlledTerrain: number; // Nombre de terrains contrôlés par opensource
  bigtechTerrain: number; // Nombre de terrains contrôlés par bigtech
  workforceGenerationPerSecond: number; // Workforce générée par seconde
}

