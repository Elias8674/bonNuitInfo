// src/App.tsx
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Diagnostic from './pages/diagnostic/Diagnostic.tsx';
import { HexRTSCanvas } from './components/Game/HexRTSCanvas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="app-container" style={{width: '100vw', height: '100vh', overflow: 'hidden'}}>
        <Diagnostic />
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
  );
}

export default App;
