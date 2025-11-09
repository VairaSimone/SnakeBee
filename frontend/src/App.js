import React, { useEffect, lazy, Suspense} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, setLanguage, selectLanguage, selectUser  } from './features/userSlice';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/Navbar';
import Footer from './components/Footer';
import ReptileTipBanner from './components/ReptileTipBanner';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import GoogleCallback from './pages/GoogleCallback';
import ProtectedRoute from './components/ProtectedRoute';
import UserProfile from './components/UserProfile';
import Notifications from './components/Notifications';
import ReptileDetails from './components/ReptileDetails';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ProtectedLayout from './components/ProtectedLayout';
import Breeding from './pages/Breeding';
import NotFound from './pages/NotFound';
import InventoryPage from './pages/InventoryPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SuccessPage from './pages/SuccessPage';
import CancelPage from './pages/CancelPage';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import i18n from './i18n';
import { useTranslation } from 'react-i18next';
import CalendarPage from './components/CalendarModal';
import PrivacyPolicyIT from './pages/PrivacyPolicyIT';
import PrivacyPolicyEN from './pages/PrivacyPolicyEN';
import TermsAndConditionsEN from './pages/TermsAndConditionsEN';
import TermsAndConditionsIT from './pages/TermsAndConditionsIT';
import api from './services/api';
import NewsletterBanner from './components/NewsletterBanner';
import TelegramAuth from './pages/TelegramAuth';
import BlogPage from './pages/BlogPage';
import ArticlePage from './pages/ArticlePage';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminBlogDashboard from './pages/admin/AdminBlogDashboard';
import ArticleEditor from './pages/admin/ArticleEditor';
import ReferralBanner from './components/ReferralBanner';
import Shop from './pages/Shop';
import BreederProfile from './pages/BreederProfile';
import BreederList from './pages/BreederList';
import { useState } from 'react';
import BlackFridayBanner from './components/BlackFridayBanner';

const AuthLoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-[#FAF3E0]">
    <div className="w-12 h-12 border-4 border-gray-300 border-t-[#228B22] rounded-full animate-spin"></div>
  </div>
);
function AppContent() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser); // <-- MODIFICA: Seleziona l'utente
 const language = useSelector(selectLanguage);
  const { t } = useTranslation();
const [isLoadingAuth, setIsLoadingAuth] = useState(true);
   useEffect(() => {
    dispatch(setLanguage(navigator.language.split('-')[0] || 'it'));
  }, [dispatch]);
    useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language]);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get(`/v1/me`)
        .then((res) => {
          dispatch(loginUser(res.data));
        })
        .catch((err) => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          // In ogni caso (successo o fallimento), abbiamo finito di controllare
          setIsLoadingAuth(false);
        });
    } else {
      setIsLoadingAuth(false);
    }
  }, [dispatch]);
if (isLoadingAuth) {
    return <AuthLoadingSpinner />;
  }
  return (
    <>
      <NavBar />
<ReferralBanner />
<BlackFridayBanner />
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/it/privacyPolicy" element={<PrivacyPolicyIT />} />
        <Route path="/en/privacyPolicy" element={<PrivacyPolicyEN />} />
        <Route path="/en/terms" element={<TermsAndConditionsEN />} />
        <Route path="/it/terms" element={<TermsAndConditionsIT />} />
        <Route path="/telegram-auth" element={<TelegramAuth />} />

<Route path="/shop" element={<Shop />} />
        <Route path="/shop/breeders" element={<BreederList />} />
        <Route path="/shop/breeders/:userId" element={<BreederProfile />} />
        <Route path="/public/reptile/:reptileId" element={<ReptileDetails />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login-google-callback" element={<GoogleCallback />} />
        {/* Blog Routes */}
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<ArticlePage />} />

        {/* Admin Blog Routes */}
        <Route path="/admin/blog" element={<AdminProtectedRoute><ProtectedLayout><AdminBlogDashboard /></ProtectedLayout></AdminProtectedRoute>} />
        <Route path="/admin/blog/new" element={<AdminProtectedRoute><ProtectedLayout><ArticleEditor /></ProtectedLayout></AdminProtectedRoute>} />
        <Route path="/admin/blog/edit/:id" element={<AdminProtectedRoute><ProtectedLayout><ArticleEditor /></ProtectedLayout></AdminProtectedRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><ProtectedLayout><Dashboard /></ProtectedLayout></ProtectedRoute>} />
        <Route path="/breeding" element={<ProtectedRoute><ProtectedLayout><Breeding /></ProtectedLayout></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><ProtectedLayout><CalendarPage /></ProtectedLayout></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><ProtectedLayout><InventoryPage /></ProtectedLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProtectedLayout><UserProfile /></ProtectedLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/reptiles/:reptileId" element={<ProtectedRoute><ReptileDetails /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />

        <Route path="/pricing" element={<SubscriptionPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/canceled" element={<CancelPage />} />

      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar  />

      <Footer />
      <ReptileTipBanner />
      <NewsletterBanner />

    </>
  );
}

function App() {
    if (!i18n) {
    return null;
  }
  return (
    <Router>
      <AppContent />
    </Router>

  );
}

export default App;
