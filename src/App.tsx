// src/App.tsx
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import { HexRTSCanvas } from './components/Game/HexRTSCanvas';
import Diagnostic from './pages/diagnostic/Diagnostic';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="app-container" style={{width: '100vw', minHeight: '100vh', overflow: 'auto'}}>
        <LandingPage />
      </div>
        } />
        <Route path="/rts" element={
          <div className="app-container" style={{width: '100vw', height: '100vh', overflow: 'hidden'}}>
            <HexRTSCanvas />
          </div>
        } />
        <Route path="/diagnostic" element={
          <div className="app-container" style={{width: '100vw', minHeight: '100vh', overflow: 'auto'}}>
            <Diagnostic />
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
