// src/App.tsx
import './App.css';
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