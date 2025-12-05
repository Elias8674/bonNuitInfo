// src/types/player.ts

export type AttackType = 'light' | 'medium' | 'heavy';
export type ActionType = 'grab' | 'attack' | 'defend';

export enum PlayerState {
  IDLE = 'idle',
  WALKING = 'walking',
  ATTACKING = 'attacking',
  PUSHING = 'pushing',
  HIT = 'hit',
  GETTING_UP = 'gettingUp',
  ROLLING = 'rolling',
  SUPER_ATTACKING = 'superAttacking',
  GRAB_THROWING = 'grabThrowing',
  DEFENDING = 'defending',
  JUMPING = 'jumping',
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  state: PlayerState;
  attackType: AttackType | null;
  facingRight: boolean;
  speed: number;
  isMoving: boolean;
  lastX: number;
  velocityY: number;
  groundY: number;
  isMovingBackward: boolean;
  stateFrame: number;
}

export const createPlayer = (x: number, y: number): Player => ({
  x,
  y,
  width: 180,
  height: 300,
  health: 100,
  maxHealth: 100,
  state: PlayerState.IDLE,
  attackType: null,
  facingRight: true,
  speed: 20, // VITESSE AUGMENTÉE (était 12)
  isMoving: false,
  lastX: x,
  velocityY: 0,
  groundY: y,
  isMovingBackward: false,
  stateFrame: 0,
});