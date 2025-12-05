// src/App.tsx
import './App.css';
import { SearchBattleGame } from './components/SopraDefi/SearchBattleGame';

function App() {
  return (
    // Suppression du background noir ici pour permettre la transparence
    <div className="app-container" style={{width: '100vw', height: '100vh', overflow: 'hidden'}}>
      <SearchBattleGame />
    </div>
  );
}

export default App;