// src/engine/hexEngine.ts
import type { Hex, HexGameState, Faction, TerrainType } from '../types/rts/hex';
import type { Movement, AttackArrow } from '../types/rts/movement';
import type { AIConfig, AIDecision } from '../types/rts/ai';

export const HEX_SIZE = 40;
const MOVEMENT_SPEED = 0.02; // Vitesse de déplacement
const BASE_TRANSFORM_COST = 2; // Coût de base pour transformer une case

// Conversion coordonnées hexagonales vers pixels
export const hexToPixel = (q: number, r: number, offsetX: number, offsetY: number) => {
  const x = HEX_SIZE * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r) + offsetX;
  const y = HEX_SIZE * ((3 / 2) * r) + offsetY;
  return { x, y };
};

// Conversion pixels vers coordonnées hexagonales
export const pixelToHex = (x: number, y: number, offsetX: number, offsetY: number) => {
  const q = ((Math.sqrt(3) / 3) * (x - offsetX) - (1 / 3) * (y - offsetY)) / HEX_SIZE;
  const r = ((2 / 3) * (y - offsetY)) / HEX_SIZE;
  return hexRound(q, r);
};

const hexRound = (q: number, r: number) => {
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(s);
  
  const qDiff = Math.abs(rq - q);
  const rDiff = Math.abs(rr - r);
  const sDiff = Math.abs(rs - s);
  
  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  }
  
  return { q: rq, r: rr };
};

// Applications open source par type
const OPEN_SOURCE_APPS: Record<TerrainType, string[]> = {
  'code-editor': ['Vim', 'Neovim', 'Emacs', 'Atom', 'Brackets', 'Code::Blocks'],
  'text-editor': ['Nano', 'Gedit', 'Kate', 'Geany', 'Bluefish'],
  'browser': ['Firefox', 'Brave', 'Chromium', 'Tor Browser', 'LibreWolf'],
  'os': ['Linux', 'FreeBSD', 'OpenBSD', 'Debian', 'Ubuntu', 'Arch Linux'],
  'database': ['PostgreSQL', 'MySQL', 'SQLite', 'MariaDB', 'MongoDB'],
  'neutral': []
};

// Applications bigtech par type
const BIGTECH_APPS: Record<TerrainType, string[]> = {
  'code-editor': ['VS Code', 'IntelliJ', 'Xcode', 'Android Studio'],
  'text-editor': ['Notepad++', 'Sublime Text', 'TextMate'],
  'browser': ['Chrome', 'Edge', 'Safari', 'Opera'],
  'os': ['Windows', 'macOS', 'iOS', 'Android'],
  'database': ['Oracle', 'SQL Server', 'DynamoDB', 'Cosmos DB'],
  'neutral': []
};

// Obtenir un nom d'app aléatoire selon le type et la faction
const getAppName = (terrainType: TerrainType, faction: Faction): string | undefined => {
  if (terrainType === 'neutral') return undefined;
  
  const apps = faction === 'opensource' 
    ? OPEN_SOURCE_APPS[terrainType] 
    : BIGTECH_APPS[terrainType];
  
  if (apps && apps.length > 0) {
    return apps[Math.floor(Math.random() * apps.length)];
  }
  return undefined;
};

// Génération de la grille hexagonale (orientée gauche-droite)
const generateHexGrid = (): Hex[] => {
  const hexes: Hex[] = [];
  const terrainTypes: TerrainType[] = ['code-editor', 'text-editor', 'browser', 'os', 'database'];
  
  // Carte plus petite : -7 à 7 (au lieu de -10 à 10)
  for (let q = -7; q < 7; q++) {
    for (let r = -5; r < 5; r++) {
      let faction: Faction = 'neutral';
      let terrainType: TerrainType = 'neutral';
      let appName: string | undefined = undefined;
      
      // Ajustement des positions de départ pour la carte réduite
      if (q >= 4) { // BigTech commence à droite
        faction = 'bigtech';
        terrainType = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
        appName = getAppName(terrainType, 'bigtech');
      } else if (q <= -5 && Math.abs(r) <= 1) { // OpenSource commence à gauche
        faction = 'opensource';
        terrainType = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
        appName = getAppName(terrainType, 'opensource');
      }
      
      hexes.push({
        q,
        r,
        faction,
        terrainType,
        workforce: faction === 'bigtech' ? 3 : faction === 'opensource' ? 1 : 0,
        maxWorkforce: 10, 
        appName
      });
    }
  }
  
  return hexes;
};

