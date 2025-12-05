// Hitboxes des attaques du joueur
// Coordonnées absolues depuis l'éditeur (joueur à x: 355, y: 400 dans l'éditeur)
// CANVAS_WIDTH/2 - 45 = 400 - 45 = 355
// CANVAS_HEIGHT - 200 = 600 - 200 = 400

export interface AttackHitbox {
  x: number; // Position X relative au joueur (depuis l'éditeur)
  y: number; // Position Y relative au joueur (depuis l'éditeur)
  width: number;
  height: number;
}

// Coordonnées depuis l'éditeur (absolues)
// Joueur dans l'éditeur: x=355, y=400
const EDITOR_PLAYER_X = 355;
const EDITOR_PLAYER_Y = 400;

export const ATTACK_HITBOXES: Record<'light' | 'medium' | 'heavy', AttackHitbox> = {
  light: {
    x: 392 - EDITOR_PLAYER_X, // 392 - 355 = 37
    y: 388 - EDITOR_PLAYER_Y, // 388 - 400 = -12
    width: 118,
    height: 64,
  },
  medium: {
    x: 378 - EDITOR_PLAYER_X, // 378 - 355 = 23
    y: 383 - EDITOR_PLAYER_Y, // 383 - 400 = -17
    width: 93,
    height: 161,
  },
  heavy: {
    x: 282 - EDITOR_PLAYER_X, // 282 - 355 = -73
    y: 364 - EDITOR_PLAYER_Y, // 364 - 400 = -36
    width: 222,
    height: 194,
  },
};

// Hitbox de la super attaque
export const SUPER_ATTACK_HITBOX: AttackHitbox = {
  x: 308 - EDITOR_PLAYER_X, // 308 - 355 = -47
  y: 364 - EDITOR_PLAYER_Y, // 364 - 400 = -36
  width: 209, // Arrondi de 209.08331298828125
  height: 195, // Arrondi de 194.88333129882812
};

// Fonction pour obtenir la hitbox d'une attaque en fonction de la position et direction du joueur
export const getAttackHitbox = (
  attackType: 'light' | 'medium' | 'heavy',
  playerX: number,
  playerY: number,
  facingRight: boolean
): { x: number; y: number; width: number; height: number } => {
  const baseHitbox = ATTACK_HITBOXES[attackType];
  
  // Position absolue de la hitbox (basée sur les coordonnées de l'éditeur)
  let x = playerX + baseHitbox.x;
  const y = playerY + baseHitbox.y;
  
  // Si le joueur regarde à gauche, inverser la position X par rapport au centre du joueur
  if (!facingRight) {
    const playerCenterX = playerX + 45; // 45 = player.width / 2
    const hitboxCenterX = x + baseHitbox.width / 2;
    const offsetFromCenter = hitboxCenterX - playerCenterX;
    x = playerCenterX - offsetFromCenter - baseHitbox.width;
  }
  
  return {
    x,
    y,
    width: baseHitbox.width,
    height: baseHitbox.height,
  };
};

// Fonction pour obtenir la hitbox de la super attaque
export const getSuperAttackHitbox = (
  playerX: number,
  playerY: number,
  facingRight: boolean
): { x: number; y: number; width: number; height: number } => {
  // Position absolue de la hitbox
  let x = playerX + SUPER_ATTACK_HITBOX.x;
  const y = playerY + SUPER_ATTACK_HITBOX.y;
  
  // Si le joueur regarde à gauche, inverser la position X
  if (!facingRight) {
    const playerCenterX = playerX + 45;
    const hitboxCenterX = x + SUPER_ATTACK_HITBOX.width / 2;
    const offsetFromCenter = hitboxCenterX - playerCenterX;
    x = playerCenterX - offsetFromCenter - SUPER_ATTACK_HITBOX.width;
  }
  
  return {
    x,
    y,
    width: SUPER_ATTACK_HITBOX.width,
    height: SUPER_ATTACK_HITBOX.height,
  };
};

