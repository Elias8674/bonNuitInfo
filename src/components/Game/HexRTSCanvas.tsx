// src/components/Game/HexRTSCanvas.tsx
import { useEffect, useRef, useState } from 'react';
import { HexEngine, hexToPixel, pixelToHex, HEX_SIZE } from '../../engine/hexEngine';
import type { Hex, TerrainType } from '../../types/rts/hex';
import type { Movement, AttackArrow } from '../../types/rts/movement';

interface HexRTSCanvasProps {
  onClose?: () => void;
}

// Fonction pour formater un nombre à 0.25 près sans zéros inutiles
const formatQuarter = (value: number): string => {
  const rounded = Math.round(value * 4) / 4;
  if (rounded % 1 === 0) {
    return rounded.toString();
  }
  return rounded.toFixed(2).replace(/\.?0+$/, '');
};

// Dessiner un hexagone
const drawHex = (
  ctx: CanvasRenderingContext2D,
  q: number,
  r: number,
  hex: Hex,
  offsetX: number,
  offsetY: number,
  isSelected: boolean,
  isHovered: boolean
) => {
  const { x, y } = hexToPixel(q, r, offsetX, offsetY);
  
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const hx = x + HEX_SIZE * Math.cos(angle);
    const hy = y + HEX_SIZE * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(hx, hy);
    } else {
      ctx.lineTo(hx, hy);
    }
  }
  ctx.closePath();
  
  // Couleur selon la faction
  let fillColor = '#333';
  let strokeColor = '#666';
  
  if (hex.faction === 'bigtech') {
    fillColor = isHovered ? '#0066ff' : '#0033cc';
    strokeColor = '#0055ff';
  } else if (hex.faction === 'opensource') {
    fillColor = isHovered ? '#00ff66' : '#00cc33';
    strokeColor = '#00ff55';
  } else {
    fillColor = isHovered ? '#555' : '#333';
    strokeColor = '#666';
  }
  
  if (isSelected) {
    strokeColor = '#ffff00';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffff00';
  } else {
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
  }
  
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = strokeColor;
  ctx.stroke();
  
  // Dessiner l'icône du terrain
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  let icon = '●';
  if (hex.terrainType === 'code-editor') {
    icon = hex.faction === 'bigtech' ? '💻' : hex.faction === 'opensource' ? '⚡' : '💻';
  } else if (hex.terrainType === 'text-editor') {
    icon = hex.faction === 'bigtech' ? '📝' : hex.faction === 'opensource' ? '✏️' : '📝';
  } else if (hex.terrainType === 'browser') {
    icon = hex.faction === 'bigtech' ? '🌐' : hex.faction === 'opensource' ? '🔍' : '🌐';
  } else if (hex.terrainType === 'os') {
    icon = hex.faction === 'bigtech' ? '🖥️' : hex.faction === 'opensource' ? '🐧' : '🖥️';
  } else if (hex.terrainType === 'database') {
    icon = hex.faction === 'bigtech' ? '🗄️' : hex.faction === 'opensource' ? '📊' : '🗄️';
  }
  
  ctx.fillText(icon, 0, -15);
  
  // Afficher le nom de l'app si disponible
  if (hex.appName) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.textBaseline = 'top';
    const maxLength = 8;
    const displayName = hex.appName.length > maxLength 
      ? hex.appName.substring(0, maxLength - 2) + '..' 
      : hex.appName;
    ctx.fillText(displayName, 0, 5);
  }
  
  // Afficher le nombre de workforce
  if (hex.workforce > 0) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textBaseline = 'bottom';
    const displayWorkforce = Number(hex.workforce).toFixed(2).replace(/\.?0+$/, '');
    ctx.fillText(displayWorkforce, 0, 25);
  }
  
  ctx.restore();
};

