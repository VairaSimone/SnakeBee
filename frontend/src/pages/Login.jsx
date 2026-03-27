import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/userSlice';
import { FaGoogle } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import { mergeCart } from '../services/storeApi';
import { useCart } from '../context/CartContext';
const Login = () => {
      const { t} = useTranslation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
const { fetchCart } = useCart();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const language = navigator.language.split('-')[0] || "it"; 
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/v1/login`, { email, password }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json', 'Accept-Language': language }
      });

      const { accessToken, refreshToken } = res.data;
      localStorage.setItem('token', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      const userRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/v1/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userRes.data.isVerified) {
        setErrorMessage(t('login.verifyEmail'));
        setIsLoading(false);
        return;
      }

      dispatch(loginUser(userRes.data));
      try { await mergeCart(); await fetchCart(); } catch { }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === t('login.verify')) {
        setErrorMessage(msg);
      } else if (err.response?.status === 401) {
        setErrorMessage(t('login.invalid'));
      } else {
        setErrorMessage(msg || t('login.error'));
      }
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!isLoading) {
      window.location.href = `${process.env.REACT_APP_BACKEND_URL}/v1/login-google`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF3E0] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-[#2B2B2B] mb-6 text-center">{t('login.accessSB')}</h2>

        {errorMessage && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 p-3 rounded-md transition-all duration-300 animate-shake">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-sm mb-1 text-[#2B2B2B]">{t('login.email')}</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#228B22]"
              placeholder={t('login.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block font-semibold text-sm mb-1 text-[#2B2B2B]">{t('login.password')}</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#228B22]"
              placeholder={t('login.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="text-right text-sm">
            <Link to="/forgot-password" className="text-[#228B22] hover:underline">
              {t('login.forgotPassword')}
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 rounded-md text-white transition ${isLoading ? 'bg-gray-400 cursor-not-allowed animate-pulse' : 'bg-[#228B22] hover:bg-green-700'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loader"></span> {t('login.access')}
              </span>
            ) : (
              'Accedi'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">{t('login.or')}</p>
        </div>

        <button
          disabled={isLoading}
          className="mt-4 w-full py-2 rounded-md border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 transition"
          onClick={handleGoogleLogin}
        >
          <span className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center">
            <FaGoogle className="text-red-500 text-sm" />
          </span>
          <span className="text-sm text-[#2B2B2B] font-medium">{t('login.google')}</span>
        </button>

        <p className="mt-6 text-sm text-center text-gray-700">
          {t('login.account')}{' '}
          <Link to="/register" className="text-[#228B22] font-semibold hover:underline">
            {t('login.registerHere')}
          </Link>
        </p>
      </div>

    </div>

  );
};

export default Login;
