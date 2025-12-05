import Header from '../components/Header/Header';
import MidText from '../components/MidText/MidText';
import DiagnosticFix from '../components/DiagnosticFix/DiagnosticFix';
import { SearchBattleGame } from '../components/SopraDefi/SearchBattleGame';
import NIRDBloc from '../components/NIRDBloc/NIRDBloc';
import Footer from '../components/Footer/Footer';

export default function LandingPage() {
  return (
    <>
      <Header />
      <DiagnosticFix />
      <MidText />
      <NIRDBloc />
      <SearchBattleGame />
      <Footer />
    </>
  );
}
