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
import CreateBusinessWizard from './components/CreateBusiness/CreateBusinessWizard.jsx';
import EditBusiness from './pages/Dashboard/EditBusiness.jsx';
import MyBusinesses from './pages/Dashboard/MyBusinesses.jsx';
import MigrationTools from './pages/Dashboard/MigrationTools.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import AdminTools from './pages/Admin/AdminTools.jsx';
import AdminClaims from './pages/Admin/AdminClaims.jsx';
import AdminModeration from './pages/Admin/AdminModeration.jsx';
import AdminStats from './pages/Admin/AdminStats.jsx';
import BusinessDetails from './pages/BusinessDetails.jsx';
import LegalNotice from './pages/LegalNotice.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import About from './pages/About.jsx';
import UserProfile from './pages/UserProfile.jsx';
import Blog from './pages/Blog.jsx';
import BlogArticle from './pages/BlogArticle.jsx';
import Header from './components/Header.jsx';
import FooterYelp from './components/FooterYelp.jsx';
import CookieConsent from './components/CookieConsent.jsx';
import GoogleAnalytics from './components/GoogleAnalytics.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import LanguageRouteWrapper from './components/LanguageRouteWrapper.jsx';
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
          <GoogleAnalytics />
          <ScrollToTop />
          <div className={`app theme-${i18n.language}`}>
            <Header />
            <CookieConsent />
            <main>
            <LanguageRouteWrapper>
              <Routes>
                {/* ===== FRENCH ROUTES (root) ===== */}
                <Route path="/" element={<Home />} />

                {/* Search */}
                <Route path="/recherche" element={<Search />} />

              {/* Browse Pages */}
              <Route path="/ville/:citySlug" element={<CityBrowse />} />
              <Route path="/region/:regionSlug" element={<RegionBrowse />} />
              <Route path="/categorie/:categorySlug" element={<CategoryBrowse />} />
              <Route path="/categorie/:categorySlug/:subCategorySlug" element={<CategoryBrowse />} />

              {/* Auth */}
              <Route path="/connexion" element={<Login />} />
              <Route path="/inscription" element={<Register />} />

              {/* Legal & Info */}
              <Route path="/a-propos" element={<About />} />
              <Route path="/about" element={<About />} />
              <Route path="/mentions-legales" element={<LegalNotice />} />
              <Route path="/legal-notice" element={<LegalNotice />} />
              <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />

              {/* Blog */}
              <Route path="/blogue" element={<Blog />} />
              <Route path="/blogue/:articleId" element={<BlogArticle />} />

              {/* Dashboard */}
              <Route
                path="/entreprise/nouvelle"
                element={
                  <ProtectedRoute>
                    <CreateBusinessWizard />
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
                path="/profil"
                element={
                  <ProtectedRoute>
                    <UserProfile />
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
                path="/admin/moderation"
                element={
                  <AdminRoute>
                    <AdminModeration />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/stats"
                element={
                  <AdminRoute>
                    <AdminStats />
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

              {/* ===== ENGLISH ROUTES (/en/) ===== */}
              <Route path="/en" element={<Home />} />

              {/* Search */}
              <Route path="/en/search" element={<Search />} />

              {/* Browse Pages */}
              <Route path="/en/city/:citySlug" element={<CityBrowse />} />
              <Route path="/en/region/:regionSlug" element={<RegionBrowse />} />
              <Route path="/en/category/:categorySlug" element={<CategoryBrowse />} />
              <Route path="/en/category/:categorySlug/:subCategorySlug" element={<CategoryBrowse />} />

              {/* Auth */}
              <Route path="/en/login" element={<Login />} />
              <Route path="/en/register" element={<Register />} />

              {/* Legal & Info */}
              <Route path="/en/about" element={<About />} />
              <Route path="/en/legal-notice" element={<LegalNotice />} />
              <Route path="/en/privacy-policy" element={<PrivacyPolicy />} />

              {/* Blog */}
              <Route path="/en/blog" element={<Blog />} />
              <Route path="/en/blog/:articleId" element={<BlogArticle />} />

              {/* Dashboard */}
              <Route
                path="/en/business/new"
                element={
                  <ProtectedRoute>
                    <CreateBusinessWizard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/en/my-businesses"
                element={
                  <ProtectedRoute>
                    <MyBusinesses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/en/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes (keep same in English) */}
              <Route
                path="/en/admin/migration"
                element={
                  <AdminRoute>
                    <MigrationTools />
                  </AdminRoute>
                }
              />
              <Route
                path="/en/admin/tools"
                element={
                  <AdminRoute>
                    <AdminTools />
                  </AdminRoute>
                }
              />
              <Route
                path="/en/admin/claims"
                element={
                  <AdminRoute>
                    <AdminClaims />
                  </AdminRoute>
                }
              />
              <Route
                path="/en/admin/moderation"
                element={
                  <AdminRoute>
                    <AdminModeration />
                  </AdminRoute>
                }
              />
              <Route
                path="/en/admin/stats"
                element={
                  <AdminRoute>
                    <AdminStats />
                  </AdminRoute>
                }
              />
              <Route
                path="/en/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Business Details - English URLs */}
              <Route path="/en/:categorySlug/:citySlug/:slug" element={<BusinessDetails />} />
              <Route
                path="/en/:categorySlug/:citySlug/:slug/edit"
                element={
                  <ProtectedRoute>
                    <EditBusiness />
                  </ProtectedRoute>
                }
              />

              {/* Legacy English routes */}
              <Route path="/en/business/:slug" element={<BusinessDetails />} />
              <Route
                path="/en/business/:slug/edit"
                element={
                  <ProtectedRoute>
                    <EditBusiness />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </LanguageRouteWrapper>
          </main>
          <FooterYelp />
        </div>
      </AuthProvider>
    </Suspense>
    </HelmetProvider>
  );
}

export default App;
