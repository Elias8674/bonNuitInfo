import './DiagnosticFix.css';

export default function DiagnosticFix() {
  return (
    <div className="diagnostic-fix" role="region" aria-label="barre diagnostic">
      <div className="diagnostic-inner">
        <div className="diagnostic-text">
          Faites un diagnostic et découvrez quelles actions mettre en œuvre pour adopter une nouvelle démarche
        </div>
        <div className="diagnostic-action">
          <button className="btn-diagnostic">Réaliser un diagnostic</button>
        </div>
      </div>
    </div>
  );
}

