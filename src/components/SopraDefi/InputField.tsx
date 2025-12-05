// src/components/InputField.tsx
import { useState, KeyboardEvent } from 'react';

interface InputFieldProps {
  onSearchStart: (query: string) => void;
}

export const InputField = ({ onSearchStart }: InputFieldProps) => {
  const [value, setValue] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);

  // Fonction de déclenchement avec délai pour l'effet dramatique
  const triggerLaunch = () => {
    if (value.trim().length > 0 && !isLaunching) {
      setIsLaunching(true);
      
      // On laisse le temps de lire le message avant de lancer la course
      setTimeout(() => {
        onSearchStart(value.trim());
      }, 1500);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      triggerLaunch();
    }
  };

  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100%', 
      width: '100%',
      fontFamily: 'Arial, sans-serif'
    }}>
      
      {/* MESSAGE D'ALERTE (Apparaît seulement au lancement) */}
      {isLaunching ? (
        <div style={{
          fontSize: '2.5rem',
          color: '#ff0000',
          fontWeight: '900',
          textAlign: 'center',
          fontFamily: 'Impact, sans-serif',
          letterSpacing: '2px',
          textShadow: '0 0 20px rgba(255,0,0,0.5)',
          animation: 'shake 0.5s infinite' // Petite animation de secousse
        }}>
          RATTRAPEZ LE CHAMP DE SAISIE !<br/>IL S'ÉCHAPPE !
        </div>
      ) : (
        /* BARRE DE RECHERCHE NORMALE */
        <div style={{position: 'relative', width: '100%', maxWidth: '600px'}}>
          <input 
            type="text" 
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher..." 
            style={{
              width: '100%',
              padding: '15px 50px 15px 25px',
              fontSize: '18px',
              borderRadius: '30px',
              border: '1px solid #dfe1e5',
              outline: 'none',
              background: '#fff',
              color: '#333',
              boxShadow: '0 1px 6px rgba(32,33,36,.28)',
              transition: 'box-shadow 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.boxShadow = '0 1px 6px rgba(32,33,36,.28), 0 2px 4px rgba(0,0,0,0.1)'}
            onBlur={(e) => e.target.style.boxShadow = '0 1px 6px rgba(32,33,36,.28)'}
            autoFocus
          />
          
          <div 
            style={{
              position: 'absolute', 
              right: '20px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#4285f4',
              cursor: 'pointer',
              fontSize: '20px'
            }}
            onClick={triggerLaunch}
          >
            🔍
          </div>
        </div>
      )}

      {/* Style pour l'animation de tremblement */}
      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
};