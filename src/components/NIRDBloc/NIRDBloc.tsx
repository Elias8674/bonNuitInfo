import './NIRDBloc.css';
import { Link } from 'react-router-dom';
import pinkImg from '../../assets/pinkUpBloc.png';
import yellowImg from '../../assets/yellowUpBloc.png';
import blueImg from '../../assets/blueUpBloc.png';

export default function NIRDBloc() {
  return (
    <section className="nird">
      <div className="nird-container">
        <h3 className="nird-title">La démarche NIRD</h3>

        <div className="nird-grid">
          <article className="nird-card nird-card--pink">
            <div className="nird-top">
              <img src={pinkImg} alt="motif rose" className="nird-top-img" />
            </div>
            <div className="nird-body">
              <p className="nird-text">1. Un choix inclusif : un apprentissage actif et valorisant pour tous</p>
            </div>
          </article>

          <article className="nird-card nird-card--yellow">
            <div className="nird-top">
              <img src={yellowImg} alt="motif jaune" className="nird-top-img" />
            </div>
            <div className="nird-body">
              <p className="nird-text">2. Un choix responsable : former à la citoyenneté numérique et à l'esprit critique</p>
            </div>
          </article>

          <article className="nird-card nird-card--blue">
            <div className="nird-top">
              <img src={blueImg} alt="motif bleu" className="nird-top-img" />
            </div>
            <div className="nird-body">
              <p className="nird-text">3. Un choix durable : agir concrètement pour l'environnement et la sobriété numérique</p>
            </div>
          </article>

          <Link to="/rts" className="nird-card nird-card--green" style={{ textDecoration: 'none' }}>
            <div className="nird-top">
              <img src={pinkImg} alt="motif" className="nird-top-img" />
            </div>
            <div className="nird-body">
              <p className="nird-text">4. Jeu RTS : Découvrez notre jeu de stratégie en temps réel</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

