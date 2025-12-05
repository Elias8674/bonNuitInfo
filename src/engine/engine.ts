// src/engine/engine.ts
import { createPlayer, PlayerState } from '../types/player';
import { createBoss, type Laser } from '../types/boss';
import type { Player } from '../types/player';
import type { Boss } from '../types/boss';
import { getAttackHitbox, getSuperAttackHitbox } from '../utils/attackHitboxes';
import { STATE_DURATIONS, ATTACK_DURATION } from '../config/animationDurations';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const ATTACK_DAMAGE = {
  light: 5,   // Augmenté (était 3)
  medium: 10, // Augmenté (était 5)
  heavy: 20,  // Augmenté (était 10)
} as const;

export interface GameState {
  player: Player;
  boss: Boss;
  bossDefeated: boolean;
  playerDefeated: boolean;
}

export class GameEngine {
  private player: Player;
  private boss: Boss;
  private attackFrame: number = 0;
  private bossAttackFrame: number = 0;
  private grabFrame: number = 0;
  private lastHitFrame: number = 0;

  private currentWidth: number;
  private currentHeight: number;

  private gravity: number = 0.9;
  private jumpStrength: number = -22;
  
  private lastDirectionKey: string | null = null;
  private lastDirectionTime: number = 0;
  private readonly doubleTapDelay: number = 300;
  private previousDirectionKeys: Set<string> = new Set();

  constructor(bossName: string, width: number = 800, height: number = 600) {
    this.currentWidth = width;
    this.currentHeight = height;

    const groundY = height - 50;
    
    this.player = createPlayer(200, groundY - 300 - 30);
    this.player.groundY = groundY - 300 - 30; 
    this.player.speed = 20; 

    this.boss = createBoss(bossName, width - 600, groundY - 500 - 30);
    this.boss.lasers = [];
  }

  update(keys: Set<string>): GameState {
    if (this.player.health <= 0 || this.boss.health <= 0) {
        return this.getState();
    }

    this.updatePlayer(keys);
    this.updateBoss();
    this.updateLasers();
    this.checkCollisions();
    return this.getState();
  }