// Calculer le multiplicateur de génération de workforce
const getTerrainMultiplier = (terrainType: TerrainType): number => {
  const multipliers: Record<TerrainType, number> = {
    'code-editor': 2,
    'text-editor': 1.5,
    'browser': 1.5,
    'os': 2,
    'database': 1.5,
    'neutral': 1
  };
  return multipliers[terrainType];
};

// Calculer la distance entre deux hexagones
const hexDistance = (q1: number, r1: number, q2: number, r2: number): number => {
  return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
};

// Calculer la workforce générée par seconde (seulement depuis les bases converties)
const calculateWorkforceGeneration = (hexes: Hex[], totalWorkforce: number, faction: Faction): number => {
  // Seulement les bases converties (isConverted === true) génèrent de la workforce
  const generatingHexes = hexes.filter(
    h => h.faction === faction && h.terrainType !== 'neutral' && h.isConverted === true
  );
  
  const baseGeneration = generatingHexes.reduce((sum, h) => {
    const multiplier = getTerrainMultiplier(h.terrainType);
    return sum + (h.workforce * multiplier);
  }, 0);
  
  // Pour BigTech : ralentissement basé sur la workforce totale (budget)
  if (faction === 'bigtech') {
    // Plus la workforce totale est élevée, moins la génération est rapide
    // Formule : ralentissement = 1 / (1 + totalWorkforce / 100)
    const slowdown = 1 / (1 + totalWorkforce / 100);
    return baseGeneration * slowdown;
  }
  
  // Open Source : génération normale
  return baseGeneration;
};

// IA pour BigTech
class BigTechAI {
  private config: AIConfig;
  private lastAttackTime: number = 0;

  constructor() {
    this.config = {
      attackCooldown: 3000, // 3 secondes
      minTroopsToAttack: 2,
      expansionPriority: 0.7
    };
  }

  makeDecision(hexes: Hex[]): AIDecision | null {
    const now = Date.now();
    if (now - this.lastAttackTime < this.config.attackCooldown) {
      return null;
    }

    // Trouver toutes les cases bigtech avec assez de troupes
    const bigtechHexes = hexes.filter(
      h => h.faction === 'bigtech' && h.workforce >= this.config.minTroopsToAttack
    );

    if (bigtechHexes.length === 0) return null;

    // Trouver les cibles (opensource ou neutres proches)
    const targets: Array<{ hex: Hex; distance: number; priority: number }> = [];

    for (const source of bigtechHexes) {
      const neighbors = this.getNeighbors(source.q, source.r, hexes);
      
      for (const target of neighbors) {
        if (target.faction === 'opensource' || target.faction === 'neutral') {
          const distance = hexDistance(source.q, source.r, target.q, target.r);
          const priority = target.faction === 'opensource' ? 2 : 1;
          targets.push({ hex: target, distance, priority });
        }
      }
    }

    if (targets.length === 0) return null;

    // Choisir la meilleure cible
    targets.sort((a, b) => b.priority - a.priority || a.distance - b.distance);
    const target = targets[0].hex;

    // Trouver la source la plus proche
    const source = bigtechHexes
      .map(s => ({
        hex: s,
        distance: hexDistance(s.q, s.r, target.q, target.r)
      }))
      .sort((a, b) => a.distance - b.distance)[0]?.hex;

    if (!source) return null;

    const troops = Math.min(source.workforce - 1, 2); // Envoyer 1-2 troupes

    this.lastAttackTime = now;
    return {
      sourceQ: source.q,
      sourceR: source.r,
      targetQ: target.q,
      targetR: target.r,
      troops
    };
  }

