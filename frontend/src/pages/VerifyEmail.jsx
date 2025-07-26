import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/v1/verify-email`, { email, code });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Errore di verifica');
    }
  };

  const handleResend = async () => {
    if (!email) return setResendError('Inserisci prima la tua email');
    if (resendCount >= MAX_RESENDS) return setResendError("Hai raggiunto il limite massimo di tentativi.");

    setResendLoading(true);
    setResendMessage(null);
    setResendError(null);
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/v1/resend-verification`, { email });
      setResendMessage(res.data.message);
      setCooldown(60); // 60 secondi
      setResendCount((prev) => prev + 1);
    } catch (err) {
      const msg = err.response?.data?.message || 'Errore nel reinvio';
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
        <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4 text-center">Verifica la tua email</h2>

        {message && <p className="bg-green-100 text-green-800 p-2 rounded mb-2 text-sm">{message}</p>}
        {error && <p className="bg-red-100 text-red-800 p-2 rounded mb-2 text-sm">{error}</p>}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-[#2B2B2B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Codice di verifica ricevuto tramite email</label>
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
            Verifica
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-black">
          <p>Non hai ricevuto il codice?</p>
          <button
            onClick={handleResend}
            disabled={resendLoading || cooldown > 0 || resendCount >= MAX_RESENDS}
            className="text-[#FFD700] hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendLoading
              ? 'Invio in corso...'
              : cooldown > 0
                ? `Riprova tra ${cooldown}s`
                : resendCount >= MAX_RESENDS
                  ? 'Limite raggiunto'
                  : 'Reinvia codice'}
          </button>
          {resendMessage && <p className="text-green-600 mt-2">{resendMessage}</p>}
          {resendError && <p className="text-red-600 mt-2">{resendError}</p>}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
