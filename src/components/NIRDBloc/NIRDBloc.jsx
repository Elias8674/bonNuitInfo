import './NIRDBloc.css';

export default function NIRDBloc() {
  return (
    <section className="nird">
      <div className="nird-container">
        <h3 className="nird-title">La démarche NIRD</h3>

        <div className="nird-grid">
          <article className="nird-card nird-card--pink">
            <div className="nird-top">
              {/* SVG 1 */}
              <svg width="403" height="108" viewBox="0 0 403 108" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="403" height="108" fill="url(#pattern0_19_400)"/>
                <defs>
                  <pattern id="pattern0_19_400" patternUnits="userSpaceOnUse" patternTransform="matrix(71.9682 0 0 78.0672 0 0)" preserveAspectRatio="none" viewBox="0 0 63.13 68.48" width="1" height="1">
                    <g>
                      <path d="M0 29.5C0 13.2076 13.2076 0 29.5 0C45.7924 0 59 13.2076 59 29.5V32H0V29.5Z" fill="#FF12B8" fillOpacity="0.14"/>
                    </g>
                  </pattern>
                </defs>
              </svg>
            </div>
            <div className="nird-body">
              <p className="nird-text">1. Un choix inclusif : un apprentissage actif et valorisant pour tous</p>
            </div>
          </article>

          <article className="nird-card nird-card--yellow">
            <div className="nird-top">
              {/* SVG 2 */}
              <svg width="403" height="108" viewBox="0 0 403 108" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="403" height="108" fill="url(#pattern0_19_403)"/>
                <defs>
                  <pattern id="pattern0_19_403" patternUnits="userSpaceOnUse" patternTransform="matrix(48.792 0 0 97.584 0 0)" preserveAspectRatio="none" viewBox="0 0 42.8 85.6" width="1" height="1">
                    <g>
                      <rect width="40" height="40" rx="13" fill="#FFD012" fillOpacity="0.14" />
                    </g>
                  </pattern>
                </defs>
              </svg>
            </div>
            <div className="nird-body">
              <p className="nird-text">2. Un choix responsable : former à la citoyenneté numérique et à l’esprit critique</p>
            </div>
          </article>

          <article className="nird-card nird-card--blue">
            <div className="nird-top">
              {/* SVG 3 */}
              <svg width="403" height="108" viewBox="0 0 403 108" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="403" height="108" fill="url(#pattern0_19_406)"/>
                <defs>
                  <pattern id="pattern0_19_406" patternUnits="userSpaceOnUse" patternTransform="matrix(130.266 0 0 65.133 0.000103827 0)" preserveAspectRatio="none" viewBox="9.10759e-05 0 114.268 57.1342" width="1" height="1">
                    <g>
                      <rect x="28.2843" width="40" height="40" rx="4" transform="rotate(45 28.2843 0)" fill="#12DCFF" fillOpacity="0.14"/>
                    </g>
                  </pattern>
                </defs>
              </svg>
            </div>
            <div className="nird-body">
              <p className="nird-text">3. Un choix durable : agir concrètement pour l’environnement et la sobriété numérique</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
