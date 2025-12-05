import './Header.css';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const getNavLink = (hash: string) => {
    if (isHomePage) {
      return hash;
    }
    return `/${hash}`;
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo">
            <h1>NIRD</h1>
          </div>
        </Link>
        <nav className="nav">
          <ul className="nav-list">
            <li>
              <Link to={getNavLink('#introduction')} style={{ textDecoration: 'none', color: 'inherit' }}>
                Introduction
              </Link>
            </li>
            <li>
              <Link to={getNavLink('#demarche')} style={{ textDecoration: 'none', color: 'inherit' }}>
                Démarche
              </Link>
            </li>
            <li>
              <Link to={getNavLink('#autres')} style={{ textDecoration: 'none', color: 'inherit' }}>
                Autres
              </Link>
            </li>
          </ul>
        </nav>
        <div className="header-actions">
          <Link to="/diagnostic">
            <button className="btn-diagnostic">Réaliser un diagnostic</button>
          </Link>
        </div>
      </div>
    </header>
  );
}

