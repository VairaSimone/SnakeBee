import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, setLanguage, selectLanguage  } from './features/userSlice';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/Navbar';
import Footer from './components/Footer';
import CookieConsent from 'react-cookie-consent';
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
import i18n from './i18n';
import { useTranslation } from 'react-i18next';
import CalendarPage from './components/CalendarModal';

function AppContent() {
  const dispatch = useDispatch();
 const language = useSelector(selectLanguage);
  const { t } = useTranslation();

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
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/v1/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          dispatch(loginUser(res.data));
        })
        .catch((err) => {
          localStorage.removeItem('token');
        });
    }
  }, [dispatch]);

  return (
    <>
      <NavBar />

      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/public/reptile/:reptileId" element={<ReptileDetails />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login-google-callback" element={<GoogleCallback />} />

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
        <Route path="/cancel" element={<CancelPage />} />

      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />

      <Footer />
      <CookieConsent
        location="bottom"
        buttonText="Accetto"
        cookieName="cookieConsent"
        style={{ background: "#2B373B", zIndex: 9999 }}
        buttonStyle={{ color: "#fff", background: "#4CAF50", fontSize: "14px", padding: '8px 16px', borderRadius: '4px' }}
        expires={365}
      >
        {t('app.cookie-policy')} <a href="https://www.iubenda.com/privacy-policy/71616687/cookie-policy" class="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe " title="Cookie Policy ">Cookie Policy</a>.
      </CookieConsent>
      <ReptileTipBanner />
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
