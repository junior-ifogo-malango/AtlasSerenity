import { Routes, Route, useLocation } from "react-router-dom"
import Footer from "./components/layout/Footer"
import Accueil from "./pages/voyageur/Accueil"
import Recherche from "./pages/voyageur/Recherche"
import Login from "./pages/voyageur/Login"
import Register from "./pages/voyageur/Register"
import MotDePasseOublie from "./pages/voyageur/MotDePasseOublie"
import ReinitialiserMotDePasse from "./pages/voyageur/ReinitialiserMotDePasse"
import VerifierEmail from "./pages/voyageur/VerifierEmail"
import DetailActivite from "./pages/voyageur/DetailActivite"
import MesReservations from "./pages/voyageur/MesReservations"
import Favoris from "./pages/voyageur/Favoris"
import MonProfil from "./pages/voyageur/MonProfil"
import DashboardOperateur from "./pages/operateur/DashboardOperateur"
import VerificationOperateur from "./pages/operateur/VerificationOperateur"
import CreerActivite from "./pages/operateur/CreerActivite"
import GererDisponibilites from "./pages/operateur/GererDisponibilites"
import GererPhotos from "./pages/operateur/GererPhotos"
import QuestionnaireEco from "./pages/operateur/QuestionnaireEco"
import ValidationAdmin from "./pages/admin/ValidationAdmin"
import DashboardCRM from "./pages/admin/DashboardCRM"
import MentionsLegales from "./pages/legal/MentionsLegales"
import CGU from "./pages/legal/CGU"
import PolitiqueConfidentialite from "./pages/legal/PolitiqueConfidentialite"

function App() {
  const location = useLocation()
  const estDashboard =
    location.pathname.startsWith("/admin") || location.pathname.startsWith("/operateur")

  return (
    <>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/recherche" element={<Recherche />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
        <Route path="/reinitialiser-mot-de-passe" element={<ReinitialiserMotDePasse />} />
        <Route path="/verifier-email/:id/:hash" element={<VerifierEmail />} />
        <Route path="/activites/:id" element={<DetailActivite />} />
        <Route path="/mes-reservations" element={<MesReservations />} />
        <Route path="/favoris" element={<Favoris />} />
        <Route path="/profil" element={<MonProfil />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/cgu" element={<CGU />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
        <Route path="/operateur/dashboard" element={<DashboardOperateur />} />
        <Route path="/operateur/verification" element={<VerificationOperateur />} />
        <Route path="/operateur/activites/nouvelle" element={<CreerActivite />} />
        <Route path="/operateur/activites/:id/disponibilites" element={<GererDisponibilites />} />
        <Route path="/operateur/activites/:id/photos" element={<GererPhotos />} />
        <Route path="/operateur/activites/:id/questionnaire-eco" element={<QuestionnaireEco />} />
        <Route path="/admin/validation" element={<ValidationAdmin />} />
        <Route path="/admin/dashboard" element={<DashboardCRM />} />
      </Routes>
      {!estDashboard && <Footer />}
    </>
  )
}

export default App
