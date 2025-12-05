import type { Player } from '../../types/player';
import { PlayerState } from '../../types/player';
import { stickAnimation } from '../../utils/stickAnimation';
import { RENDER_DURATIONS, ATTACK_DURATION } from '../../config/animationDurations';

// Initialiser le chargement des frames
let animationInitialized = false;
if (!animationInitialized) {
  stickAnimation.loadFrames();
  animationInitialized = true;
}

interface StickminPlayerProps {
  player: Player;
  ctx: CanvasRenderingContext2D;
  animationFrame: number;
}

export const renderStickminPlayer = ({ player, ctx, animationFrame }: StickminPlayerProps): void => {
  ctx.save();

  // Frames codées en dur
  const walkFrames = stickAnimation.getWalkFrames();
  const lightAttackFrames = stickAnimation.getLightAttackFrames();
  const mediumAttackFrames = stickAnimation.getMediumAttackFrames();
  const heavyAttackFrames = stickAnimation.getHeavyAttackFrames();
  const hitFrames = stickAnimation.getHitFrames();
  const grabThrowFrames = stickAnimation.getGrabThrowFrames();
  const getUpFrames = stickAnimation.getGetUpFrames();
  const rollFrames = stickAnimation.getRollFrames();
  const superAttackFrames = stickAnimation.getSuperAttackFrames();
  
  let currentFrameNumber: number | null = null;

  // Utiliser le state pour déterminer l'animation
  switch (player.state) {
    case PlayerState.HIT: {
      const hitProgress = Math.min(1, player.stateFrame / RENDER_DURATIONS.hit);
      const hitFrameIndex = Math.floor(hitProgress * hitFrames.length);
      const clampedIndex = Math.min(hitFrameIndex, hitFrames.length - 1);
      currentFrameNumber = hitFrames[clampedIndex];
      break;
    }
    case PlayerState.GRAB_THROWING: {
      const throwProgress = Math.min(1, player.stateFrame / RENDER_DURATIONS.grabThrowing);
      const throwFrameIndex = Math.floor(throwProgress * grabThrowFrames.length);
      const clampedIndex = Math.min(throwFrameIndex, grabThrowFrames.length - 1);
      currentFrameNumber = grabThrowFrames[clampedIndex];
      break;
    }
    case PlayerState.GETTING_UP: {
      const getUpProgress = Math.min(1, player.stateFrame / RENDER_DURATIONS.gettingUp);
      const getUpFrameIndex = Math.floor(getUpProgress * getUpFrames.length);
      const clampedIndex = Math.min(getUpFrameIndex, getUpFrames.length - 1);
      currentFrameNumber = getUpFrames[clampedIndex];
      break;
    }
    case PlayerState.ROLLING: {
      const rollProgress = Math.min(1, player.stateFrame / RENDER_DURATIONS.rolling);
      const rollFrameIndex = Math.floor(rollProgress * rollFrames.length);
      const clampedIndex = Math.min(rollFrameIndex, rollFrames.length - 1);
      currentFrameNumber = rollFrames[clampedIndex];
      break;
    }
    case PlayerState.SUPER_ATTACKING: {
      const superProgress = Math.min(1, player.stateFrame / RENDER_DURATIONS.superAttacking);
      const superFrameIndex = Math.floor(superProgress * superAttackFrames.length);
      const clampedIndex = Math.min(superFrameIndex, superAttackFrames.length - 1);
      currentFrameNumber = superAttackFrames[clampedIndex];
      break;
    }
    case PlayerState.ATTACKING: {
      if (player.attackType) {
        let attackFrames: number[];
        let attackDuration: number;
        
        switch (player.attackType) {
          case 'light':
            attackFrames = lightAttackFrames;
            attackDuration = ATTACK_DURATION.light;
            break;
          case 'medium':
            attackFrames = mediumAttackFrames;
            attackDuration = ATTACK_DURATION.medium;
            break;
          case 'heavy':
            attackFrames = heavyAttackFrames;
            attackDuration = ATTACK_DURATION.heavy;
            break;
          default:
            attackFrames = lightAttackFrames;
            attackDuration = ATTACK_DURATION.light;
        }
        
        // Utiliser player.stateFrame au lieu de animationFrame pour suivre la progression de l'attaque
        const attackProgress = Math.min(1, player.stateFrame / attackDuration);
        const attackFrameIndex = Math.floor(attackProgress * attackFrames.length);
        const clampedIndex = Math.min(attackFrameIndex, attackFrames.length - 1);
        currentFrameNumber = attackFrames[clampedIndex];
      }
      break;
    }
    case PlayerState.WALKING: {
      const walkFrameIndex = Math.floor(animationFrame / 3) % walkFrames.length;
      if (player.isMovingBackward) {
        const reversedIndex = walkFrames.length - 1 - walkFrameIndex;
        currentFrameNumber = walkFrames[reversedIndex];
      } else {
        currentFrameNumber = walkFrames[walkFrameIndex];
      }
      break;
    }
    case PlayerState.IDLE:
    case PlayerState.DEFENDING:
    case PlayerState.JUMPING:
    case PlayerState.PUSHING: // Pousette (remplace grab)
    default: {
      // Frame statique (première frame de marche)
      currentFrameNumber = walkFrames[0];
      break;
    }
  }
  
  // Obtenir l'image de la frame actuelle
  const currentFrame = currentFrameNumber ? stickAnimation.getFrame(currentFrameNumber) : null;

  if (currentFrame && stickAnimation.isLoaded()) {
    // Facteur d'échelle pour agrandir visuellement l'image (sans changer la hitbox)
    const visualScale = 2.5; // 150% plus grand
    
    // Ratio de l'image : 550x400 (plus large que haut)
    const imageRatio = 550 / 400; // 1.375
    
    // Calculer les dimensions visuelles en respectant le ratio 550x400
    // On part de la hauteur et on ajuste la largeur selon le ratio
    const visualHeight = player.height * visualScale;
    const visualWidth = visualHeight * imageRatio; // Plus large que haut
    
    // Calculer le décalage pour centrer l'image agrandie sur la hitbox
    const offsetX = (visualWidth - player.width) / 2;
    // Remonter le joueur pour qu'il ne soit pas dans le sol
    const offsetY = (visualHeight - player.height) / 2 + 110; // +100 pour le remonter davantage
    
    // Afficher l'image du stickman agrandie et centrée
    ctx.save();
    if (!player.facingRight) {
      ctx.scale(-1, 1);
      ctx.drawImage(
        currentFrame,
        -player.x - player.width - offsetX,
        player.y - offsetY,
        visualWidth,
        visualHeight
      );
    } else {
      ctx.drawImage(
        currentFrame,
        player.x - offsetX,
        player.y - offsetY,
        visualWidth,
        visualHeight
      );
    }
    ctx.restore();
  } else {
    // Fallback : dessiner un stickman simple si les images ne sont pas chargées
    const centerX = player.x + player.width / 2;
    const headY = player.y + 25;
    const headRadius = 20;
    const bodyStartY = headY + headRadius;
    const bodyEndY = player.y + player.height - 50;
    const shoulderY = bodyStartY + 25;
    const hipY = bodyEndY;

    // Tête
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX, headY, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Corps (ligne verticale)
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX, bodyStartY);
    ctx.lineTo(centerX, bodyEndY);
    ctx.stroke();

    // Bras
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX, shoulderY);
    ctx.lineTo(centerX - 30, shoulderY + 15);
    ctx.moveTo(centerX, shoulderY);
    ctx.lineTo(centerX + 30, shoulderY + 15);
    ctx.stroke();

    // Jambes
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX, hipY);
    ctx.lineTo(centerX - 20, hipY + 35);
    ctx.moveTo(centerX, hipY);
    ctx.lineTo(centerX + 20, hipY + 35);
    ctx.stroke();
  }

  // Le sabre laser est déjà inclus dans les animations d'attaque

  // Boule bleue de protection
  if (player.state === PlayerState.DEFENDING) {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    const radius = Math.max(player.width, player.height) / 2 + 20; // Rayon légèrement plus grand que le personnage
    
    // Effet de pulsation
    const pulse = Math.sin(animationFrame * 0.3) * 5;
    const currentRadius = radius + pulse;
    
    // Cercle bleu avec transparence
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#0066ff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Bordure bleue plus foncée
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#0044cc';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
};
