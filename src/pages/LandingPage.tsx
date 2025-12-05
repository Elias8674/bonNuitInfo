import { useState } from 'react';
import Header from '../components/Header/Header';
import MidText from '../components/MidText/MidText';
import DiagnosticFix from '../components/DiagnosticFix/DiagnosticFix';
import { SearchBattleGame } from '../components/SopraDefi/SearchBattleGame';
import NIRDBloc from '../components/NIRDBloc/NIRDBloc';
import Footer from '../components/Footer/Footer';

export default function LandingPage() {
  const [isSearchActive, setIsSearchActive] = useState(false);

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
          <DiagnosticFix />
          <MidText />
          <NIRDBloc />
          <Footer />
        </>
      )}
    </>
  );
}

