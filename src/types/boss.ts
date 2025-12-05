export interface Laser {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  color: string;
  damage: number;
}

export interface Boss {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  name: string;
  isAttacking: boolean;
  attackType: 'light' | 'medium' | 'heavy' | null;
  isDefending: boolean;
  facingRight: boolean;
  speed: number;
  lasers: Laser[];
}

export const createBoss = (name: string, x: number, y: number): Boss => {
  // LIMITATION : On plafonne la vie à 1000 PV max
  // Même avec un nom de 50 lettres, il n'aura pas 2800 PV.
  const rawHealth = 300 + (name.length * 50);
  const dynamicHealth = Math.min(1000, rawHealth);

  return {
    x,
    y,
    width: 400,
    height: 500,
    health: dynamicHealth,
    maxHealth: dynamicHealth,
    name,
    isAttacking: false,
    attackType: null,
    isDefending: false,
    facingRight: false,
    speed: 6,
    lasers: [],
  };
};