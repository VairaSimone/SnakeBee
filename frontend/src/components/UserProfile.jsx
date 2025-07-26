import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../features/userSlice';
import { Link, useNavigate } from 'react-router-dom';

// Toast component centralizzato
const Toast = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-5 right-5 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center justify-between max-w-sm px-4 py-2 rounded shadow-lg text-white
            ${t.type === 'error' ? 'bg-red-600' : 'bg-green-600'}
          `}
        >
          <span className="mr-4">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="font-bold">×</button>
        </div>
      ))}
    </div>
  );
};

// Modal per la conferma
const ConfirmModal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs text-center space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-700">{message}</p>
        <div className="flex justify-between">
          <button onClick={onCancel} className="btn-animate text-black px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Annulla
          </button>
          <button onClick={onConfirm} className="btn-animate px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const nameRegex = /^[a-zA-Z0-9]{2,}$/;

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  // toasts management
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // email change
  const [newEmail, setNewEmail] = useState('');
  const [passwordForEmail, setPasswordForEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // password change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');

  // delete confirm
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // notifications
  const [emailFeedingNotifications, setEmailFeedingNotifications] = useState(true);
  const [notificationMsg, setNotificationMsg] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (avatar instanceof File) {
      const objectUrl = URL.createObjectURL(avatar);
      setAvatarPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof avatar === 'string') {
      setAvatarPreview(avatar);
    }
  }, [avatar]);
  useEffect(() => {
    const fetchUser = async () => {

      try {
        const { data } = await api.get('/api/v1/me');
        setUser(data);
        setName(data.name);
        setEmail(data.email);
        setAvatar(data.avatar);
        setEmailFeedingNotifications(data.emailFeedingNotifications ?? true);
      } catch {
        addToast('Errore nel caricamento del profilo utente', 'error');
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!nameRegex.test(trimmedName)) {
      addToast('Il nome può contenere solo lettere e numeri.', 'error');
      return;
    }
    if (trimmedName.length < 3) {
      addToast('Il nome deve contenere almeno 3 caratteri.', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', trimmedName);
      if (avatar instanceof File) {
        formData.append('avatar', avatar);
      }

      const { data } = await api.put(`/user/${user._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(data);
      addToast('Profilo aggiornato con successo!', 'success');
    } catch {
      addToast("Errore nell'aggiornamento del profilo", 'error');
    }
  };


  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setEmailError('');
    if (!emailRegex.test(newEmail.trim())) {
      setEmailError('Inserisci un indirizzo email valido.');
      return;
    }
    if (newEmail !== confirmNewEmail) {
      setEmailError('Le email non coincidono.');
      return;
    }
    try {
      const { data } = await api.post('/api/v1/change-email', {
        newEmail,
        password: passwordForEmail,
      });
      setEmail(data.newEmail);
      addToast('Email cambiata! Controlla la casella per conferma.', 'success');
      setNewEmail('');
      setPasswordForEmail('');
      if (data.forceLogout) {
        await api.post('/api/v1/logout', null, { withCredentials: true });
        dispatch(logoutUser());
        localStorage.removeItem('token');

        navigate('/verify-email', { state: { email: newEmail } });
      }
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Errore nel cambio email');
      addToast('Impossibile cambiare email.', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (!passwordRegex.test(newPassword)) {
      setPasswordError('La password deve avere almeno 8 caratteri, una lettera maiuscola, un numero e un carattere speciale.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Le password non corrispondono.');
      return;
    }
    try {
      await api.post('/api/v1/change-password', { oldPassword, newPassword, confirmPassword });
      addToast('Password aggiornata correttamente.', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setConfirmNewEmail('');

    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Errore nel cambio password');
      addToast('Impossibile cambiare password.', 'error');
    }
  };

  const confirmDeleteAccount = async () => {
    try {
      await api.delete(`/user/${user._id}`);
      dispatch(logoutUser());
      localStorage.removeItem('token');
      navigate('/login');
    } catch {
      addToast('Errore durante l’eliminazione dell’account', 'error');
    }
  };

  const handleNotificationSave = async () => {
    try {
      await api.patch(`/user/users/email-settings/${user._id}`, {
        receiveFeedingEmails: emailFeedingNotifications,
      });
      setNotificationMsg('Preferenze aggiornate.');
      addToast('Preferenze salvate!', 'success');
    } catch {
      setNotificationMsg('Errore aggiornamento.');
      addToast('Errore nelle preferenze.', 'error');
    }
  }; const handleExportExcel = async () => {
    try {
      const response = await api.get(`reptile/export/reptiles/${user._id}`, {
        responseType: 'blob',
      });

      // Crea un link temporaneo per il download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reptile_data.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();

      addToast('Download avviato con successo!');
    } catch (err) {
      console.error(err);
      addToast('Errore durante il download del file.', 'error');
    }
  };


  if (!user) return <div className="text-center mt-10">Caricamento profilo...</div>;

  return (
    <div className="relative">
      <Toast toasts={toasts} removeToast={removeToast} />

<div className="max-w-4xl mx-auto px-4 py-10 text-gray-800 animate-fade-slide-up">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-[#228B22]">Il tuo Profilo</h2>
            <Link to="/dashboard" className="text-sm text-gray-600 hover:underline">← Torna alla Dashboard</Link>
          </div>

          <div className="text-center">
            <img src={avatarPreview || 'https://res.cloudinary.com/dg2wcqflh/image/upload/v1753088270/sq1upmjw7xgrvpkghotk.png'} alt="Avatar" className="w-24 h-24 rounded-full mx-auto border-4 border-[#FFD700] transition duration-300 hover:shadow-[0_0_20px_5px_rgba(255,215,0,0.6)]" onClick={() => addToast("👀 Bel tentativo, ma non si può cambiare così!", "success")}/>
            <h3 className="mt-2 text-lg font-medium">{name}</h3>
            <p className="text-sm text-gray-500">{email}</p>
          </div>

          {/* Aggiorna profilo */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nome</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1 bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Carica Avatar (immagine)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files[0])}
                className="w-full border rounded px-3 py-2 mt-1 bg-white text-black"
              />
            </div>            <button type="submit" className="btn-animate  w-full bg-[#228B22] text-white py-2 rounded hover:bg-green-700">
              Aggiorna Profilo
            </button>
          </form>

          <hr className="border-t" />

          {/* Cambio email */}
          <div animate-section-fade>
            <h3 className="text-xl font-semibold text-[#2B2B2B]">Cambio Email</h3>
            <form onSubmit={handleChangeEmail} className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium">Nuova Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1 bg-white text-black"
                />
                <div>
                  <label className="block text-sm font-medium">Conferma Nuova Email</label>
                  <input
                    type="email"
                    value={confirmNewEmail}
                    onChange={(e) => setConfirmNewEmail(e.target.value)}
                    className="w-full border rounded px-3 py-2 mt-1 bg-white text-black"
                  />
                </div>
                {emailError && <p className="text-sm text-red-600 mt-1">{emailError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Password Attuale</label>
                <input
                  type="password"
                  value={passwordForEmail}
                  onChange={(e) => setPasswordForEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1 bg-white text-black"
                />
              </div>
              <button type="submit" className="btn-animate w-full bg-[#FFD700] text-black py-2 rounded hover:bg-yellow-500">
                Invia Cambio Email
              </button>
            </form>
          </div>

          <hr className="border-t" />

          {/* Cambio password */}
          <div animate-section-fade>
            <h3 className="text-xl font-semibold text-[#2B2B2B]">Cambio Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4 mt-2">
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Password attuale"
                className="w-full border rounded px-3 py-2 bg-white text-black"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nuova password"
                className="w-full border rounded px-3 py-2 bg-white text-black"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Conferma nuova password"
                className="w-full border rounded px-3 py-2 bg-white text-black"
              />
              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
              <button type="submit" className="btn-animate w-full bg-[#CC3300] text-white py-2 rounded hover:bg-red-700">
                Cambia Password
              </button>
            </form>
          </div>

          <hr className="border-t" />

          {/* Notifiche email */}
          <div animate-section-fade>
            <h3 className="text-xl font-semibold text-[#2B2B2B]">Notifiche Email</h3>
            {notificationMsg && <p className="text-sm text-gray-700 mb-2">{notificationMsg}</p>}
            <div className="mt-4 flex items-center justify-between">
              <label htmlFor="emailFeedingToggle" className="text-sm font-medium text-gray-700">
                Email per alimentazione
              </label>
              <input
                id="emailFeedingToggle"
                type="checkbox"
                checked={emailFeedingNotifications}
                onChange={(e) => setEmailFeedingNotifications(e.target.checked)}
                className="h-5 w-5 text-[#228B22] border-gray-300 rounded"
              />
            </div>
            <button
              onClick={handleNotificationSave}
              className="btn-animate mt-4 bg-[#228B22] text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Salva Preferenze
            </button>
          </div>

          <hr className="border-t" />
          {/* Esporta dati in Excel */}
          <div animate-section-fade>
            <h3 className="text-xl font-semibold text-[#2B2B2B]">Esporta i tuoi dati</h3>
            <p className="text-sm text-gray-500 mb-2">
              Scarica un file Excel con tutti i dati dei tuoi rettili, alimentazioni, eventi e riproduzioni.
            </p>
            <button
              onClick={handleExportExcel}
              className="btn-animate bg-[#1E90FF] text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Scarica Excel
            </button>
          </div>
          <hr className="border-t" />

          {/* Elimina account */}
          <div animate-section-fade>
            <h3 className="text-xl font-semibold text-red-600">Elimina Account</h3>
            <p className="text-sm text-gray-500 mb-3">Attenzione! Questa azione è irreversibile.</p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-animate w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors duration-200"
            >
              Elimina Account
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={showDeleteModal}
        title={<span className="text-black">Conferma eliminazione</span>}
        message="Sei sicuro di voler eliminare definitivamente il tuo account?"
        onConfirm={() => {
          setShowDeleteModal(false);
          confirmDeleteAccount();
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default UserProfile;
