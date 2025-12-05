// src/components/BossRenderer.tsx
import type { Boss } from '../../types/boss';

interface BossRendererProps {
  boss: Boss;
  ctx: CanvasRenderingContext2D;
  animationFrame: number;
  lasers?: Array<{ x: number; y: number; targetX: number; targetY: number; progress: number; color: string }>;
}

export const renderBoss = ({ boss, ctx, animationFrame, lasers = [] }: BossRendererProps): void => {
  ctx.save();

  const bossCenterX = boss.x + boss.width / 2;
  
  // Animation
  const legSwing = Math.sin(animationFrame * 0.3) * 20; // Swing plus grand pour les grandes jambes
  const armSwing = Math.sin(animationFrame * 0.25) * 15;
  
  // PROPORTIONS DYNAMIQUES
  // On divise la hauteur totale : 60% corps (input), 40% jambes
  const bodyHeight = boss.height * 0.6;
  const legHeight = boss.height * 0.4;
  
  // Position du corps (il commence en haut de la hitbox)
  const inputY = boss.y;
  
  // 1. DESSIN DU CORPS (CHAMP DE SAISIE)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(boss.x, inputY, boss.width, bodyHeight);
  
  // Bordure épaisse
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 8; // Lignes plus épaisses pour le look cartoon
  ctx.strokeRect(boss.x, inputY, boss.width, bodyHeight);
  
  // Texte (Nom du Boss) - Taille adaptée
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${Math.min(40, boss.width / 10)}px Arial`; // Police adaptative
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(boss.name, bossCenterX, inputY + bodyHeight / 2);
  
  // 2. JAMBES (Partent du bas du corps jusqu'au bas de la hitbox)
  const legStartY = inputY + bodyHeight;
  const leftLegX = boss.x + boss.width * 0.25;
  const rightLegX = boss.x + boss.width * 0.75;
  
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 12; // Jambes robustes
  ctx.lineCap = 'round';
  
  // Jambe gauche
  ctx.beginPath();
  ctx.moveTo(leftLegX, legStartY);
  ctx.lineTo(leftLegX - legSwing, legStartY + legHeight);
  ctx.stroke();
  
  // Jambe droite
  ctx.beginPath();
  ctx.moveTo(rightLegX, legStartY);
  ctx.lineTo(rightLegX + legSwing, legStartY + legHeight);
  ctx.stroke();
  
  // 3. BRAS (Sur les côtés du corps)
  const armY = inputY + bodyHeight * 0.4;
  
  // Bras gauche
  ctx.beginPath();
  ctx.moveTo(boss.x, armY);
  ctx.lineTo(boss.x - 50 + armSwing, armY + 50);
  ctx.stroke();
  
  // Bras droit
  ctx.beginPath();
  ctx.moveTo(boss.x + boss.width, armY);
  ctx.lineTo(boss.x + boss.width + 50 - armSwing, armY + 50);
  ctx.stroke();
  
  // 4. LASERS
  lasers.forEach((laser) => {
    const currentX = laser.x + (laser.targetX - laser.x) * laser.progress;
    const currentY = laser.y + (laser.targetY - laser.y) * laser.progress;
    
    ctx.shadowBlur = 20;
    ctx.shadowColor = laser.color;
    ctx.strokeStyle = laser.color;
    ctx.lineWidth = 15; // Lasers plus gros
    ctx.beginPath();
    ctx.moveTo(laser.x, laser.y);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    
    // Coeur blanc du laser
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(laser.x, laser.y);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
  });

  ctx.restore();
};