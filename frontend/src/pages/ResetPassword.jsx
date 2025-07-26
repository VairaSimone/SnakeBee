import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const [query] = useSearchParams();

  useEffect(() => {
    const e = query.get('email');
    if (e) setEmail(e);
  }, [query]);

  const validatePassword = (pwd) => {
    const hasNumber = /\d/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    return pwd.length >= 8 && hasNumber && hasLower && hasUpper;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setMessage('Inserisci un’email valida');
      return;
    }

    if (!validatePassword(newPassword)) {
      setMessage('La password deve contenere almeno 8 caratteri, un numero, una lettera maiuscola e una minuscola');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Le due password non corrispondono');
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/reset-password`,
        { email, code, newPassword, confirmPassword }
      );
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Errore nel reset');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF3E0] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4 text-center">Resetta la password</h2>

        {message && (
          <p className="bg-blue-100 text-blue-800 p-2 rounded mb-4 text-sm">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Codice di reset</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nuova password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
              placeholder="Almeno 8 caratteri, 1 numero, 1 maiuscola"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Conferma nuova password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#556B2F] text-white py-2 rounded-md hover:bg-[#445522] transition-colors"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
