import { Suspense, useEffect, useMemo, lazy } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header.jsx';
import FooterYelp from './components/FooterYelp.jsx';
import CookieConsent from './components/CookieConsent.jsx';
import GoogleAnalytics from './components/GoogleAnalytics.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import LanguageRouteWrapper from './components/LanguageRouteWrapper.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Lazy load heavy pages for better performance
const Home = lazy(() => import('./pages/Home.jsx'));
const Search = lazy(() => import('./pages/Search/Search.jsx'));
const Cities = lazy(() => import('./pages/Cities.jsx'));
const CityBrowse = lazy(() => import('./pages/Browse/CityBrowse.jsx'));
const RegionBrowse = lazy(() => import('./pages/Browse/RegionBrowse.jsx'));
const CategoryBrowse = lazy(() => import('./pages/Browse/CategoryBrowse.jsx'));
const Login = lazy(() => import('./pages/Auth/Login.jsx'));
const Register = lazy(() => import('./pages/Auth/Register.jsx'));
const CreateBusinessWizard = lazy(() => import('./components/CreateBusiness/CreateBusinessWizard.jsx'));
const EditBusiness = lazy(() => import('./pages/Dashboard/EditBusiness.jsx'));
const MyBusinesses = lazy(() => import('./pages/Dashboard/MyBusinesses.jsx'));
const MigrationTools = lazy(() => import('./pages/Dashboard/MigrationTools.jsx'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard.jsx'));
const AdminTools = lazy(() => import('./pages/Admin/AdminTools.jsx'));
const AdminClaims = lazy(() => import('./pages/Admin/AdminClaims.jsx'));
const AdminModeration = lazy(() => import('./pages/Admin/AdminModeration.jsx'));
const AdminStats = lazy(() => import('./pages/Admin/AdminStatsNew.jsx'));
const AdminSponsors = lazy(() => import('./pages/Admin/AdminSponsors.jsx'));
const BusinessDetails = lazy(() => import('./pages/BusinessDetails.jsx'));
const LegalNotice = lazy(() => import('./pages/LegalNotice.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const UserProfile = lazy(() => import('./pages/UserProfile.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx'));
const BlogArticle = lazy(() => import('./pages/BlogArticle.jsx'));
const FAQ = lazy(() => import('./pages/FAQ.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

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

  // Loading fallback component
  const LoadingFallback = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      color: '#666',
      fontSize: '1.1rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>⏳</div>
        <div>{i18n.language === 'en' ? 'Loading...' : 'Chargement...'}</div>
      </div>
    </div>
  );

  return (
    <HelmetProvider>
      <AuthProvider>
        <GoogleAnalytics />
        <ScrollToTop />
        <div className={`app theme-${i18n.language}`}>
          <Header />
          <CookieConsent />
          <main>
            <Suspense fallback={<LoadingFallback />}>
              <LanguageRouteWrapper>
                <Routes>
                {/* ===== FRENCH ROUTES (root) ===== */}
                <Route path="/" element={<Home />} />

                {/* Search */}
                <Route path="/recherche" element={<Search />} />

              {/* Browse Pages */}
              <Route path="/villes" element={<Cities />} />
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

              {/* FAQ */}
              <Route path="/faq" element={<FAQ />} />

              {/* 404 Page */}
              <Route path="/404" element={<NotFound />} />

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
                path="/admin/sponsors"
                element={
                  <AdminRoute>
                    <AdminSponsors />
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
              <Route path="/en/cities" element={<Cities />} />
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

              {/* FAQ */}
              <Route path="/en/faq" element={<FAQ />} />

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
                path="/en/admin/sponsors"
                element={
                  <AdminRoute>
                    <AdminSponsors />
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

              {/* 404 - Must be last route */}
              <Route path="*" element={<NotFound />} />
                </Routes>
              </LanguageRouteWrapper>
            </Suspense>
          </main>
          <FooterYelp />
        </div>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
