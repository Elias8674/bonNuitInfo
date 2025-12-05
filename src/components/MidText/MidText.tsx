import './MidText.css';
import ensemble from '../../assets/imageEnsemble.png';

export default function MidText() {
  return (
    <section className="midtext" style={{ position: 'relative', zIndex: 1 }}>
      <div className="midtext-container">
        <img src={ensemble} alt="ensemble" className="midtext-ensemble" />
        <h2 className="midtext-title">
          Mettre fin à la dépendance aux Big Tech américaines, à l'obsolescence programmée, aux abonnements onéreux et au vol de données
        </h2>
        <p className="midtext-description">
          La fin du support de Windows 10 souligne notre dépendance technologique. Un collectif enseignant invite les établissements scolaires à s'engager vers un Numérique plus Inclusif, Responsable et Durable, en rejoignant la démarche NIRD.
        </p>
        <button className="midtext-btn">Découvrir la suite</button>
      </div>
    </section>
  );
}

