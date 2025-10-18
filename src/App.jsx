import { Suspense, useEffect, useMemo } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home.jsx';
import SearchResults from './pages/SearchResults.jsx';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import CreateBusiness from './pages/Dashboard/CreateBusiness.jsx';
import EditBusiness from './pages/Dashboard/EditBusiness.jsx';
import MyBusinesses from './pages/Dashboard/MyBusinesses.jsx';
import MigrationTools from './pages/Dashboard/MigrationTools.jsx';
import BusinessDetails from './pages/BusinessDetails.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
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
    <HelmetProvider>
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
              <Route
                path="/entreprise/nouvelle"
                element={
                  <ProtectedRoute>
                    <CreateBusiness />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mes-entreprises"
                element={
                  <ProtectedRoute>
                    <MyBusinesses />
                  </ProtectedRoute>
                }
              />
              {/* New SEO-friendly URL structure: /category/city/slug */}
              <Route path="/:categorySlug/:citySlug/:slug" element={<BusinessDetails />} />
              <Route
                path="/:categorySlug/:citySlug/:slug/modifier"
                element={
                  <ProtectedRoute>
                    <EditBusiness />
                  </ProtectedRoute>
                }
              />

              {/* Legacy routes for backward compatibility */}
              <Route path="/entreprise/:slug" element={<BusinessDetails />} />
              <Route
                path="/entreprise/:slug/modifier"
                element={
                  <ProtectedRoute>
                    <EditBusiness />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/migration"
                element={
                  <ProtectedRoute>
                    <MigrationTools />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Suspense>
    </HelmetProvider>
  );
}

export default App;
