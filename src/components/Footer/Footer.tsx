import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Section gauche - Info */}
          <div className="footer-section footer-info">
            <h3 className="footer-heading">NIRD</h3>
            <p className="footer-description">
              Numérique Inclusif, Responsable et Durable
            </p>
            <p className="footer-mission">
              Engagé pour transformer l'éducation numérique vers plus d'inclusion, de responsabilité et de durabilité.
            </p>
          </div>

          {/* Section droite - Partenaire */}
          <div className="footer-section footer-partner">
            <h4 className="footer-section-title">Partenaire</h4>
            <a href="http://5.83.147.213:3000" target="_blank" rel="noopener noreferrer" className="partner-link">
              <div className="partner-badge">
                <span className="decathlon-text">DECATHLON</span>
                <span className="decathlon-tagline">READY TO PLAY?</span>
              </div>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">© 2025 NIRD • Initiative pour un numérique responsable</p>
          <div className="footer-badges">
            <span className="badge">♻️ Durable</span>
            <span className="badge">🤝 Inclusif</span>
            <span className="badge">⚡ Responsable</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