  private getNeighbors(q: number, r: number, hexes: Hex[]): Hex[] {
    const directions = [
      { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
    ];

    return directions
      .map(dir => hexes.find(h => h.q === q + dir.q && h.r === r + dir.r))
      .filter((hex): hex is Hex => hex !== undefined);
  }
}

export class HexEngine {
  private hexes: Hex[];
  private workforce: number;
  private lastUpdateTime: number;
  private movements: Movement[] = [];
  private attackArrows: AttackArrow[] = [];
  private ai: BigTechAI;
  private movementIdCounter: number = 0;
  private workforceGenerationPerSecond: number = 0;

  constructor() {
    this.hexes = generateHexGrid();
    this.workforce = this.calculateInitialWorkforce();
    this.lastUpdateTime = Date.now();
    this.ai = new BigTechAI();
  }

  private calculateInitialWorkforce(): number {
    return this.hexes
      .filter(h => h.faction === 'opensource')
      .reduce((sum, h) => sum + h.workforce, 0);
  }

  // Mettre à jour le moteur
  update(): void {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000;
    
    // Génération de workforce globale
    if (deltaTime >= 1) {
      const generated = this.calculateWorkforceGeneration();
      this.workforceGenerationPerSecond = generated;
      this.workforce += generated * 0.1;
      
      // Génération automatique sur les cases avec < 3 workforce
      this.generateWorkforceOnHexes();
      
      this.lastUpdateTime = now;
    }

    // Mettre à jour les mouvements
    this.updateMovements();

    // IA BigTech
    const aiDecision = this.ai.makeDecision(this.hexes);
    if (aiDecision) {
      this.createMovement(
        aiDecision.sourceQ,
        aiDecision.sourceR,
        aiDecision.targetQ,
        aiDecision.targetR,
        aiDecision.troops,
        'bigtech'
      );
    }
  }

  // Génération automatique de workforce sur les cases avec < 3 workforce
  private generateWorkforceOnHexes(): void {
    this.hexes.forEach(hex => {
      // MODIFICATION : On génère uniquement sur les cases spécialisées (pas neutral)
      if (hex.workforce < 3 && hex.faction !== 'neutral' && hex.terrainType !== 'neutral') {
        // Open Source génère plus vite (0.15 par seconde) que BigTech (0.1 par seconde)
        const generationRate = hex.faction === 'opensource' ? 0.15 : 0.1;
        hex.workforce = Math.min(hex.workforce + generationRate, 3);
      }
    });
  }

  private updateMovements(): void {
    this.movements = this.movements.filter(movement => {
      movement.progress += MOVEMENT_SPEED;
      
      if (movement.progress >= 1) {
        // Arrivée à destination
        this.completeMovement(movement);
        return false;
      }
      
      // Mettre à jour la flèche d'attaque
      const arrow = this.attackArrows.find(
        a => a.sourceQ === movement.sourceQ && a.sourceR === movement.sourceR &&
             a.targetQ === movement.targetQ && a.targetR === movement.targetR
      );
      
      if (arrow) {
        arrow.progress = movement.progress;
      }
      
      return true;
    });
  }

