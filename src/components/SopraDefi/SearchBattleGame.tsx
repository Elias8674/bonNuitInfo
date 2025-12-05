// src/components/SearchBattleGame.tsx
import { useState } from 'react';
import { GameCanvas } from './GameCanvas';
import { FZeroCanvas } from './FZeroCanvas';
import { OperationCanvas } from './OperationCanvas';
import { InputField } from './InputField';
import { findMatches } from '../../utils/searchLogic';

type GameStage = 'input' | 'fighting' | 'racing' | 'operation' | 'result';

// --- HUD INTERNE ---
const ControlsHUD = ({ stage }: { stage: GameStage }) => {
  if (stage === 'input' || stage === 'result') return null;

  const controlsMap: Record<string, { key: string; action: string }[]> = {
    fighting: [
      { key: 'Q / D', action: 'BOUGER' },
      { key: 'ESPACE', action: 'SAUTER' },
      { key: 'J / K / L', action: 'ATTAQUES' },
      { key: 'G', action: 'POUSSER' },
      { key: 'RET.ARR', action: 'PARER' },
    ],
    racing: [
      { key: 'Q / D', action: 'TOURNER' },
      { key: 'Z', action: 'ACCÉLÉRER' },
      { key: 'S', action: 'FREINER' },
    ],
    operation: [
      { key: 'SOURIS', action: 'GUIDER' },
      { key: 'CLIC', action: 'DÉMARRER' },
    ],
  };

  const currentControls = controlsMap[stage] || [];

  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '20px',
      padding: '15px 30px',
      background: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '50px',
      backdropFilter: 'blur(5px)',
      zIndex: 1000,
      pointerEvents: 'none',
      boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
    }}>
      {currentControls.map((ctrl, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: '#fff',
            color: '#000',
            padding: '5px 10px',
            borderRadius: '5px',
            fontWeight: '900',
            fontFamily: 'monospace',
            fontSize: '14px',
            boxShadow: '0 2px 0 #999',
            whiteSpace: 'nowrap'
          }}>
            {ctrl.key}
          </span>
          <span style={{
            color: '#ccc',
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            {ctrl.action}
          </span>
          {index < currentControls.length - 1 && (
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', marginLeft: '10px' }}></div>
          )}
        </div>
      ))}
    </div>
  );
};

// --- COMPOSANT MAÎTRE ---
export const SearchBattleGame = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gameStage, setGameStage] = useState<GameStage>('input');
  const [results, setResults] = useState<string[]>([]);

  const handleSearchStart = (query: string) => {
    setSearchQuery(query);
    setGameStage('racing');
  };

  const handleRaceWin = () => setGameStage('fighting');
  const handleBossDefeated = () => setGameStage('operation');
  
  const handleOperationWin = () => {
    const matches = findMatches(searchQuery);
    setResults(matches);
    setGameStage('result');
  };

  const handleGameOver = () => {
    alert("ÉCHEC MISSION.");
    setGameStage('input');
    setSearchQuery('');
  };

  const resetGame = () => {
    setGameStage('input');
    setSearchQuery('');
    setResults([]);
  };

  return (
    <div style={{
      width: '100%', 
      height: '100%', 
      position: 'relative', 
      overflow: 'hidden', 
      background: gameStage === 'input' ? 'transparent' : '#000'
    }}>
      
      {/* BACKGROUND TEXT FOR F-ZERO (Visible au-dessus du canvas) */}
      {gameStage === 'racing' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          zIndex: 100, // Au-dessus du canvas
          pointerEvents: 'none' // Pour ne pas bloquer les interactions
        }}>
          <div style={{
            fontSize: '3rem',
            color: '#ff0000',
            fontWeight: '900',
            fontFamily: 'Impact, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '5px',
            opacity: 0.8,
            textShadow: '0 0 30px rgba(255, 0, 0, 0.5)',
            animation: 'pulse 0.5s infinite alternate'
          }}>
            RATTRAPEZ LE<br/>CHAMP DE SAISIE !
          </div>
        </div>
      )}

      {/* 1. INPUT */}
      {gameStage === 'input' && (
        <InputField onSearchStart={handleSearchStart} />
      )}

      {/* 2. JEUX */}
      {gameStage === 'racing' && (
        // Le canvas est en zIndex 1 pour être au dessus du texte
        <div style={{position: 'relative', zIndex: 1, height: '100%'}}>
          <FZeroCanvas bossName={searchQuery} onWin={handleRaceWin} />
        </div>
      )}

      {gameStage === 'fighting' && (
        <GameCanvas bossName={searchQuery} onBossDefeated={handleBossDefeated} onPlayerDefeated={handleGameOver} />
      )}

      {gameStage === 'operation' && (
        <OperationCanvas bossName={searchQuery} onWin={handleOperationWin} onLose={handleGameOver} />
      )}

      {/* 3. RÉSULTAT */}
      {gameStage === 'result' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', background: '#111', color: '#fff', fontFamily: 'Arial, sans-serif'
        }}>
          <h2 style={{color: '#888', marginBottom: '30px', letterSpacing: '2px'}}>RÉSULTATS</h2>
          <ul style={{
            listStyle: 'none', padding: 0, width: '600px',
            background: '#222', borderRadius: '12px', overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
          }}>
            {results.map((res, i) => (
              <li key={i} style={{
                padding: '25px 30px', 
                borderBottom: i < results.length - 1 ? '1px solid #333' : 'none',
                fontSize: '24px', display: 'flex', justifyContent: 'space-between',
                cursor: 'pointer', transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#333'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{color: '#0f0', fontWeight: 'bold'}}>{res}</span>
              </li>
            ))}
          </ul>
          <button 
            onClick={resetGame}
            style={{
              marginTop: '50px', padding: '15px 40px', fontSize: '16px',
              background: 'transparent', color: '#0f0', border: '2px solid #0f0',
              borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            RETOUR
          </button>
        </div>
      )}

      <ControlsHUD stage={gameStage} />
      
      <style>{`
        @keyframes pulse {
          from { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>
    </div>
  );
};