  private updatePlayer(keys: Set<string>): void {
    const blockingStates: PlayerState[] = [
      PlayerState.HIT,
      PlayerState.GETTING_UP,
      PlayerState.GRAB_THROWING,
      PlayerState.ROLLING,
      PlayerState.SUPER_ATTACKING,
    ];
    
    const isInBlockingState = blockingStates.includes(this.player.state);
    
    if (isInBlockingState) {
      this.player.stateFrame++;
      const duration = STATE_DURATIONS[this.player.state];
      if (this.player.stateFrame >= duration) {
        this.player.state = PlayerState.IDLE;
        this.player.stateFrame = 0;
      }
    }
    
    if (this.player.state === PlayerState.ATTACKING) {
      this.attackFrame++;
      this.player.stateFrame = this.attackFrame;
      if (this.attackFrame >= ATTACK_DURATION[this.player.attackType || 'light']) {
        this.player.state = PlayerState.IDLE;
        this.player.attackType = null;
        this.attackFrame = 0;
        this.player.stateFrame = 0;
      }
    }
    
    if (this.player.state === PlayerState.PUSHING) {
      this.grabFrame++;
      if (this.grabFrame >= 30) {
        this.player.state = PlayerState.IDLE;
        this.grabFrame = 0;
        this.player.stateFrame = 0;
      }
    }
    
    if (this.player.state === PlayerState.ROLLING) {
      const rollSpeed = this.player.speed * 3.0; 
      if (this.player.facingRight) {
        this.player.x = Math.min(this.player.x + rollSpeed, this.currentWidth - this.player.width);
      } else {
        this.player.x = Math.max(this.player.x - rollSpeed, 0);
      }
    }

    if (keys.has('backspace') && !isInBlockingState) {
      this.player.state = PlayerState.DEFENDING;
    } else if (this.player.state === PlayerState.DEFENDING && !keys.has('backspace')) {
      this.player.state = PlayerState.IDLE;
    }

    if ((keys.has(' ') || keys.has('z') || keys.has('w')) && 
        this.player.state !== PlayerState.JUMPING && 
        this.player.y >= this.player.groundY - 10 &&
        !isInBlockingState) {
      this.player.velocityY = this.jumpStrength;
      this.player.state = PlayerState.JUMPING;
    }

    this.player.velocityY += this.gravity;
    this.player.y += this.player.velocityY;
    
    if (this.player.y >= this.player.groundY) {
      this.player.y = this.player.groundY;
      this.player.velocityY = 0;
      if (this.player.state === PlayerState.JUMPING) {
        this.player.state = PlayerState.IDLE;
      }
    }

    const previousX = this.player.x;
    
    if (!isInBlockingState && this.player.state !== PlayerState.ATTACKING && this.player.state !== PlayerState.PUSHING) {
      const currentTime = Date.now();
      const currentDirectionKeys = new Set<string>();
      
      if (keys.has('arrowright') || keys.has('d')) currentDirectionKeys.add('right');
      if (keys.has('arrowleft') || keys.has('a') || keys.has('q')) currentDirectionKeys.add('left');
      
      const rightJustPressed = currentDirectionKeys.has('right') && !this.previousDirectionKeys.has('right');
      const leftJustPressed = currentDirectionKeys.has('left') && !this.previousDirectionKeys.has('left');
      
      if (currentDirectionKeys.has('right')) {
         if (rightJustPressed && this.lastDirectionKey === 'right' && currentTime - this.lastDirectionTime < this.doubleTapDelay) {
            this.player.state = PlayerState.ROLLING;
            this.player.stateFrame = 0;
         } else {
            this.player.x = Math.min(this.player.x + this.player.speed, this.currentWidth - this.player.width);
            this.player.facingRight = true;
            if (this.player.state === PlayerState.IDLE) this.player.state = PlayerState.WALKING;
            if (rightJustPressed) {
                this.lastDirectionKey = 'right';
                this.lastDirectionTime = currentTime;
            }
         }
      }
      
      if (currentDirectionKeys.has('left')) {
         if (leftJustPressed && this.lastDirectionKey === 'left' && currentTime - this.lastDirectionTime < this.doubleTapDelay) {
            this.player.state = PlayerState.ROLLING;
            this.player.stateFrame = 0;
         } else {
            this.player.x = Math.max(this.player.x - this.player.speed, 0);
            this.player.facingRight = false;
            if (this.player.state === PlayerState.IDLE) this.player.state = PlayerState.WALKING;
            if (leftJustPressed) {
                this.lastDirectionKey = 'left';
                this.lastDirectionTime = currentTime;
            }
         }
      }
      
      this.previousDirectionKeys = currentDirectionKeys;
    } else {
      this.previousDirectionKeys.clear();
    }
    
    this.player.isMoving = Math.abs(this.player.x - previousX) > 0.1;
    const movedRight = this.player.x > previousX;
    this.player.isMovingBackward = this.player.isMoving && ((movedRight && !this.player.facingRight) || (!movedRight && this.player.facingRight));
    
    if (!this.player.isMoving && this.player.state === PlayerState.WALKING && !isInBlockingState) {
      this.player.state = PlayerState.IDLE;
    }
    
    this.player.lastX = previousX;

    if (!isInBlockingState && this.player.state !== PlayerState.ATTACKING && this.player.state !== PlayerState.PUSHING) {
      if (keys.has('j') && keys.has('k') && keys.has('l')) {
        this.player.state = PlayerState.SUPER_ATTACKING;
        this.player.stateFrame = 0;
      } else if (keys.has('j')) {
        this.player.state = PlayerState.ATTACKING;
        this.player.attackType = 'light';
        this.attackFrame = 0;
        this.player.stateFrame = 0;
      } else if (keys.has('k')) {
        this.player.state = PlayerState.ATTACKING;
        this.player.attackType = 'medium';
        this.attackFrame = 0;
        this.player.stateFrame = 0;
      } else if (keys.has('l')) {
        this.player.state = PlayerState.ATTACKING;
        this.player.attackType = 'heavy';
        this.attackFrame = 0;
        this.player.stateFrame = 0;
      } else if (keys.has('g')) {
        this.player.state = PlayerState.PUSHING;
        this.grabFrame = 0;
      }
    }
  }

  private updateBoss(): void {
    const distance = Math.abs(this.boss.x - this.player.x);

    if (distance > 80) {
      if (this.boss.x > this.player.x) {
        this.boss.x = Math.max(this.boss.x - this.boss.speed, 0);
        this.boss.facingRight = false;
      } else {
        this.boss.x = Math.min(this.boss.x + this.boss.speed, this.currentWidth - this.boss.width);
        this.boss.facingRight = true;
      }
    }

    if (distance < 500 && Math.random() < 0.05 && !this.boss.isAttacking) {
      this.boss.isAttacking = true;
      this.bossAttackFrame = 0;
      
      const bossCenterX = this.boss.x + this.boss.width / 2;
      const bossCenterY = this.boss.y + this.boss.height / 2;
      const playerCenterX = this.player.x + this.player.width / 2;
      const playerCenterY = this.player.y + this.player.height / 2;
      
      const laser: Laser = {
        id: Date.now().toString(),
        x: bossCenterX,
        y: bossCenterY,
        targetX: playerCenterX,
        targetY: playerCenterY,
        progress: 0,
        speed: 0.08,
        color: '#ff0000',
        damage: 15,
      };
      
      this.boss.lasers.push(laser);
    }

    if (this.boss.isAttacking) {
      this.bossAttackFrame++;
      if (this.bossAttackFrame >= 20) {
        this.boss.isAttacking = false;
        this.bossAttackFrame = 0;
      }
    }
  }

  private updateLasers(): void {
    this.boss.lasers = this.boss.lasers.filter((laser) => {
      laser.progress += laser.speed;
      return laser.progress < 1;
    });
  }

