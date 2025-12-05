import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import MidText from '../components/MidText/MidText';
import DiagnosticFix from '../components/DiagnosticFix/DiagnosticFix';
import { SearchBattleGame } from '../components/SopraDefi/SearchBattleGame';
import NIRDBloc from '../components/NIRDBloc/NIRDBloc';
import Footer from '../components/Footer/Footer';

export default function LandingPage() {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash]);

  const handleSearchStart = () => {
    setIsSearchActive(true);
  };

  const handleSearchEnd = () => {
    setIsSearchActive(false);
  };

  return (
    <>
      {!isSearchActive && <Header />}
      <SearchBattleGame onSearchStart={handleSearchStart} onSearchEnd={handleSearchEnd} />
      {!isSearchActive && (
        <>
          <div id="introduction">
            <DiagnosticFix />
            <MidText />
          </div>
          <div id="demarche">
            <NIRDBloc />
          </div>
          <div id="autres">
            <Footer />
          </div>
        </>
      )}
    </>
  );
}

