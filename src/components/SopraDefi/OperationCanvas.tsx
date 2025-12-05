import { useEffect, useRef, useState } from 'react';

interface OperationCanvasProps {
  bossName: string;
  onWin: () => void;
  onLose: () => void;
}

interface Letter {
  char: string;
  x: number;
  y: number;
  collected: boolean;
  index: number;
}

export const OperationCanvas = ({ bossName, onWin, onLose }: OperationCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const prevMousePos = useRef({ x: 0, y: 0 });
  
  const [health, setHealth] = useState(100);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [nextLetterIndex, setNextLetterIndex] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);
  
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const cursorVibrationRef = useRef({ active: false, endTime: 0, intensity: 0 });

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);

    const chars = bossName.split('');
    const newLetters: Letter[] = [];
    const w = window.innerWidth;
    const h = window.innerHeight;
    const padding = 150;

    chars.forEach((char, index) => {
      newLetters.push({
        char,
        x: padding + Math.random() * (w - padding * 2),
        y: padding + Math.random() * (h - padding * 2),
        collected: false,
        index: index
      });
    });

    setLetters(newLetters);
    setNextLetterIndex(0);

    return () => window.removeEventListener('resize', handleResize);
  }, [bossName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    let isDamaged = false;
    let lastVibrationTrigger = 0;

    const render = () => {
      let shakeX = 0;
      let shakeY = 0;

      if (isGameRunning) {
        const dx = mousePos.x - prevMousePos.current.x;
        const dy = mousePos.y - prevMousePos.current.y;
        const isMoving = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1;
        
        prevMousePos.current = { x: mousePos.x, y: mousePos.y };

        const now = Date.now();
        
        // Vibration aléatoire du curseur de temps en temps (toutes les 3-8 secondes)
        if (now - lastVibrationTrigger > 3000 && Math.random() < 0.01) {
          cursorVibrationRef.current = {
            active: true,
            endTime: now + 500 + Math.random() * 500, // 500-1000ms de vibration
            intensity: 15 + Math.random() * 10 // Intensité 15-25
          };
          lastVibrationTrigger = now;
        }

        // Appliquer la vibration aléatoire si active
        if (cursorVibrationRef.current.active && now < cursorVibrationRef.current.endTime) {
          shakeX += (Math.random() - 0.5) * cursorVibrationRef.current.intensity;
          shakeY += (Math.random() - 0.5) * cursorVibrationRef.current.intensity;
        } else if (cursorVibrationRef.current.active) {
          cursorVibrationRef.current.active = false;
        }

        if (isDamaged) {
          shakeX += (Math.random() - 0.5) * 20;
          shakeY += (Math.random() - 0.5) * 20;
        } else if (isMoving) {
          shakeX += (Math.random() - 0.5) * 5;
          shakeY += (Math.random() - 0.5) * 5;
        }
      }
      
      const currentX = mousePos.x + shakeX;
      const currentY = mousePos.y + shakeY;

      // FOND
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- DYNAMIQUE : LARGEUR DU CHEMIN (LIMITÉE) ---
      // Min 45px, Max 130px.
      // Cela évite que le chemin devienne trop facile avec des mots longs.
      const rawWidth = 30 + (bossName.length * 10);
      const pathWidth = Math.min(130, Math.max(45, rawWidth));

      // CHEMINS
      const numPaths = Math.max(2, Math.ceil(letters.length / 2));
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      for (let i = 0; i < numPaths; i++) {
        ctx.beginPath();
        ctx.lineWidth = pathWidth + 20;
        ctx.strokeStyle = '#222';
        
        const startY = (canvas.height / (numPaths + 1)) * (i + 1);
        ctx.moveTo(0, startY);

        const midX1 = canvas.width * 0.33;
        const midX2 = canvas.width * 0.66;
        const randomOffset1 = Math.sin(i * 132.1) * 300;
        const randomOffset2 = Math.cos(i * 45.3) * 300;

        ctx.bezierCurveTo(midX1, startY + randomOffset1, midX2, startY + randomOffset2, canvas.width, startY);
        ctx.stroke();

        ctx.lineWidth = pathWidth;
        ctx.strokeStyle = '#eee';
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.lineWidth = pathWidth - 20; 
      ctx.strokeStyle = '#eee';
      if (letters.length > 0) {
        ctx.moveTo(0, canvas.height/2);
        letters.forEach(l => ctx.lineTo(l.x, l.y));
        ctx.stroke();
      }

      // COLLISION
      const pixel = ctx.getImageData(currentX, currentY, 1, 1).data;
      const isSafe = pixel[0] > 100 && pixel[1] > 100 && pixel[2] > 100;

      if (isGameRunning && !isSafe && !gameWon && !gameOver) {
        // Dégâts augmentés : 1.5 par frame au lieu de 0.5
        setHealth(prev => Math.max(0, prev - 1.5));
        isDamaged = true;
      } else {
        isDamaged = false;
      }

      if (isDamaged) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = `rgba(255, 0, 0, ${Math.random()})`;
        ctx.lineWidth = 20;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
      }

      // LETTRES
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      letters.forEach((letter, idx) => {
        if (!letter.collected) {
          ctx.beginPath();
          ctx.arc(letter.x, letter.y, 35, 0, Math.PI * 2);
          
          if (idx === nextLetterIndex) {
            const pulse = Math.sin(Date.now() / 200) * 5;
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 20 + pulse;
          } else {
            ctx.fillStyle = '#aaaaaa';
            ctx.shadowBlur = 0;
          }
          
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#000';
          ctx.fillText(letter.char, letter.x, letter.y);
          
          if (isGameRunning) {
            const dist = Math.sqrt(Math.pow(currentX - letter.x, 2) + Math.pow(currentY - letter.y, 2));
            if (dist < 35 && !gameWon && !gameOver) {
              if (idx === nextLetterIndex) {
                letter.collected = true;
                setNextLetterIndex(prev => prev + 1);
                if (idx === letters.length - 1) {
                  setGameWon(true);
                  setTimeout(onWin, 1000);
                }
              }
            }
          }
        }
      });

      // CURSEUR
      ctx.save();
      ctx.translate(currentX, currentY);
      
      ctx.fillStyle = isDamaged ? '#ff0000' : '#00ff00';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-5, -2000);
      ctx.stroke();

      ctx.restore();

      // UI SANTÉ
      const healthBarWidth = 400;
      ctx.fillStyle = '#333';
      ctx.fillRect(dimensions.width/2 - healthBarWidth/2, 20, healthBarWidth, 30);
      
      ctx.fillStyle = isDamaged ? '#ff0000' : health > 50 ? '#00ff00' : '#ffff00';
      ctx.fillRect(dimensions.width/2 - healthBarWidth/2, 20, healthBarWidth * (health / 100), 30);
      
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(dimensions.width/2 - healthBarWidth/2, 20, healthBarWidth, 30);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`STABILITÉ SYSTÈME: ${Math.ceil(health)}%`, dimensions.width/2, 40);

      if (health <= 0 && !gameOver) {
        setGameOver(true);
        setTimeout(onLose, 1000);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [letters, health, gameWon, gameOver, onWin, onLose, mousePos, nextLetterIndex, dimensions, isGameRunning, bossName]);

  const handleStartGame = (e: React.MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      prevMousePos.current = { x: e.clientX, y: e.clientY };
      setIsGameRunning(true);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000', cursor: isGameRunning ? 'none' : 'default' }}>
      
      {!isGameRunning && !gameWon && !gameOver && (
        <div 
            onClick={handleStartGame}
            style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(0, 0, 0, 0.6)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                zIndex: 100, cursor: 'pointer', padding: '20px', boxSizing: 'border-box'
            }}
        >
            <h1 style={{
                color: '#0f0', fontFamily: 'monospace', fontSize: '3rem', 
                textAlign: 'center', marginBottom: '40px', textShadow: '0 0 20px #0f0',
                maxWidth: '90%'
            }}>
                PROTOCOLE D'EXTRACTION
            </h1>
            <div style={{
                fontSize: '2rem', color: '#fff', fontFamily: 'Arial', fontWeight: 'bold',
                padding: '20px 60px', border: '3px solid #fff', borderRadius: '50px',
                background: 'rgba(255,255,255,0.1)',
                animation: 'pulse 1.5s infinite',
                backdropFilter: 'blur(5px)',
                textAlign: 'center',
                whiteSpace: 'nowrap'
            }}>
                CLIQUER POUR COMMENCER LE HACKING
            </div>
            <p style={{color: '#fff', marginTop: '20px', fontSize: '1.2rem', textShadow: '0 0 5px black', textAlign: 'center', maxWidth: '600px'}}>
                Analysez le chemin ci-dessous avant de commencer.
            </p>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'block' }} />
      
      {gameWon && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          color: '#0f0', fontSize: '5rem', fontFamily: 'Impact', textShadow: '0 0 30px #0f0',
          textAlign: 'center', pointerEvents: 'none'
        }}>
          EXTRACTION RÉUSSIE
        </div>
      )}
      
      {gameOver && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          color: '#f00', fontSize: '5rem', fontFamily: 'Impact', textShadow: '0 0 30px #f00',
          textAlign: 'center', pointerEvents: 'none'
        }}>
          ÉCHEC CRITIQUE
        </div>
      )}

      <style>{`
        @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
      `}</style>
    </div>
  );
};