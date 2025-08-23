import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
    const { t} = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const language = navigator.language.split('-')[0] || "it";
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/v1/forgot-password`, { email }, {
        headers: {
          'Accept-Language': language,
        }
      });
      setMessage(res.data.message);

      setTimeout(() => {
        navigate('/reset-password');
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || t('forgotPassword.error'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF3E0] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4 text-center">{t('forgotPassword.forgotPassword')}</h2>
        {message && <p className="bg-yellow-100 text-yellow-800 p-2 rounded mb-4 text-sm">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('forgotPassword.email')}</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-white text-black mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#FFD700] text-[#2B2B2B] py-2 rounded-md hover:bg-yellow-400 transition-colors"
          >
            {t('forgotPassword.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
