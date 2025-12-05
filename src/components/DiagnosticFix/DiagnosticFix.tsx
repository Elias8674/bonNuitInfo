import './DiagnosticFix.css';
import { Link } from 'react-router-dom';

export default function DiagnosticFix() {
  return (
    <div className="diagnostic-fix" role="region" aria-label="barre diagnostic">
      <div className="diagnostic-inner">
        <div className="diagnostic-text">
          Faites un diagnostic et découvrez quelles actions mettre en œuvre pour adopter une nouvelle démarche
        </div>
        <div className="diagnostic-action">
          <Link to="/diagnostic">
            <button className="btn-diagnostic">Réaliser un diagnostic</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

