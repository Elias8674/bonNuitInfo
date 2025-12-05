// src/components/FZeroCanvas.tsx
import { useEffect, useRef, useState } from 'react';
import { FZeroEngine, INITIAL_DISTANCE_TO_BOSS } from '../../engine/fzeroEngine';

interface FZeroCanvasProps {
  onClose?: () => void;
  onWin?: () => void;
  bossName?: string;
}

export const FZeroCanvas = ({ onClose, onWin, bossName = 'Boss' }: FZeroCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FZeroEngine>(new FZeroEngine(bossName));
  const keysRef = useRef<Set<string>>(new Set());
  const lastFrameTimeRef = useRef<number>(0);
  
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  const [hud, setHud] = useState({
    distance: INITIAL_DISTANCE_TO_BOSS,
    speed: 0,
    bossName: bossName,
    isGameOver: false,
    hasWon: false,
    collision: false
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    engineRef.current.reset(bossName);
  }, [bossName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    ctx.imageSmoothingEnabled = false;

    const handleKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase());
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const CAMERA_HEIGHT = 800;
    const CAMERA_DISTANCE = 300;
    const ROAD_WIDTH = 3000;
    const SEGMENT_LENGTH = 50;

    const project = (x: number, y: number, z: number, cameraZ: number, curvature: number) => {
      const relZ = z - cameraZ;
      if (relZ <= 10) return null;
      
      const scale = CAMERA_DISTANCE / relZ;
      
      // AJUSTEMENT VIRAGE : Multiplicateur réduit pour des virages plus doux
      // Les virages seront visuellement moins "larges" (moins déportés sur le côté)
      const curveOffset = Math.pow(relZ * 0.01, 2) * curvature * 2.5;
      
      const screenX = dimensions.width / 2 + (x * ROAD_WIDTH) * scale - curveOffset;
      const screenY = dimensions.height / 2 + (CAMERA_HEIGHT - y) * scale;
      
      return { x: screenX, y: screenY, w: ROAD_WIDTH * scale, scale, relZ };
    };

    const drawPolygon = (pts: number[][], color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for(let i=1; i<pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fill();
    };

    const renderGame = (gameState: any) => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      if (gameState.collisionFrame > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${gameState.collisionFrame / 10})`;
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);
        const shake = 30;
        ctx.translate((Math.random()-0.5)*shake, (Math.random()-0.5)*shake);
      } else {
        const shake = gameState.car.speed * 2;
        ctx.translate((Math.random()-0.5)*shake, (Math.random()-0.5)*shake);
      }

      // --- CIEL & SOL TRANSPARENTS ---
      // Opacité réduite à 0.7 pour laisser voir le texte derrière
      const skyGrad = ctx.createLinearGradient(0, 0, 0, dimensions.height / 2);
      skyGrad.addColorStop(0, "rgba(5, 0, 16, 0.7)");
      skyGrad.addColorStop(1, "rgba(48, 0, 96, 0.7)");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height / 2);

      // Sol noir semi-transparent
      ctx.fillStyle = "rgba(17, 17, 17, 0.7)";
      ctx.fillRect(0, dimensions.height / 2, dimensions.width, dimensions.height / 2);

      const cameraZ = gameState.car.z;
      const curvature = gameState.roadCurvature;

      const drawDistance = 300;
      const startSeg = Math.floor(cameraZ / SEGMENT_LENGTH);
      
      for (let i = drawDistance; i > 0; i--) {
        const idx = startSeg + i;
        const zFar = (idx * SEGMENT_LENGTH);
        const zNear = zFar - SEGMENT_LENGTH;

        const pFar = project(0, 0, zFar, cameraZ, curvature);
        const pNear = project(0, 0, zNear, cameraZ, curvature);

        if (!pFar || !pNear) continue;

        const wFar = ROAD_WIDTH * pFar.scale;
        const wNear = ROAD_WIDTH * pNear.scale;
        
        const xFar = pFar.x;
        const xNear = pNear.x;
        const yFar = pFar.y;
        const yNear = pNear.y;

        const isDark = idx % 2 === 0;
        
        drawPolygon([
          [xFar - wFar/2, yFar], [xFar + wFar/2, yFar],
          [xNear + wNear/2, yNear], [xNear - wNear/2, yNear]
        ], isDark ? "#404050" : "#505060");

        const bW = wNear * 0.15;
        const rumbleCol = isDark ? "#cc0000" : "#eeeeee";
        drawPolygon([
          [xFar - wFar/2 - bW, yFar], [xFar - wFar/2, yFar], 
          [xNear - wNear/2, yNear], [xNear - wNear/2 - bW, yNear]
        ], rumbleCol);
        drawPolygon([
          [xFar + wFar/2, yFar], [xFar + wFar/2 + bW, yFar], 
          [xNear + wNear/2 + bW, yNear], [xNear + wNear/2, yNear]
        ], rumbleCol);
      }

      const renderList: any[] = [];
      renderList.push({ type: 'boss', z: gameState.boss.z, x: gameState.boss.x - 0.5, y: 1500, obj: gameState.boss });
      gameState.obstacles.forEach((obs: any) => {
        renderList.push({ type: 'obstacle', z: obs.z, x: obs.x - 0.5, y: 0, w: obs.width, h: obs.height });
      });

      renderList.sort((a, b) => b.z - a.z);

      renderList.forEach(item => {
        const p = project(item.x, item.y, item.z, cameraZ, curvature);
        if (!p) return;

        if (item.type === 'obstacle') {
          const w = 400 * p.scale;
          const h = 600 * p.scale;
          const x = p.x - w/2;
          const y = p.y - h;

          ctx.fillStyle = "#ff0000";
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 5 * p.scale;
          ctx.strokeRect(x, y, w, h);
        } 
        else if (item.type === 'boss') {
          const w = 1200 * p.scale;
          const h = 400 * p.scale;
          const x = p.x - w/2;
          const y = p.y - h/2;

          ctx.fillStyle = "#111";
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = "#f0f";
          ctx.lineWidth = 10 * p.scale;
          ctx.strokeRect(x, y, w, h);

          ctx.fillStyle = "#fff";
          ctx.textAlign = "center";
          ctx.font = `bold ${80 * p.scale}px Arial`;
          ctx.fillText(item.obj.name, p.x, p.y);
        }
      });

      const carScreenX = dimensions.width / 2 + (gameState.car.x - 0.5) * (dimensions.width * 0.8);
      const carScreenY = dimensions.height - 80;
      const carScale = 4.0; 

      ctx.save();
      ctx.translate(carScreenX, carScreenY);
      
      if (keysRef.current.has('arrowleft') || keysRef.current.has('q')) ctx.rotate(-0.15);
      if (keysRef.current.has('arrowright') || keysRef.current.has('d')) ctx.rotate(0.15);
      
      ctx.rotate(curvature * 0.1);

      ctx.translate(0, Math.sin(Date.now()/40) * 4);

      ctx.fillStyle = "#0055ff";
      ctx.beginPath();
      ctx.moveTo(0, -40*carScale);
      ctx.lineTo(30*carScale, 10*carScale);
      ctx.lineTo(50*carScale, 10*carScale);
      ctx.lineTo(0, 0);
      ctx.lineTo(-50*carScale, 10*carScale);
      ctx.lineTo(-30*carScale, 10*carScale);
      ctx.fill();

      ctx.fillStyle = "#333";
      ctx.fillRect(-20*carScale, 0, 10*carScale, 10*carScale);
      ctx.fillRect(10*carScale, 0, 10*carScale, 10*carScale);

      if (gameState.car.speed > 0.5) {
        ctx.fillStyle = `rgba(255, ${Math.random()*255}, 0, 0.8)`;
        const fH = gameState.car.speed * 4;
        ctx.fillRect(-18*carScale, 10*carScale, 6*carScale, fH * carScale);
        ctx.fillRect(12*carScale, 10*carScale, 6*carScale, fH * carScale);
      }

      ctx.restore();
      ctx.setTransform(1,0,0,1,0,0);
    };

    const gameLoop = (currentTime: number) => {
      const frameDelay = 1000 / 60;
      if (currentTime - lastFrameTimeRef.current < frameDelay) {
        requestAnimationFrame(gameLoop);
        return;
      }
      lastFrameTimeRef.current = currentTime;

      const gameState = engineRef.current.update(keysRef.current);
      renderGame(gameState);

      setHud({
        distance: Math.max(0, gameState.distanceToBoss),
        speed: gameState.car.speed,
        bossName: gameState.boss.name,
        isGameOver: gameState.isGameOver,
        hasWon: gameState.hasWon,
        collision: gameState.collisionFrame > 0
      });

      if (gameState.isGameOver && gameState.hasWon && onWin) {
        setTimeout(onWin, 3000);
      }

      if (!gameState.isGameOver) requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [bossName, onWin, dimensions]);

  const progressPercent = Math.max(0, Math.min(100, (1 - hud.distance / INITIAL_DISTANCE_TO_BOSS) * 100));

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'transparent', overflow: 'hidden' }}>
      
      {/* HUD DISTANCE */}
      <div style={{ 
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', 
        width: '60%', height: '40px', background: 'rgba(0,0,0,0.5)', 
        border: '2px solid #fff', borderRadius: '20px', overflow: 'hidden', zIndex: 10
      }}>
        <div style={{ 
          width: `${progressPercent}%`, height: '100%', 
          background: 'linear-gradient(90deg, #ff0000, #ffff00, #00ff00)',
          transition: 'width 0.1s linear'
        }}></div>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontFamily: 'Arial', fontSize: '14px', textShadow: '1px 1px 0 #000' }}>
          DISTANCE CIBLE: {Math.round(hud.distance)}m
        </div>
      </div>

      {/* HUD VITESSE */}
      <div style={{ 
        position: 'absolute', bottom: 20, left: 20, padding: '20px',
        background: 'rgba(0,0,0,0.6)', borderRadius: '0 20px 0 0', border: '2px solid #0ff', borderLeft: 'none', borderBottom: 'none',
        zIndex: 10
      }}>
        <div style={{ color: '#0ff', fontFamily: 'Impact', fontSize: '40px', textShadow: '3px 3px 0 #000' }}>
          {Math.round(hud.speed * 100)} <span style={{fontSize: '20px'}}>KM/H</span>
        </div>
        <div style={{ color: '#fff', fontFamily: 'monospace' }}>BOOST ENGINE</div>
      </div>

      {/* HUD CIBLE */}
      <div style={{ 
        position: 'absolute', bottom: 20, right: 20, padding: '20px',
        background: 'rgba(0,0,0,0.6)', borderRadius: '20px 0 0 0', border: '2px solid #f0f', borderRight: 'none', borderBottom: 'none',
        zIndex: 10, textAlign: 'right'
      }}>
        <div style={{ color: '#f0f', fontFamily: 'Impact', fontSize: '20px', textShadow: '2px 2px 0 #000' }}>TARGET</div>
        <div style={{ color: '#fff', fontFamily: 'Arial', fontWeight: 'bold', fontSize: '30px' }}>{hud.bossName}</div>
      </div>

      {/* Message Fin */}
      {hud.isGameOver && (
        <div style={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
          width: '100%', textAlign: 'center', zIndex: 20
        }}>
          <div style={{
            fontSize: '8vw', fontWeight: '900', fontFamily: 'Impact', 
            color: hud.hasWon ? '#00ff00' : '#ff0000',
            textShadow: '0 0 20px rgba(0,0,0,0.8), 5px 5px 0 #000',
            transform: 'skew(-10deg)',
            animation: 'pulse 0.5s infinite alternate'
          }}>
            {hud.hasWon ? 
              <div>ENTRÉE DANS LE SYSTÈME...<br/><span style={{fontSize:'4vw', color: '#fff'}}>Initialisation du piratage</span></div> 
              : "ÉCHEC DE LA POURSUITE"}
          </div>
        </div>
      )}

      {onClose && (
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, zIndex: 30, padding: '10px 20px', background:'#fff', border:'none', borderRadius: '4px', cursor:'pointer', fontWeight:'bold', color: '#000' }}>
          QUITTER
        </button>
      )}

      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      
      <style>{`
        @keyframes pulse {
          from { transform: skew(-10deg) scale(1); }
          to { transform: skew(-10deg) scale(1.05); }
        }
      `}</style>
    </div>
  );
};