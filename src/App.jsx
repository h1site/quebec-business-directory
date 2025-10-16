import { Suspense, useEffect, useMemo } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Home from './pages/Home.jsx';
import SearchResults from './pages/SearchResults.jsx';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import CreateBusiness from './pages/Dashboard/CreateBusiness.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useMemo(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <AuthProvider>
        <ScrollToTop />
        <div className={`app theme-${i18n.language}`}>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recherche" element={<SearchResults />} />
              <Route path="/connexion" element={<Login />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/entreprise/nouvelle" element={<CreateBusiness />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Suspense>
  );
}

export default App;
