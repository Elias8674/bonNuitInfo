// src/components/GameCanvas.tsx
import { useEffect, useRef, useState } from 'react';
import { GameEngine, type GameState } from '../../engine/engine';
import { renderPlayer } from './PlayerRenderer';
import { renderBoss } from './BossRenderer';
import { stickAnimation } from '../../utils/stickAnimation';

interface GameCanvasProps {
  bossName: string;
  onBossDefeated?: () => void;
  onPlayerDefeated?: () => void;
}

export const GameCanvas = ({ bossName, onBossDefeated, onPlayerDefeated }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });
  const engineRef = useRef<GameEngine>(new GameEngine(bossName, window.innerWidth, window.innerHeight));
  const keysRef = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number>(0);
  
  // Pour le throttle FPS
  const lastFrameTimeRef = useRef<number>(0);
  const FPS = 15;
  const FRAME_INTERVAL = 1000 / FPS;

  useEffect(() => {
    const handleResize = () => {
        setDimensions({ w: window.innerWidth, h: window.innerHeight });
        engineRef.current = new GameEngine(bossName, window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [bossName]);

  useEffect(() => {
    stickAnimation.loadFrames();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.w;
    canvas.height = dimensions.h;

    const handleKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase());
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const stars = Array(200).fill(0).map(() => ({
        x: Math.random() * dimensions.w,
        y: Math.random() * dimensions.h,
        size: Math.random() * 2,
        blink: Math.random()
    }));

    const gameLoop = (timestamp: number) => {
      // Throttle pour 15 FPS
      const elapsed = timestamp - lastFrameTimeRef.current;
      
      if (elapsed > FRAME_INTERVAL) {
          lastFrameTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL);
          animationFrameRef.current++;
          
          const gameState: GameState = engineRef.current.update(keysRef.current);

          if (gameState.bossDefeated && onBossDefeated) {
            onBossDefeated();
            return;
          }
          if (gameState.playerDefeated && onPlayerDefeated) {
            onPlayerDefeated();
            return;
          }

          // DESSIN
          // Fond
          const grad = ctx.createLinearGradient(0, 0, 0, dimensions.h);
          grad.addColorStop(0, '#020010');
          grad.addColorStop(1, '#1a0b2e');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, dimensions.w, dimensions.h);

          // Etoiles
          ctx.fillStyle = '#fff';
          stars.forEach(star => {
            const opacity = 0.5 + Math.sin(Date.now() * 0.005 + star.blink * 10) * 0.5;
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI*2);
            ctx.fill();
          });
          ctx.globalAlpha = 1;

          // Planète
          ctx.fillStyle = '#111';
          ctx.beginPath();
          ctx.arc(dimensions.w * 0.8, dimensions.h * 0.3, 100, 0, Math.PI*2);
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Sol
          const groundY = dimensions.h - 50;
          ctx.fillStyle = '#222';
          ctx.fillRect(0, groundY, dimensions.w, 50);
          
          ctx.strokeStyle = '#0f0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for(let x=0; x<dimensions.w; x+=50) {
              ctx.moveTo(x + (animationFrameRef.current % 50), groundY);
              ctx.lineTo(x - 20 + (animationFrameRef.current % 50), dimensions.h);
          }
          ctx.stroke();
          
          ctx.strokeStyle = '#0f0';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, groundY); ctx.lineTo(dimensions.w, groundY);
          ctx.stroke();

          // Entités (boss en premier pour qu'il soit derrière le joueur)
          renderBoss({ boss: gameState.boss, ctx, animationFrame: animationFrameRef.current });
          renderPlayer({ player: gameState.player, ctx, animationFrame: animationFrameRef.current });

          // HUD
          const barW = dimensions.w * 0.4;
          const barH = 30;
          const margin = 50;

          // Player UI
          ctx.save();
          ctx.transform(1, 0, -0.2, 1, 0, 0); 
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(margin, 30, barW, barH);
          ctx.fillStyle = '#0ff';
          ctx.fillRect(margin, 30, barW * (gameState.player.health / gameState.player.maxHealth), barH);
          ctx.strokeStyle = '#fff';
          ctx.strokeRect(margin, 30, barW, barH);
          ctx.restore();

          // Boss UI
          ctx.save();
          ctx.transform(1, 0, 0.2, 1, 0, 0);
          const bossBarX = dimensions.w - barW - margin - 20;
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(bossBarX, 30, barW, barH);
          ctx.fillStyle = '#f00';
          ctx.fillRect(bossBarX, 30, barW * (gameState.boss.health / gameState.boss.maxHealth), barH);
          ctx.strokeStyle = '#fff';
          ctx.strokeRect(bossBarX, 30, barW, barH);
          
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'right';
          ctx.fillText(gameState.boss.name.toUpperCase(), bossBarX + barW, 25);
          ctx.restore();
      }

      requestAnimationFrame(gameLoop);
    };

    const frameId = requestAnimationFrame(gameLoop);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        cancelAnimationFrame(frameId);
    };
  }, [dimensions, onBossDefeated, onPlayerDefeated]);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
};