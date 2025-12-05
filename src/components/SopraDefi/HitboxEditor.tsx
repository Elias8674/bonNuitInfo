import { useState, useRef, useEffect, useMemo } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../engine/engine';
import { PlayerState, createPlayer, type Player, type AttackType } from '../../types/player';
import { renderStickminPlayer } from './StickminPlayer';
import { stickAnimation } from '../../utils/stickAnimation';

export interface Hitbox {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface HitboxEditorProps {
  onClose: () => void;
}

export const HitboxEditor = ({ onClose }: HitboxEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Charger les hitboxes depuis le localStorage au démarrage
  const [hitboxes, setHitboxes] = useState<Hitbox[]>(() => {
    const saved = localStorage.getItem('hitboxes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erreur lors du chargement des hitboxes:', e);
      }
    }
    return [];
  });
  
  const [selectedHitbox, setSelectedHitbox] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [newHitboxName, setNewHitboxName] = useState('');
  
  // Animation du joueur
  const [selectedAnimation, setSelectedAnimation] = useState<PlayerState>(PlayerState.IDLE);
  const [selectedAttackType, setSelectedAttackType] = useState<AttackType | null>(null);
  const [animationFrame, setAnimationFrame] = useState(0);
  const animationFrameRef = useRef<number>(0);
  
  // Créer un joueur de test
  const testPlayer: Player = useMemo(() => ({
    ...createPlayer(CANVAS_WIDTH / 2 - 45, CANVAS_HEIGHT - 200),
    state: selectedAnimation,
    attackType: selectedAttackType,
    facingRight: true,
    stateFrame: animationFrame,
  }), [selectedAnimation, selectedAttackType, animationFrame]);

  // Charger les animations au démarrage
  useEffect(() => {
    stickAnimation.loadFrames();
  }, []);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      animationFrameRef.current++;
      setAnimationFrame(animationFrameRef.current);
    }, 50); // 20 FPS

    return () => clearInterval(interval);
  }, []);

  // Sauvegarder les hitboxes dans le localStorage
  const saveHitboxes = (newHitboxes: Hitbox[]) => {
    setHitboxes(newHitboxes);
    localStorage.setItem('hitboxes', JSON.stringify(newHitboxes));
  };

  // Télécharger le JSON
  const downloadJSON = () => {
    const dataStr = JSON.stringify(hitboxes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hitboxes.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Charger un JSON
  const loadJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loaded = JSON.parse(e.target?.result as string);
          setHitboxes(loaded);
          saveHitboxes(loaded);
        } catch {
          alert('Erreur lors du chargement du fichier JSON');
        }
      };
      reader.readAsText(file);
    }
  };

  // Trouver la hitbox à un point donné
  const getHitboxAt = (x: number, y: number): Hitbox | null => {
    for (let i = hitboxes.length - 1; i >= 0; i--) {
      const hb = hitboxes[i];
      if (x >= hb.x && x <= hb.x + hb.width && y >= hb.y && y <= hb.y + hb.height) {
        return hb;
      }
    }
    return null;
  };

  // Obtenir le handle de redimensionnement
  const getResizeHandle = (x: number, y: number, hitbox: Hitbox): string | null => {
    const handleSize = 10;
    const handles = [
      { name: 'nw', x: hitbox.x, y: hitbox.y },
      { name: 'ne', x: hitbox.x + hitbox.width, y: hitbox.y },
      { name: 'sw', x: hitbox.x, y: hitbox.y + hitbox.height },
      { name: 'se', x: hitbox.x + hitbox.width, y: hitbox.y + hitbox.height },
    ];

    for (const handle of handles) {
      if (
        x >= handle.x - handleSize &&
        x <= handle.x + handleSize &&
        y >= handle.y - handleSize &&
        y <= handle.y + handleSize
      ) {
        return handle.name;
      }
    }
    return null;
  };

  // Gestion du clic sur le canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hitbox = getHitboxAt(x, y);
    if (hitbox) {
      const handle = getResizeHandle(x, y, hitbox);
      if (handle) {
        setIsResizing(true);
        setResizeHandle(handle);
        setSelectedHitbox(hitbox.id);
        setDragOffset({ x: x - hitbox.x, y: y - hitbox.y });
      } else {
        setIsDragging(true);
        setSelectedHitbox(hitbox.id);
        setDragOffset({ x: x - hitbox.x, y: y - hitbox.y });
      }
    } else {
      setSelectedHitbox(null);
    }
  };

  // Gestion du mouvement de la souris
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && selectedHitbox) {
      const hitbox = hitboxes.find((h) => h.id === selectedHitbox);
      if (hitbox) {
        const newHitboxes = hitboxes.map((h) =>
          h.id === selectedHitbox
            ? { ...h, x: x - dragOffset.x, y: y - dragOffset.y }
            : h
        );
        saveHitboxes(newHitboxes);
      }
    } else if (isResizing && selectedHitbox && resizeHandle) {
      const hitbox = hitboxes.find((h) => h.id === selectedHitbox);
      if (hitbox) {
        let newX = hitbox.x;
        let newY = hitbox.y;
        let newWidth = hitbox.width;
        let newHeight = hitbox.height;

        if (resizeHandle.includes('n')) {
          newHeight = hitbox.y + hitbox.height - y;
          newY = y;
        }
        if (resizeHandle.includes('s')) {
          newHeight = y - hitbox.y;
        }
        if (resizeHandle.includes('w')) {
          newWidth = hitbox.x + hitbox.width - x;
          newX = x;
        }
        if (resizeHandle.includes('e')) {
          newWidth = x - hitbox.x;
        }

        if (newWidth > 10 && newHeight > 10) {
          const newHitboxes = hitboxes.map((h) =>
            h.id === selectedHitbox
              ? { ...h, x: newX, y: newY, width: newWidth, height: newHeight }
              : h
          );
          saveHitboxes(newHitboxes);
        }
      }
    }
  };

  // Gestion du relâchement de la souris
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Ajouter une nouvelle hitbox
  const addHitbox = () => {
    if (!newHitboxName.trim()) {
      alert('Veuillez entrer un nom pour la hitbox');
      return;
    }

    const newHitbox: Hitbox = {
      id: Date.now().toString(),
      name: newHitboxName,
      x: CANVAS_WIDTH / 2 - 50,
      y: CANVAS_HEIGHT / 2 - 50,
      width: 100,
      height: 100,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    };

    const newHitboxes = [...hitboxes, newHitbox];
    saveHitboxes(newHitboxes);
    setNewHitboxName('');
    setSelectedHitbox(newHitbox.id);
  };

  // Supprimer une hitbox
  const deleteHitbox = (id: string) => {
    const newHitboxes = hitboxes.filter((h) => h.id !== id);
    saveHitboxes(newHitboxes);
    if (selectedHitbox === id) {
      setSelectedHitbox(null);
    }
  };

  // Dessiner le canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Effacer le canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Dessiner le sol
    ctx.fillStyle = '#333';
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

    // Dessiner le joueur avec l'animation sélectionnée
    renderStickminPlayer({
      player: testPlayer,
      ctx,
      animationFrame: animationFrameRef.current,
    });

    // Dessiner toutes les hitboxes
    hitboxes.forEach((hitbox) => {
      const isSelected = hitbox.id === selectedHitbox;

      // Hitbox
      ctx.fillStyle = hitbox.color + (isSelected ? 'CC' : '66');
      ctx.fillRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
      ctx.strokeStyle = isSelected ? '#fff' : hitbox.color;
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);

      // Nom de la hitbox
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText(hitbox.name, hitbox.x + 5, hitbox.y - 5);

      // Handles de redimensionnement si sélectionnée
      if (isSelected) {
        const handles = [
          { x: hitbox.x, y: hitbox.y },
          { x: hitbox.x + hitbox.width, y: hitbox.y },
          { x: hitbox.x, y: hitbox.y + hitbox.height },
          { x: hitbox.x + hitbox.width, y: hitbox.y + hitbox.height },
        ];

        ctx.fillStyle = '#fff';
        handles.forEach((handle) => {
          ctx.fillRect(handle.x - 5, handle.y - 5, 10, 10);
        });
      }
    });
  }, [hitboxes, selectedHitbox, selectedAnimation, selectedAttackType, animationFrame, testPlayer]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ color: '#fff', margin: 0 }}>Éditeur de Hitbox</h2>
        <button onClick={onClose} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Fermer
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
        {/* Panneau de contrôle */}
        <div
          style={{
            width: '300px',
            backgroundColor: '#2a2a2a',
            padding: '20px',
            borderRadius: '8px',
            color: '#fff',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Contrôles</h3>
          <p style={{ fontSize: '12px', color: '#aaa' }}>
            • Clic pour sélectionner une hitbox
            <br />
            • Glisser pour déplacer
            <br />
            • Glisser les coins pour redimensionner
            <br />
            • Double-clic pour supprimer
          </p>

          <div style={{ marginTop: '20px' }}>
            <h4>Animation</h4>
            <select
              value={selectedAnimation}
              onChange={(e) => {
                const newState = e.target.value as PlayerState;
                setSelectedAnimation(newState);
                if (newState === PlayerState.ATTACKING && !selectedAttackType) {
                  setSelectedAttackType('light');
                } else if (newState !== PlayerState.ATTACKING) {
                  setSelectedAttackType(null);
                }
                animationFrameRef.current = 0;
                setAnimationFrame(0);
              }}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '10px',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px',
              }}
            >
              <option value={PlayerState.IDLE}>Idle</option>
              <option value={PlayerState.WALKING}>Walking</option>
              <option value={PlayerState.ATTACKING}>Attacking</option>
              <option value={PlayerState.PUSHING}>Pushing</option>
              <option value={PlayerState.HIT}>Hit</option>
              <option value={PlayerState.GETTING_UP}>Getting Up</option>
              <option value={PlayerState.ROLLING}>Rolling</option>
              <option value={PlayerState.SUPER_ATTACKING}>Super Attack</option>
              <option value={PlayerState.GRAB_THROWING}>Grab Throw</option>
              <option value={PlayerState.DEFENDING}>Defending</option>
              <option value={PlayerState.JUMPING}>Jumping</option>
            </select>
            
            {selectedAnimation === PlayerState.ATTACKING && (
              <select
                value={selectedAttackType || 'light'}
                onChange={(e) => {
                  setSelectedAttackType(e.target.value as AttackType);
                  animationFrameRef.current = 0;
                  setAnimationFrame(0);
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                }}
              >
                <option value="light">Light Attack</option>
                <option value="medium">Medium Attack</option>
                <option value="heavy">Heavy Attack</option>
              </select>
            )}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4>Nouvelle Hitbox</h4>
            <input
              type="text"
              placeholder="Nom de la hitbox"
              value={newHitboxName}
              onChange={(e) => setNewHitboxName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addHitbox()}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '10px',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px',
              }}
            />
            <button
              onClick={addHitbox}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#646cff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Ajouter
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4>Hitboxes ({hitboxes.length})</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {hitboxes.map((hitbox) => (
                <div
                  key={hitbox.id}
                  style={{
                    padding: '10px',
                    marginBottom: '5px',
                    backgroundColor:
                      selectedHitbox === hitbox.id ? '#646cff33' : '#1a1a1a',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onClick={() => setSelectedHitbox(hitbox.id)}
                >
                  <span>{hitbox.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHitbox(hitbox.id);
                    }}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#ff4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Suppr
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={downloadJSON}
              style={{
                padding: '10px',
                backgroundColor: '#00aa00',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Télécharger JSON
            </button>
            <label
              style={{
                padding: '10px',
                backgroundColor: '#646cff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Charger JSON
              <input
                type="file"
                accept=".json"
                onChange={loadJSON}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              border: '2px solid #646cff',
              borderRadius: '8px',
              cursor: isDragging || isResizing ? 'grabbing' : 'default',
            }}
          />
        </div>
      </div>
    </div>
  );
};