  private completeMovement(movement: Movement): void {
    const sourceHex = this.hexes.find(h => h.q === movement.sourceQ && h.r === movement.sourceR);
    const targetHex = this.hexes.find(h => h.q === movement.targetQ && h.r === movement.targetR);

    if (!sourceHex || !targetHex) return;

    // Si la cible est de la même faction, ajouter les troupes
    if (targetHex.faction === sourceHex.faction) {
      targetHex.workforce = Math.min(
        targetHex.workforce + movement.troops,
        targetHex.maxWorkforce
      );
    } else {
      // Attaquer - nouvelle règle : il faut avoir au moins 1 de plus que la cible
      const targetWorkforce = targetHex.workforce;
      
      // Vérifier qu'on a assez de troupes (au moins 1 de plus que la cible)
      if (movement.troops > targetWorkforce) {
        // Conquérir : on perd autant de workforce que la cible en avait
        const lostWorkforce = targetWorkforce;
        targetHex.faction = sourceHex.faction;
        targetHex.workforce = movement.troops - lostWorkforce;
        if (targetHex.terrainType !== 'neutral' && sourceHex.faction === 'opensource') {
          targetHex.appName = getAppName(targetHex.terrainType, 'opensource');
        }
        // Si la base avait un terrain spécifique, elle devient convertie
        if (targetHex.terrainType !== 'neutral') {
          targetHex.isConverted = true;
        }
      } else {
        // Pas assez de troupes : juste réduire la workforce de la cible
        targetHex.workforce -= movement.troops;
      }
    }

    // Retirer la flèche
    this.attackArrows = this.attackArrows.filter(
      a => !(a.sourceQ === movement.sourceQ && a.sourceR === movement.sourceR &&
              a.targetQ === movement.targetQ && a.targetR === movement.targetR)
    );
  }

  // Créer un mouvement
  createMovement(
    sourceQ: number,
    sourceR: number,
    targetQ: number,
    targetR: number,
    troops: number,
    faction: Faction
  ): boolean {
    const sourceHex = this.hexes.find(h => h.q === sourceQ && h.r === sourceR);
    const targetHex = this.hexes.find(h => h.q === targetQ && h.r === targetR);

    if (!sourceHex || !targetHex) return false;
    if (sourceHex.faction !== faction) return false;
    if (sourceHex.workforce < troops) return false;
    if (targetHex.faction === faction && targetHex.workforce >= targetHex.maxWorkforce) return false;

    // Nouvelle règle : si on attaque une case ennemie, il faut avoir au moins 1 de plus que la cible
    if (targetHex.faction !== faction && targetHex.faction !== 'neutral') {
      if (troops <= targetHex.workforce) {
        return false; // Pas assez de troupes pour conquérir
      }
    }

    // Retirer les troupes de la source
    sourceHex.workforce -= troops;

    // Créer le mouvement
    const movement: Movement = {
      id: `movement-${this.movementIdCounter++}`,
      sourceQ,
      sourceR,
      targetQ,
      targetR,
      troops,
      progress: 0,
      speed: MOVEMENT_SPEED
    };

    this.movements.push(movement);

    // Créer la flèche d'attaque
    if (targetHex.faction !== faction && targetHex.faction !== 'neutral') {
      this.attackArrows.push({
        sourceQ,
        sourceR,
        targetQ,
        targetR,
        progress: 0
      });
    }

    return true;
  }

  // Calculer le coût de transformation basé sur le nombre de cases contrôlées
  getTransformCost(faction: Faction): number {
    const controlledCount = this.hexes.filter(
      h => h.faction === faction && h.terrainType !== 'neutral'
    ).length;
    
    // Pour opensource : coût augmente plus lentement (logarithmique)
    // Pour bigtech : coût augmente plus rapidement (linéaire)
    if (faction === 'opensource') {
      // Coût = base + log(nombre de cases) * 1.5
      return Math.floor(BASE_TRANSFORM_COST + Math.log(controlledCount + 1) * 1.5);
    } else {
      // Coût = base + nombre de cases * 2
      return BASE_TRANSFORM_COST + controlledCount * 2;
    }
  }

