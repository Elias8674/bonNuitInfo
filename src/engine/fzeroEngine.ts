// src/engine/fzeroEngine.ts

export const FZERO_CANVAS_WIDTH = 800;
export const FZERO_CANVAS_HEIGHT = 600;
export const INITIAL_DISTANCE_TO_BOSS = 10000;

export interface Obstacle {
  id: string;
  x: number;
  z: number;
  width: number;
  height: number;
}

export interface FZeroCar {
  x: number;
  z: number;
  speed: number;
  rotation: number;
}

export interface Boss {
  x: number;
  y: number;
  z: number;
  name: string;
  spawnTimer: number;
}

export interface FZeroState {
  car: FZeroCar;
  obstacles: Obstacle[];
  boss: Boss;
  distanceToBoss: number;
  isGameOver: boolean;
  hasWon: boolean;
  collisionFrame: number;
  roadCurvature: number;
}

export class FZeroEngine {
  private car: FZeroCar;
  private obstacles: Obstacle[];
  private boss: Boss;
  private distanceToBoss: number;
  private obstacleIdCounter: number = 0;
  private bossMoveTimer: number = 0;
  private collisionFrame: number = 0;
  
  private roadCurvature: number = 0;
  private targetCurvature: number = 0;
  private curveTimer: number = 0;

  constructor(bossName: string = 'Boss') {
    this.car = { x: 0.5, z: 0, speed: 0, rotation: 0 };
    this.distanceToBoss = INITIAL_DISTANCE_TO_BOSS;
    this.boss = { x: 0.5, y: 200, z: this.distanceToBoss, name: bossName, spawnTimer: 0 };
    this.obstacles = [];
  }

  private spawnObstacle(): void {
    const nameLen = this.boss.name.length;
    const dynamicWidth = Math.min(0.6, 0.15 + (nameLen * 0.015));

    this.obstacles.push({
      id: `obstacle-${this.obstacleIdCounter++}`,
      x: this.boss.x,
      z: this.boss.z,
      width: dynamicWidth, 
      height: 40,
    });
  }

  update(keys: Set<string>): FZeroState {
    const nameLen = this.boss.name.length;

    // --- COURBURE DYNAMIQUE (PLUS NERVEUSE) ---
    this.curveTimer++;
    // Changement plus fréquent (120 frames = ~2 secondes)
    if (this.curveTimer > 120) {
      this.curveTimer = 0;
      const rand = Math.random();
      // Moins de lignes droites (30% de chance)
      if (rand < 0.3) {
        this.targetCurvature = 0; 
      } else {
        // Virages plus doux (réduit de 1.5 à 0.8)
        this.targetCurvature = (Math.random() - 0.5) * 0.8; 
      }
    }
    // Transition plus douce (réduit de 0.01 à 0.003 pour des virages moins brusques)
    this.roadCurvature += (this.targetCurvature - this.roadCurvature) * 0.003;

    // --- CONTRÔLES ---
    let steering = 0;
    if (keys.has('arrowleft') || keys.has('q') || keys.has('a')) {
      steering = -0.025; 
      this.car.rotation = -0.15;
    } else if (keys.has('arrowright') || keys.has('d')) {
      steering = 0.025;
      this.car.rotation = 0.15;
    } else {
      this.car.rotation *= 0.8;
    }

    const centrifugalForce = this.roadCurvature * (this.car.speed / 8.0) * 0.02;
    this.car.x += steering - centrifugalForce;

    if (this.car.x < 0.1) { this.car.x = 0.1; this.car.speed *= 0.95; }
    if (this.car.x > 0.9) { this.car.x = 0.9; this.car.speed *= 0.95; }

    // --- VITESSE ---
    if (keys.has('arrowup') || keys.has('z') || keys.has('w')) {
      this.car.speed = Math.min(8.0, this.car.speed + 0.1); 
    } else if (keys.has('arrowdown') || keys.has('s')) {
      this.car.speed = Math.max(0, this.car.speed - 0.2);
    } else {
      this.car.speed = Math.max(0, this.car.speed - 0.05);
    }

    // --- DISTANCE & VITESSE BOSS ---
    const bossSpeed = Math.max(1.5, 3.5 - (nameLen * 0.1));
    const relativeSpeed = this.car.speed - bossSpeed;
    
    if (this.car.z > 0 || this.car.speed > 0) {
        this.distanceToBoss -= relativeSpeed * 4; 
    }
    
    if (this.distanceToBoss < 0) this.distanceToBoss = 0;
    if (this.distanceToBoss > INITIAL_DISTANCE_TO_BOSS * 2) this.distanceToBoss = INITIAL_DISTANCE_TO_BOSS * 2;

    this.car.z += this.car.speed * 100;
    this.boss.z = this.car.z + this.distanceToBoss;

    // --- IA BOSS & SPAWN ---
    this.bossMoveTimer += 0.05;
    this.boss.x = 0.5 + Math.sin(this.bossMoveTimer) * 0.4 - (this.roadCurvature * 0.1);

    const baseRate = Math.max(10, Math.floor(this.distanceToBoss / 300));
    const extraDelay = Math.min(60, nameLen * 3);
    const dynamicSpawnRate = baseRate + extraDelay;

    this.boss.spawnTimer++;
    if (this.boss.spawnTimer >= dynamicSpawnRate) {
      this.spawnObstacle();
      this.boss.spawnTimer = 0;
    }

    // --- COLLISIONS ---
    this.obstacles = this.obstacles.filter((obs) => obs.z > this.car.z - 200);
    if (this.collisionFrame > 0) this.collisionFrame--;

    const carWidth = 80;
    const roadWidth = 3000;

    this.obstacles.forEach((obstacle) => {
      const distanceZ = Math.abs(obstacle.z - this.car.z);
      
      if (distanceZ < 250) { 
        const carWorldX = (this.car.x - 0.5) * roadWidth;
        const obstacleWorldX = (obstacle.x - 0.5) * roadWidth;
        const obstacleWidthPx = obstacle.width * roadWidth;
        
        const distanceX = Math.abs(obstacleWorldX - carWorldX);
        const collisionThreshold = (carWidth + obstacleWidthPx) / 2;

        if (distanceX < collisionThreshold * 0.8) {
          const penalty = 2000;
          this.distanceToBoss += penalty;
          this.car.speed = 1.0; 
          obstacle.z = -99999;
          this.collisionFrame = 15; 
        }
      }
    });

    const hasWon = this.distanceToBoss <= 100;

    return {
      car: { ...this.car },
      obstacles: this.obstacles,
      boss: { ...this.boss },
      distanceToBoss: this.distanceToBoss,
      isGameOver: hasWon,
      hasWon: hasWon,
      collisionFrame: this.collisionFrame,
      roadCurvature: this.roadCurvature
    };
  }

  reset(bossName: string = 'Boss'): void {
    this.car = { x: 0.5, z: 0, speed: 0, rotation: 0 };
    this.distanceToBoss = INITIAL_DISTANCE_TO_BOSS;
    this.boss = { x: 0.5, y: 200, z: this.distanceToBoss, name: bossName, spawnTimer: 0 };
    this.obstacles = [];
    this.bossMoveTimer = 0;
    this.collisionFrame = 0;
    this.roadCurvature = 0;
    this.targetCurvature = 0;
    this.curveTimer = 0;
  }
}