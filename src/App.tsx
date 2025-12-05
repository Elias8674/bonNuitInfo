// src/App.tsx
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SearchBattleGame } from './components/SopraDefi/SearchBattleGame';
import { HexRTSCanvas } from './components/Game/HexRTSCanvas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="app-container" style={{width: '100vw', height: '100vh', overflow: 'hidden'}}>
            <SearchBattleGame />
          </div>
        } />
        <Route path="/rts" element={
          <div className="app-container" style={{width: '100vw', height: '100vh', overflow: 'hidden'}}>
            <HexRTSCanvas />
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
import Diagnostic from './pages/diagnostic/Diagnostic.tsx';

function App() {
  return (
    // Suppression du background noir ici pour permettre la transparence
    <div className="app-container" style={{width: '100vw', height: '100vh', overflow: 'hidden'}}>
      <Diagnostic />
    </div>
  );
}

export default App;