  private checkCollisions(): void {
    const playerRect = {
      x: this.player.x,
      y: this.player.y,
      width: this.player.width,
      height: this.player.height,
    };
    const bossRect = {
      x: this.boss.x,
      y: this.boss.y,
      width: this.boss.width,
      height: this.boss.height,
    };

    if (this.player.state === PlayerState.ATTACKING && this.player.attackType) {
      this.attackFrame++;
      const hitbox = getAttackHitbox(
        this.player.attackType,
        this.player.x,
        this.player.y,
        this.player.facingRight
      );
      
      // HITBOX DU BOSS AGRANDIE POUR LES COLLISIONS
      // On ajoute une marge de tolérance de 50px autour du boss
      const hitMargin = 50;
      
      const isHitting = 
        hitbox.x < bossRect.x + bossRect.width + hitMargin &&
        hitbox.x + hitbox.width > bossRect.x - hitMargin &&
        hitbox.y < bossRect.y + bossRect.height + hitMargin &&
        hitbox.y + hitbox.height > bossRect.y - hitMargin &&
        !this.boss.isDefending &&
        this.attackFrame > 1 &&
        this.player.attackType &&
        this.attackFrame < ATTACK_DURATION[this.player.attackType] - 1 &&
        this.lastHitFrame !== this.attackFrame &&
        this.player.state === PlayerState.ATTACKING;

      if (isHitting && this.player.attackType) {
        const damage = ATTACK_DAMAGE[this.player.attackType];
        this.boss.health = Math.max(0, this.boss.health - damage);
        this.lastHitFrame = this.attackFrame;
      }
    }

    if (this.player.state === PlayerState.SUPER_ATTACKING) {
      const hitbox = getSuperAttackHitbox(
        this.player.x,
        this.player.y,
        this.player.facingRight
      );
      
      const hitMargin = 50;

      const isHitting = 
        hitbox.x < bossRect.x + bossRect.width + hitMargin &&
        hitbox.x + hitbox.width > bossRect.x - hitMargin &&
        hitbox.y < bossRect.y + bossRect.height + hitMargin &&
        hitbox.y + hitbox.height > bossRect.y - hitMargin &&
        !this.boss.isDefending &&
        this.player.stateFrame > 5 &&
        this.player.stateFrame < STATE_DURATIONS[PlayerState.SUPER_ATTACKING] - 5 &&
        this.lastHitFrame !== this.player.stateFrame;

      if (isHitting) {
        this.boss.health = Math.max(0, this.boss.health - 30);
        this.lastHitFrame = this.player.stateFrame;
      }
    }

    if (this.player.state === PlayerState.PUSHING) {
      this.grabFrame++;
      const pushRange = 100;
      const distance = Math.abs((this.player.x + this.player.width/2) - (this.boss.x + this.boss.width/2));
      
      if (distance < pushRange && this.grabFrame === 5) {
        const pushForce = 150;
        if (this.player.facingRight) {
          this.boss.x = Math.min(this.boss.x + pushForce, this.currentWidth - this.boss.width);
        } else {
          this.boss.x = Math.max(this.boss.x - pushForce, 0);
        }
        this.boss.health = Math.max(0, this.boss.health - 10);
        this.boss.isAttacking = false;
      }
    }

    this.boss.lasers.forEach((laser) => {
      const laserX = laser.x + (laser.targetX - laser.x) * laser.progress;
      const laserY = laser.y + (laser.targetY - laser.y) * laser.progress;
      
      const laserRadius = 15;
      const distanceToPlayer = Math.sqrt(
        Math.pow(laserX - (playerRect.x + playerRect.width / 2), 2) +
        Math.pow(laserY - (playerRect.y + playerRect.height / 2), 2)
      );
      
      if (
        distanceToPlayer < laserRadius + Math.max(playerRect.width, playerRect.height) / 2 &&
        this.player.state !== PlayerState.DEFENDING &&
        this.player.state !== PlayerState.ROLLING
      ) {
        this.player.health = Math.max(0, this.player.health - laser.damage);
        this.player.state = PlayerState.HIT;
        this.player.stateFrame = 0;
        this.boss.lasers = this.boss.lasers.filter((l) => l.id !== laser.id);
      }
    });
  }

  getState(): GameState {
    return {
      player: { ...this.player },
      boss: { ...this.boss },
      bossDefeated: this.boss.health <= 0,
      playerDefeated: this.player.health <= 0,
    };
  }

  reset(bossName: string): void {
    const groundY = this.currentHeight - 50;
    
    this.player = createPlayer(200, groundY - 300 - 30);
    this.player.groundY = groundY - 300 - 30;
    this.player.speed = 20; 
    this.player.velocityY = 0;
    
    this.boss = createBoss(bossName, this.currentWidth - 600, groundY - 500 - 30);
    this.boss.lasers = [];
    
    this.attackFrame = 0;
    this.bossAttackFrame = 0;
    this.grabFrame = 0;
    this.lastHitFrame = 0;
  }
}