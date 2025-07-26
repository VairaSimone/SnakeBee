import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfigPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [privacyConsentGoogle, setPrivacyConsentGoogle] = useState(false);
  const [googleError, setGoogleError] = useState('');
    const handleGoogleLogin = () => {
      if (!privacyConsentGoogle) {
        setGoogleError('Devi accettare la Privacy Policy per registrarti con Google.');
        return;
      }
      window.location.href = `${process.env.REACT_APP_BACKEND_URL}/api/v1/login-google`;
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    const nameRegex = /^[a-zA-Z0-9]{2,}$/;
    if (!nameRegex.test(name.trim())) {
      setErrorMessage('Il nome può contenere solo lettere e numeri.');
      return;
    }
    if (name.trim().length < 3) {
      setErrorMessage('Il nome deve contenere almeno 3 caratteri.');
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage('Inserisci un indirizzo email valido.');
      return;
    }

    if (!passwordRegex.test(password)) {
      setErrorMessage('La password deve avere almeno 8 caratteri, una lettera maiuscola, un numero e un carattere speciale.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Le password non coincidono.');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/v1/register`, {
        name,
        email,
        password,
        confirmPassword,
        privacyConsent: true
      });
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error('Errore durante la registrazione:', err);
      const serverMessage = err.response?.data?.message || '';

      if (serverMessage.includes('alpha-numeric')) {
        setErrorMessage('Il nome può contenere solo lettere e numeri, niente caratteri speciali.');
      } else if (serverMessage) {
        setErrorMessage(serverMessage);
      } else {
        setErrorMessage('Errore sconosciuto. Riprova più tardi.');
      }
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF3E0] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-[#2B2B2B] mb-6 text-center">Crea un nuovo account</h2>

        {errorMessage && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-4 text-sm text-center animate-shake transition-all duration-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-sm mb-1 text-[#2B2B2B]">Nome</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#228B22]"
              placeholder="Inserisci il tuo nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-sm mb-1 text-[#2B2B2B]">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#228B22]"
              placeholder="Inserisci la tua email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-sm mb-1 text-[#2B2B2B]">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#228B22]"
              placeholder="Inserisci una password sicura"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-sm mb-1 text-[#2B2B2B]">Conferma Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#228B22]"
              placeholder="Ripeti la password"
              value={confirmPassword}
              onChange={(e) => setConfigPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="privacyConsent"
              checked={privacyConsent}
              onChange={() => setPrivacyConsent(!privacyConsent)}
              required
            />
            <label htmlFor="privacyConsent" className="text-sm text-[#2B2B2B]">
              Accetto il trattamento dei dati personali secondo la             <a href="https://www.iubenda.com/privacy-policy/71616687" class="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe " title="Privacy Policy ">Privacy Policy</a>.
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#228B22] text-white py-2 rounded-md hover:bg-green-700 transition  transform duration-150"
          >
            Registrati
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">oppure</p>
        </div>

        <button
          className="mt-4 w-full py-2 rounded-md border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 transition"
          onClick={handleGoogleLogin}
        >
          <span className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center">
            <FaGoogle className="text-red-500 text-sm" />
          </span>

          <span className="text-sm text-[#2B2B2B] font-medium">Registrati con Google</span>
        </button>
        <div className="flex items-center gap-2 mt-2 mb-2">
          <input
            type="checkbox"
            id="privacyConsentGoogle"
            checked={privacyConsentGoogle}
            onChange={() => {
              setPrivacyConsentGoogle(!privacyConsentGoogle);
              setGoogleError('');
            }}
          />
          <label htmlFor="privacyConsentGoogle" className="text-sm text-[#2B2B2B]">
            Accetto il trattamento dei dati personali secondo la             <a href="https://www.iubenda.com/privacy-policy/71616687" class="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe " title="Privacy Policy ">Privacy Policy</a>
.
          </label>
        </div>
        {googleError && <p className="text-red-600 text-sm animate-shake transition-all duration-300">{googleError}</p>}

        <p className="mt-6 text-sm text-center text-gray-700">
          Hai già un account?{' '}
          <Link to="/login" className="text-[#228B22] font-semibold hover:underline">
            Accedi qui
          </Link>
        </p>
      </div>
    </div>
  );
};
<style>{`
`}</style>
export default Register;
