import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>NIRD</h1>
        </div>
        <nav className="nav">
          <ul className="nav-list">
            <li><a href="#introduction">Introduction</a></li>
            <li><a href="#demarche">Démarche</a></li>
            <li><a href="#autres">Autres</a></li>
          </ul>
        </nav>
        <div className="header-actions">
          <button className="btn-diagnostic">Réaliser un diagnostic</button>
        </div>
      </div>
    </header>
  );
}

