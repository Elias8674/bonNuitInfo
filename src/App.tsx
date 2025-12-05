// src/App.tsx
import './App.css';
import Header from './components/Header/Header';
import MidText from './components/MidText/MidText';
import DiagnosticFix from './components/DiagnosticFix/DiagnosticFix';
import { SearchBattleGame } from './components/SopraDefi/SearchBattleGame';
import NIRDBloc from './components/NIRDBloc/NIRDBloc';

function App() {
  return (
    // Suppression du background noir ici pour permettre la transparence
    // Utiliser minHeight pour permettre au contenu (MidText, NIRDBloc...) de s'étendre et d'être scrollable
    <div className="app-container" style={{width: '100vw', minHeight: '100vh'}}>
      <Header />
  <DiagnosticFix />
      <MidText />
      <NIRDBloc />
      <SearchBattleGame />
    </div>
  );
}

export default App;