export const HexRTSCanvas = ({ onClose }: HexRTSCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<HexEngine>(new HexEngine());
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  const gameStateRef = useRef(engineRef.current.getState());
  const movementsRef = useRef<Movement[]>([]);
  const attackArrowsRef = useRef<AttackArrow[]>([]);
  
  const [selectedHexes, setSelectedHexes] = useState<Array<{ q: number; r: number }>>([]);
  const selectedHexesRef = useRef<Array<{ q: number; r: number }>>([]);
  
  const hoveredHexRef = useRef<{ q: number; r: number } | null>(null);
  
  const [workforce, setWorkforce] = useState(0);
  const [controlledTerrain, setControlledTerrain] = useState(0);
  const [bigtechTerrain, setBigtechTerrain] = useState(0);
  const [workforceGenPerSec, setWorkforceGenPerSec] = useState(0);
  const [transformMenu, setTransformMenu] = useState<{ q: number; r: number } | null>(null);
  
  const cameraRef = useRef({ x: -100, y: 0 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef(0);
  
  // Sync ref with state
  useEffect(() => {
    selectedHexesRef.current = selectedHexes;
  }, [selectedHexes]);

  // Initialiser l'engine
  useEffect(() => {
    engineRef.current = new HexEngine();
    gameStateRef.current = engineRef.current.getState();
    setWorkforce(gameStateRef.current.workforce);
    setControlledTerrain(gameStateRef.current.controlledTerrain);
    setBigtechTerrain(gameStateRef.current.bigtechTerrain);
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      engineRef.current.update();
      gameStateRef.current = engineRef.current.getState();
      movementsRef.current = engineRef.current.getMovements();
      attackArrowsRef.current = engineRef.current.getAttackArrows();
      
      const now = Date.now();
      if (now - lastUpdateTimeRef.current > 500) {
        setWorkforce(gameStateRef.current.workforce);
        setControlledTerrain(gameStateRef.current.controlledTerrain);
        setBigtechTerrain(gameStateRef.current.bigtechTerrain);
        setWorkforceGenPerSec(gameStateRef.current.workforceGenerationPerSecond);
        lastUpdateTimeRef.current = now;
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    const bgGradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
    bgGradient.addColorStop(0, '#0a0a1a');
    bgGradient.addColorStop(1, '#1a1a2e');
    
    let lastHoverHex: { q: number; r: number } | null = null;
    let hoverThrottle = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const currentOffsetX = dimensions.width / 2 + cameraRef.current.x;
      const currentOffsetY = dimensions.height / 2 + cameraRef.current.y;
      const hex = pixelToHex(x, y, currentOffsetX, currentOffsetY);
      
      hoverThrottle++;
      if (hoverThrottle % 3 === 0) {
        const foundHex = engineRef.current.selectHex(hex.q, hex.r);
        if (foundHex) {
          const newHover = { q: hex.q, r: hex.r };
          if (!lastHoverHex || lastHoverHex.q !== newHover.q || lastHoverHex.r !== newHover.r) {
            hoveredHexRef.current = newHover;
            lastHoverHex = newHover;
          }
        } else {
          hoveredHexRef.current = null;
          lastHoverHex = null;
        }
      }
      
      if (isDraggingRef.current) {
        const dx = x - lastMousePosRef.current.x;
        const dy = y - lastMousePosRef.current.y;
        cameraRef.current.x += dx;
        cameraRef.current.y += dy;
      }
      
      lastMousePosRef.current = { x, y };
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Clic gauche
        isDraggingRef.current = true;
        const rect = canvas.getBoundingClientRect();
        lastMousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      } else if (e.button === 2) { // Clic droit
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const currentOffsetX = dimensions.width / 2 + cameraRef.current.x;
        const currentOffsetY = dimensions.height / 2 + cameraRef.current.y;
        
        const hex = pixelToHex(x, y, currentOffsetX, currentOffsetY);
        
        // Envoi groupé depuis toutes les cases sélectionnées
        if (selectedHexesRef.current.length > 0) {
          let troopsSent = false;
          
          // Obtenir la cible pour calculer le nombre de troupes nécessaires
          const targetHex = engineRef.current.selectHex(hex.q, hex.r);
          
          selectedHexesRef.current.forEach(source => {
            if (source.q === hex.q && source.r === hex.r) return;

            const sourceHex = engineRef.current.selectHex(source.q, source.r);
            if (!sourceHex) return;

            // Calculer le nombre de troupes à envoyer
            let troopsToSend = 1;
            
            // Si c'est une base ennemie, il faut envoyer au moins workforce + 1 pour la capturer
            if (targetHex && targetHex.faction !== 'opensource' && targetHex.faction !== 'neutral') {
              troopsToSend = Math.min(
                targetHex.workforce + 1, // Minimum pour capturer
                sourceHex.workforce - 0.1 // Maximum disponible (garder un peu sur la base)
              );
            } else {
              // Pour les bases alliées ou neutres, envoyer 1 troupe
              troopsToSend = Math.min(1, sourceHex.workforce - 0.1);
            }
            
            // S'assurer qu'on a assez de troupes
            if (troopsToSend > 0 && sourceHex.workforce >= troopsToSend) {
              const success = engineRef.current.sendTroops(
                source.q,
                source.r,
                hex.q,
                hex.r,
                troopsToSend
              );
              if (success) troopsSent = true;
            }
          });
          
          if (troopsSent) {
            gameStateRef.current = engineRef.current.getState();
          }
        }
      }
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    
    const handleClick = (e: MouseEvent) => {
      if (e.button === 0 && !isDraggingRef.current) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const currentOffsetX = dimensions.width / 2 + cameraRef.current.x;
        const currentOffsetY = dimensions.height / 2 + cameraRef.current.y;
        
        const hex = pixelToHex(x, y, currentOffsetX, currentOffsetY);
        const foundHex = engineRef.current.selectHex(hex.q, hex.r);
        
        if (foundHex) {
          if (foundHex.faction === 'opensource') {
            // CORRECTION: Vérifier si la case est DÉJÀ sélectionnée
            const isAlreadySelected = selectedHexesRef.current.some(h => h.q === hex.q && h.r === hex.r);
            
            if (isAlreadySelected) {
              // Si déjà sélectionnée, un second clic ouvre le menu d'amélioration
              setTransformMenu({ q: hex.q, r: hex.r });
            } else {
              // Sinon, on l'ajoute à la sélection
              setSelectedHexes(prev => [...prev, { q: hex.q, r: hex.r }]);
              // On ferme le menu si on sélectionne une nouvelle case
              setTransformMenu(null);
            }
          } else if (foundHex.faction === 'neutral') {
            setTransformMenu({ q: hex.q, r: hex.r });
          } else {
            setTransformMenu(null);
          }
        } else {
          // Clic dans le vide : tout désélectionner
          setSelectedHexes([]);
          setTransformMenu(null);
        }
      }
    };
    
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('contextmenu', handleContextMenu);
    
    const render = () => {
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      
      const currentOffsetX = dimensions.width / 2 + cameraRef.current.x;
      const currentOffsetY = dimensions.height / 2 + cameraRef.current.y;
      
      const currentState = gameStateRef.current;
      const currentSelected = selectedHexesRef.current;
      const currentHovered = hoveredHexRef.current;
      
      ctx.save();
      for (let i = 0; i < currentState.hexes.length; i++) {
        const hex = currentState.hexes[i];
        const isSelected = currentSelected.some(s => s.q === hex.q && s.r === hex.r);
        const isHovered = !!(currentHovered && currentHovered.q === hex.q && currentHovered.r === hex.r);
        drawHex(ctx, hex.q, hex.r, hex, currentOffsetX, currentOffsetY, isSelected, isHovered);
      }
      ctx.restore();
      
      // Dessiner les flèches d'attaque
      const currentArrows = attackArrowsRef.current;
      for (let i = 0; i < currentArrows.length; i++) {
        const arrow = currentArrows[i];
        const source = hexToPixel(arrow.sourceQ, arrow.sourceR, currentOffsetX, currentOffsetY);
        const target = hexToPixel(arrow.targetQ, arrow.targetR, currentOffsetX, currentOffsetY);
        const currentX = source.x + (target.x - source.x) * arrow.progress;
        const currentY = source.y + (target.y - source.y) * arrow.progress;
        
        ctx.save();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        ctx.translate(currentX, currentY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -5);
        ctx.lineTo(-10, 5);
        ctx.closePath();
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        ctx.restore();
      }
      
      const currentMovements = movementsRef.current;
      for (let i = 0; i < currentMovements.length; i++) {
        const movement = currentMovements[i];
        const source = hexToPixel(movement.sourceQ, movement.sourceR, currentOffsetX, currentOffsetY);
        const target = hexToPixel(movement.targetQ, movement.targetR, currentOffsetX, currentOffsetY);
        const x = source.x + (target.x - source.x) * movement.progress;
        const y = source.y + (target.y - source.y) * movement.progress;
        
        ctx.save();
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${movement.troops}`, x, y);
        ctx.restore();
      }
      
      animationFrameRef.current = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [dimensions]);
  
  const handleTransform = (terrainType: TerrainType) => {
    if (!transformMenu) return;
    const hex = engineRef.current.selectHex(transformMenu.q, transformMenu.r);
    if (!hex) return;
    
    if (hex.faction === 'neutral' || hex.faction === 'opensource') {
      const cost = engineRef.current.getTransformCost('opensource');
      if (hex.workforce >= cost) {
        engineRef.current.transformHex(transformMenu.q, transformMenu.r, terrainType, 'opensource');
        gameStateRef.current = engineRef.current.getState();
        setWorkforce(gameStateRef.current.workforce);
        setControlledTerrain(gameStateRef.current.controlledTerrain);
        setTransformMenu(null);
      }
    }
  };
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'transparent', overflow: 'hidden' }}>
      {/* HUD */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #00ff55',
        borderRadius: '10px',
        zIndex: 10,
        color: '#fff',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ marginBottom: '10px', fontSize: '24px', fontWeight: 'bold', color: '#00ff55' }}>
          OPEN SOURCE
        </div>
        <div style={{ marginBottom: '5px' }}>
          Workforce: <span style={{ color: '#00ff55', fontWeight: 'bold' }}>
            {formatQuarter(workforce)}
          </span>
        </div>
        <div style={{ marginBottom: '5px' }}>
          Génération: <span style={{ color: '#00ff55', fontWeight: 'bold' }}>
            {formatQuarter(workforceGenPerSec)}/s
          </span>
        </div>
        <div style={{ marginBottom: '5px' }}>
          Terrains contrôlés: <span style={{ color: '#00ff55', fontWeight: 'bold' }}>{controlledTerrain}</span>
        </div>
        
        {selectedHexes.length > 0 && (
          <div style={{ marginTop: '15px', borderTop: '1px solid #333', paddingTop: '10px' }}>
            <div style={{ color: '#ffff00', fontWeight: 'bold', marginBottom: '5px' }}>
              Sélection: {selectedHexes.length} base(s)
            </div>
            <button 
              onClick={() => setSelectedHexes([])}
              style={{
                width: '100%',
                padding: '5px',
                background: '#444',
                border: '1px solid #666',
                color: '#fff',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Désélectionner tout
            </button>
          </div>
        )}

        <div style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
          Clic gauche: Sélectionner (Re-clic pour améliorer)<br/>
          Clic droit: Envoyer (depuis TOUTE la sélection)<br/>
          Glisser: Déplacer la carte
        </div>
      </div>
      
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #0055ff',
        borderRadius: '10px',
        zIndex: 10,
        color: '#fff',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ marginBottom: '10px', fontSize: '24px', fontWeight: 'bold', color: '#0055ff' }}>
          BIGTECH
        </div>
        <div>
          Terrains contrôlés: <span style={{ color: '#0055ff', fontWeight: 'bold' }}>{bigtechTerrain}</span>
        </div>
      </div>
      
      {/* Menu de transformation des cases */}
      {transformMenu && (() => {
        const hex = engineRef.current.selectHex(transformMenu.q, transformMenu.r);
        const cost = hex ? engineRef.current.getTransformCost('opensource') : 0;
        const canAfford = hex && hex.workforce >= cost;
        
        return (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            background: 'rgba(0, 0, 0, 0.9)',
            border: '2px solid #00ff55',
            borderRadius: '10px',
            zIndex: 100,
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
          }}>
            <div style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 'bold', color: '#00ff55' }}>
              Transformer la case
            </div>
            <div style={{ marginBottom: '15px', fontSize: '14px', color: canAfford ? '#00ff55' : '#ff5555' }}>
              Coût: {cost} workforce {hex && `(Disponible: ${Number(hex.workforce).toFixed(2)})`}
            </div>
            {!canAfford && (
              <div style={{ marginBottom: '15px', fontSize: '12px', color: '#ff5555' }}>
                Pas assez de workforce sur cette case !
              </div>
            )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(['code-editor', 'text-editor', 'browser', 'os', 'database'] as TerrainType[]).map(type => (
              <button
                key={type}
                onClick={() => handleTransform(type)}
                disabled={!canAfford}
                style={{
                  padding: '10px',
                  background: canAfford ? '#333' : '#222',
                  border: `1px solid ${canAfford ? '#00ff55' : '#666'}`,
                  borderRadius: '5px',
                  color: canAfford ? '#fff' : '#666',
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  textTransform: 'capitalize',
                  opacity: canAfford ? 1 : 0.5
                }}
              >
                {type.replace('-', ' ')}
              </button>
            ))}
          </div>
          <button
            onClick={() => setTransformMenu(null)}
            style={{
              marginTop: '15px',
              padding: '5px 15px',
              background: '#666',
              border: 'none',
              borderRadius: '5px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Annuler
          </button>
        </div>
        );
      })()}
      
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 30,
            padding: '10px 20px',
            background: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#000'
          }}
        >
          QUITTER
        </button>
      )}
      
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor: selectedHexes.length > 0 ? 'crosshair' : 'default' }}
      />
    </div>
  );
};