  // Transformer une case (neutre ou contrôlée)
  transformHex(q: number, r: number, terrainType: TerrainType, faction: Faction): boolean {
    const hex = this.hexes.find(h => h.q === q && h.r === r);
    if (!hex) return false;
    
    // Vérifier que la case appartient à la faction ou est neutre
    if (hex.faction !== faction && hex.faction !== 'neutral') return false;
    
    const cost = this.getTransformCost(faction);
    if (hex.workforce < cost) return false;

    hex.faction = faction;
    hex.terrainType = terrainType;
    hex.workforce -= cost;
    hex.appName = getAppName(terrainType, faction);
    hex.isConverted = true; // Marquer comme convertie

    return true;
  }

  // Sélectionner un hexagone
  selectHex(q: number, r: number): Hex | null {
    return this.hexes.find(h => h.q === q && h.r === r) || null;
  }

  // Envoyer des troupes (ancienne méthode, maintenant utilise createMovement)
  sendTroops(
    sourceQ: number,
    sourceR: number,
    targetQ: number,
    targetR: number,
    troopsToSend: number
  ): boolean {
    const sourceHex = this.hexes.find(h => h.q === sourceQ && h.r === sourceR);
    const targetHex = this.hexes.find(h => h.q === targetQ && h.r === targetR);
    
    if (!sourceHex || sourceHex.faction !== 'opensource') return false;
    if (!targetHex) return false;

    // Nouvelle règle : si on attaque une case ennemie, il faut avoir au moins 1 de plus que la cible
    if (targetHex.faction !== 'opensource' && targetHex.faction !== 'neutral') {
      if (troopsToSend <= targetHex.workforce) {
        return false; // Pas assez de troupes pour conquérir
      }
    }

    return this.createMovement(sourceQ, sourceR, targetQ, targetR, troopsToSend, 'opensource');
  }

  // Obtenir les voisins
  getNeighbors(q: number, r: number): Hex[] {
    const directions = [
      { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
    ];

    return directions
      .map(dir => this.hexes.find(h => h.q === q + dir.q && h.r === r + dir.r))
      .filter((hex): hex is Hex => hex !== undefined);
  }

  private calculateWorkforceGeneration(): number {
    // Calculer la workforce totale de chaque faction
    const opensourceTotalWorkforce = this.hexes
      .filter(h => h.faction === 'opensource')
      .reduce((sum, h) => sum + h.workforce, 0);
    
    // Génération pour Open Source (pas de ralentissement)
    const opensourceGen = calculateWorkforceGeneration(this.hexes, opensourceTotalWorkforce, 'opensource');
    
    return opensourceGen;
  }

  getStats(): { controlledTerrain: number; bigtechTerrain: number } {
    const controlledTerrain = this.hexes.filter(
      h => h.faction === 'opensource' && h.terrainType !== 'neutral'
    ).length;
    const bigtechTerrain = this.hexes.filter(h => h.faction === 'bigtech').length;

    return { controlledTerrain, bigtechTerrain };
  }

  getState(): HexGameState {
    const stats = this.getStats();
    return {
      hexes: [...this.hexes],
      workforce: this.workforce,
      controlledTerrain: stats.controlledTerrain,
      bigtechTerrain: stats.bigtechTerrain,
      workforceGenerationPerSecond: this.workforceGenerationPerSecond
    };
  }

  // Obtenir les mouvements en cours
  getMovements(): Movement[] {
    return [...this.movements];
  }

  // Obtenir les flèches d'attaque
  getAttackArrows(): AttackArrow[] {
    return [...this.attackArrows];
  }

  reset(): void {
    this.hexes = generateHexGrid();
    this.workforce = this.calculateInitialWorkforce();
    this.lastUpdateTime = Date.now();
    this.movements = [];
    this.attackArrows = [];
    this.movementIdCounter = 0;
  }

  getWorkforce(): number {
    return this.workforce;
  }

  consumeWorkforce(amount: number): boolean {
    if (this.workforce >= amount) {
      this.workforce -= amount;
      return true;
    }
    return false;
  }

  addWorkforce(amount: number): void {
    this.workforce += amount;
  }
}