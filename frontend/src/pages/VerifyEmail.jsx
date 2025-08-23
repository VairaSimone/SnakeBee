import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const VerifyEmail = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [resendMessage, setResendMessage] = useState(null);
  const [resendError, setResendError] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const [cooldown, setCooldown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const MAX_RESENDS = 5;
  const { t } = useTranslation();


  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    const e = query.get('email');
    if (e) setEmail(e);
  }, [query]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const language = navigator.language.split('-')[0] || "it";
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/v1/verify-email`, { email, code }, {
        headers: {
          'Accept-Language': language,
        }
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || t('verifyEmail.errorVerifiy'));
    }
  };

  const handleResend = async () => {
    if (!email) return setResendError(t('verifyEmail.emailFirst'));
    if (resendCount >= MAX_RESENDS) return setResendError(t('verifyEmail.limits'));

    setResendLoading(true);
    setResendMessage(null);
    setResendError(null);
    try {
      const language = navigator.language.split('-')[0] || "it";
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/v1/resend-verification`, { email }, {
        headers: {
          'Accept-Language': language,
        }
      });
      setResendMessage(res.data.message);
      setCooldown(60);
      setResendCount((prev) => prev + 1);
    } catch (err) {
      const msg = err.response?.data?.message || t('verifyEmail.errorVerifiy');
      if (msg.includes("Attendi")) {
        const seconds = parseInt(msg.match(/\d+/)?.[0]);
        setCooldown(seconds || 60);
      }
      setResendError(msg);
    } finally {
      setResendLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF3E0] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4 text-center">{t('verifyEmail.verifyEmail')}</h2>

        {message && <p className="bg-green-100 text-green-800 p-2 rounded mb-2 text-sm">{message}</p>}
        {error && <p className="bg-red-100 text-red-800 p-2 rounded mb-2 text-sm">{error}</p>}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('verifyEmail.email')}</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-[#2B2B2B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('verifyEmail.code')}</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-[#2B2B2B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#556B2F] text-white py-2 rounded-md hover:bg-[#446022] transition-colors"
          >
            {t('verifyEmail.verify')}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-black">
          <p>{t('verifyEmail.codeNotReceive')}</p>
          <button
            onClick={handleResend}
            disabled={resendLoading || cooldown > 0 || resendCount >= MAX_RESENDS}
            className="text-[#FFD700] hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendLoading
              ? t('verifyEmail.errorReptile')
              : cooldown > 0
                ? t('verifyEmail.tryAgain' , {seconds: cooldown})
                : resendCount >= MAX_RESENDS
                  ? t('verifyEmail.LimitsEmail')
                  : t('verifyEmail.resent')}
          </button>
          {resendMessage && <p className="text-green-600 mt-2">{resendMessage}</p>}
          {resendError && <p className="text-red-600 mt-2">{resendError}</p>}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
