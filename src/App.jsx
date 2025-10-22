import { Suspense, useEffect, useMemo } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home.jsx';
import Search from './pages/Search/Search.jsx';
import CityBrowse from './pages/Browse/CityBrowse.jsx';
import RegionBrowse from './pages/Browse/RegionBrowse.jsx';
import CategoryBrowse from './pages/Browse/CategoryBrowse.jsx';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import CreateBusiness from './pages/Dashboard/CreateBusiness.jsx';
import EditBusiness from './pages/Dashboard/EditBusiness.jsx';
import MyBusinesses from './pages/Dashboard/MyBusinesses.jsx';
import MigrationTools from './pages/Dashboard/MigrationTools.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import AdminTools from './pages/Admin/AdminTools.jsx';
import AdminClaims from './pages/Admin/AdminClaims.jsx';
import BusinessDetails from './pages/BusinessDetails.jsx';
import LegalNotice from './pages/LegalNotice.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
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

              {/* New Search Engine */}
              <Route path="/recherche" element={<Search />} />

              {/* Browse Pages */}
              <Route path="/ville/:citySlug" element={<CityBrowse />} />
              <Route path="/region/:regionSlug" element={<RegionBrowse />} />
              <Route path="/categorie/:categorySlug" element={<CategoryBrowse />} />
              <Route path="/categorie/:categorySlug/:subCategorySlug" element={<CategoryBrowse />} />

              {/* Auth */}
              <Route path="/connexion" element={<Login />} />
              <Route path="/inscription" element={<Register />} />

              {/* Legal */}
              <Route path="/mentions-legales" element={<LegalNotice />} />
              <Route path="/legal-notice" element={<LegalNotice />} />

              {/* Dashboard */}
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
              <Route
                path="/admin/migration"
                element={
                  <AdminRoute>
                    <MigrationTools />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/tools"
                element={
                  <AdminRoute>
                    <AdminTools />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/claims"
                element={
                  <AdminRoute>
                    <AdminClaims />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Business Details - New SEO-friendly URL structure: /category/city/slug */}
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
