import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useDispatch } from 'react-redux';
import { logoutUser, setLanguage } from '../features/userSlice';
import { Link, useNavigate } from 'react-router-dom';
import i18n from '../i18n';
import { FiUser, FiShield, FiBell, FiUpload, FiDownload, FiTrash2, FiAlertTriangle, FiCheckCircle, FiXCircle, FiGift } from 'react-icons/fi';
import { Trans, useTranslation } from 'react-i18next';


const Toast = ({ toasts, removeToast }) => (
  <div className="fixed top-5 right-5 z-50 w-full max-w-sm space-y-3">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`relative flex items-center gap-4 w-full px-4 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300 animate-slide-in-right
          ${t.type === 'error' ? 'bg-red-500' : 'bg-green-500'}
        `}
      >
        {t.type === 'error' ? <FiXCircle size={20} /> : <FiCheckCircle size={20} />}
        <span>{t.message}</span>
        <button onClick={() => removeToast(t.id)} className="absolute top-1 right-2 text-white/80 hover:text-white font-bold text-xl">&times;</button>
      </div>
    ))}
  </div>
);

const ConfirmModal = ({ show, title, message, onConfirm, onCancel }) => {
  const { t } = useTranslation();

  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 text-center space-y-4 transform transition-all duration-300 animate-scale-up">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <FiAlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500">{message}</p>
        <div className="flex justify-center gap-4 pt-4">
          <button onClick={onCancel} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-md font-semibold hover:bg-slate-300 transition-colors">
            {t('UserProfile.cancel')}
          </button>
          <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors">
            {t('UserProfile.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="p-6 border-b border-slate-200">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
      </div>
    </div>
    <div className="p-6 space-y-6">
      {children}
    </div>
  </div>
);

const InputField = ({ id, label, type = "text", value, onChange, required = false, placeholder = "" }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-black"
    />
  </div>
);


const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [language, setLanguageLocal] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [toasts, setToasts] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [passwordForEmail, setPasswordForEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailFeedingNotifications, setEmailFeedingNotifications] = useState(true);
  const [notificationMsg, setNotificationMsg] = useState('');
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [referralError, setReferralError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  const nameRegex = /^[a-zA-Z0-9\s]{2,}$/;

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    console.log("Avatar dal backend:", avatar);

    if (avatar instanceof File) {
      const objectUrl = URL.createObjectURL(avatar);
      setAvatarPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof avatar === 'string' && avatar.trim() !== '') {
      const isAbsolute = avatar.startsWith('http://') || avatar.startsWith('https://');
      setAvatarPreview(isAbsolute ? avatar : process.env.REACT_APP_BACKEND_URL_IMAGE + avatar);
    } else {
      setAvatarPreview('');
    }
  }, [avatar]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/v1/me');
        setUser(data);
        setName(data.name);
        setLanguageLocal(data.language);
        setEmail(data.email);
        setAvatar(data.avatar);
        setAddress(data.address || '');
        setPhoneNumber(data.phoneNumber || '');
        setEmailFeedingNotifications(data.emailFeedingNotifications ?? true);
      } catch {
        addToast(t('UserProfile.errorProfile'), 'error');
      }
    };
    const fetchReferralLink = async () => {
      try {
        const { data } = await api.get('/user/referral-link');
        setReferralLink(data.referralLink); 
      } catch (err) {
        setReferralError(err.response?.data?.message || t('UserProfile.referralError'));
      }
    };
    fetchUser();
    fetchReferralLink();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!nameRegex.test(trimmedName)) {
      addToast(t('UserProfile.nameNumbers'), 'error');
      return;
    }
    if (trimmedName.length < 3) {
      addToast(t('UserProfile.nameCharacter'), 'error');
      return;
    }
    const phoneRegex = /^\+?[0-9\s\-]{7,15}$/;

    if (phoneNumber && !phoneRegex.test(phoneNumber.trim())) {
      addToast(t('UserProfile.invalidPhone'), 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', trimmedName);
      formData.append('language', language);
      formData.append('address', address.trim());
      formData.append('phoneNumber', phoneNumber.trim());

      if (avatar instanceof File) {
        formData.append('avatar', avatar);
      }

      const { data } = await api.put(`/user/${user._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(data);
      dispatch(setLanguage(data.language));
      i18n.changeLanguage(data.language)
      addToast(t('UserProfile.successProfileUpdate'), 'success');
    } catch {
      addToast(t('UserProfile.errorProfileUpdate'), 'error');
    }
  };
  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setEmailError('');
    if (!emailRegex.test(newEmail.trim())) {
      setEmailError(t('UserProfile.emailInvalid'));
      return;
    }
    if (newEmail !== confirmNewEmail) {
      setEmailError(t('UserProfile.emailError'));
      return;
    }
    try {
      const { data } = await api.post('/v1/change-email', {
        newEmail,
        password: passwordForEmail,
      });
      setEmail(data.newEmail);
      addToast(t('UserProfile.successEmailChange'), 'success');
      setNewEmail('');
      setConfirmNewEmail('');
      setPasswordForEmail('');
      if (data.forceLogout) {
        await api.post('/v1/logout', null, { withCredentials: true });
        dispatch(logoutUser());
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/verify-email', { state: { email: newEmail } });
      }
    } catch (err) {
      setEmailError(err.response?.data?.message || t('UserProfile.EmailGenericError'));
      addToast(t('UserProfile.errorEmailChange'), 'error');
    }
  };
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (!passwordRegex.test(newPassword)) {
      setPasswordError(t('UserProfile.PasswordInvalid'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('UserProfile.PasswordMatch'));
      return;
    }
    try {
      await api.post('/v1/change-password', { oldPassword, newPassword, confirmPassword });
      addToast(t('UserProfile.successPasswordChange'), 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err) {
      setPasswordError(err.response?.data?.message || t('UserProfile.PasswordError'));
      addToast(t('UserProfile.errorPasswordChange'), 'error');
    }
  };
  const confirmDeleteAccount = async () => {
    try {
      await api.delete(`/user/${user._id}`);
      dispatch(logoutUser());
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      navigate('/login');
    } catch {
      addToast(t('UserProfile.deleteUserError'), 'error');
    }
  };
  const handleNotificationSave = async () => {
    try {
      await api.patch(`/user/users/email-settings/${user._id}`, {
        receiveFeedingEmails: emailFeedingNotifications,
      });
      setNotificationMsg(t('UserProfile.successNotification'));
      addToast(t('UserProfile.successNotificationSave'), 'success');
    } catch {
      setNotificationMsg(t('UserProfile.errorNotification'));
      addToast(t('UserProfile.errorNotificationSave'), 'error');
    }
  };
  const handleExportExcel = async () => {
    try {
      const response = await api.get(`reptile/export/reptiles/${user._id}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reptile_data.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();

      addToast(t('UserProfile.downloadSuccess'));
    } catch (err) {
      console.error(err);
      addToast(t('UserProfile.downloadError'), 'error');
    }
  };

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500); // Resetta il messaggio dopo 2.5 secondi
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      addToast(t('UserProfile.copyError'), 'error');
    });
  };

  if (!user) return <div className="flex items-center justify-center h-screen text-slate-500">{t('UserProfile.loadingProfile')}</div>;

  return (
    <div className=" min-h-screen">
      <Toast toasts={toasts} removeToast={removeToast} />
      <ConfirmModal
        show={showDeleteModal}
        title={t('UserProfile.confirmDeletion')}
        message={t('UserProfile.confirmDeletionMsg')}
        onConfirm={() => {
          setShowDeleteModal(false);
          confirmDeleteAccount();
        }}
        onCancel={() => setShowDeleteModal(false)}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">{t('UserProfile.userProfile')}</h1>
          <Link to="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
            {t('UserProfile.backToDashboard')}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="relative w-32 h-32 mx-auto group">
                <img
                  src={avatarPreview || '/images/default_avatar.png'}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover border-4 border-slate-200"
                />
                <div
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <FiUpload className="text-white h-8 w-8" />
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files[0])}
                className="hidden"
              />
              <h2 className="mt-4 text-2xl font-bold text-slate-800">{name}</h2>
              <p className="text-sm text-slate-500">{email}</p>
            </div>
            <SettingsCard title={t('UserProfile.exportData')} icon={<FiDownload className="text-indigo-500 w-6 h-6" />}>
              <p className="text-sm text-slate-600 mb-4">
                {t('UserProfile.downloadExcelInfo')}
              </p>
              <button onClick={handleExportExcel} className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <FiDownload />
                {t('UserProfile.downloadExcel')}
              </button>
            </SettingsCard>
          </aside>

          <main className="lg:col-span-2 space-y-8">
            <SettingsCard title={t('UserProfile.profileInfo')} icon={<FiUser className="text-indigo-500 w-6 h-6" />}>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <InputField id="name" label={t('UserProfile.name')} value={name} onChange={(e) => setName(e.target.value)} required />
                <InputField
                  id="address"
                  label={t('UserProfile.address')}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t('UserProfile.addressPlaceholder')}
                />

                <InputField
                  id="phoneNumber"
                  label={t('UserProfile.phoneNumber')}
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+39 333 1234567"
                />

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-slate-600 mb-1">{t('UserProfile.language')}</label>
                  <select id="language" value={language} onChange={(e) => setLanguageLocal(e.target.value)} required className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-black">
                    <option value="it">Italiano</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors">
                  {t('UserProfile.updateProfile')}
                </button>
              </form>
            </SettingsCard>

            <SettingsCard title={t('UserProfile.security')} icon={<FiShield className="text-indigo-500 w-6 h-6" />}>
              <form onSubmit={handleChangeEmail} className="space-y-4 border-b border-slate-200 pb-6">
                <h4 className="font-semibold text-slate-700">{t('UserProfile.changeEmail')}</h4>
                <InputField id="newEmail" label={t('UserProfile.newEmail')} type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                <InputField id="confirmNewEmail" label={t('UserProfile.newEmail')} type="email" value={confirmNewEmail} onChange={(e) => setConfirmNewEmail(e.target.value)} />
                <InputField id="passwordForEmail" label={t('UserProfile.confirmNewEmail')} type="password" value={passwordForEmail} onChange={(e) => setPasswordForEmail(e.target.value)} placeholder="••••••••" />
                {emailError && <p className="text-sm text-red-600">{emailError}</p>}
                <button type="submit" className="w-full bg-green-700 text-white py-2 px-4 rounded-md font-semibold hover:bg-green-800 transition-colors">{t('UserProfile.submitEmailChange')} </button>
              </form>
              <form onSubmit={handleChangePassword} className="space-y-4 pt-6">
                <h4 className="font-semibold text-slate-700">{t('UserProfile.changePassword')}</h4>
                <InputField id="oldPassword" label={t('UserProfile.currentPassword')} type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="••••••••" />
                <InputField id="newPassword" label={t('UserProfile.newPassword')} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
                <InputField id="confirmPassword" label={t('UserProfile.confirmPassword')} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                <button type="submit" className="w-full bg-green-700 text-white py-2 px-4 rounded-md font-semibold hover:bg-green-800 transition-colors">{t('UserProfile.changePassword')}</button>
              </form>
            </SettingsCard>

            <SettingsCard title={t('UserProfile.notifications')} icon={<FiBell className="text-indigo-500 w-6 h-6" />}>
              <div className="flex items-center justify-between">
                <label htmlFor="emailFeedingToggle" className="text-sm font-medium text-slate-700">
                  {t('UserProfile.feedingEmails')}
                </label>
                <input
                  id="emailFeedingToggle"
                  type="checkbox"
                  checked={emailFeedingNotifications}
                  onChange={(e) => {
                    const allowedPlans = ['BREEDER', 'APPRENTICE', 'PRACTITIONER'];
                    if (!allowedPlans.includes(user.subscription?.plan)) {
                      addToast(t('UserProfile.premiumFeature2'), 'error');
                      return;
                    }
                    setEmailFeedingNotifications(e.target.checked);
                  }}
                  disabled={!['BREEDER', 'APPRENTICE', 'PRACTITIONER'].includes(user.subscription?.plan)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />

              </div>
              {user.subscription?.plan !== 'BREEDER' && user.subscription?.plan !== 'APPRENTICE' && user.subscription?.plan !== 'PRACTITIONER' && (
                <p className="text-xs text-red-600 mt-1">
                  <Trans
                    i18nKey="UserProfile.premiumFeature"
                    components={[<Link to="/pricing" className="underline font-semibold" />]}
                  />
                </p>
              )}

              <button onClick={handleNotificationSave} className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors">
                {t('UserProfile.savePreferences')}
              </button>
            </SettingsCard>

            <SettingsCard title={t('UserProfile.referralTitle', 'Invita un Amico')} icon={<FiGift className="text-indigo-500 w-6 h-6" />}>
              <p className="text-sm text-slate-600">
                {t('UserProfile.referralDesc', 'Invita un amico a registrarsi. Se completa la registrazione e verifica la sua email, riceverai uno sconto del 30% sul tuo prossimo abbonamento!')}
              </p>
              {referralLink && (
                <div className="flex items-stretch gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="w-full border-slate-300 rounded-md shadow-sm bg-slate-50 text-black select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-md font-semibold transition-colors text-white ${isCopied ? 'bg-green-500 hover:bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  >
                    {isCopied ? t('UserProfile.copied', 'Copiato!') : t('UserProfile.copy', 'Copia')}
                  </button>
                </div>
              )}
              {referralError && (
                <div className="text-center p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm">
                  {referralError}
                </div>
              )}
            </SettingsCard>

            <div className="bg-white rounded-lg shadow-md border-2 border-red-200">
              <div className="p-6 border-b border-red-200">
                <div className="flex items-center gap-3">
                  <FiTrash2 className="text-red-500 w-6 h-6" />
                  <h3 className="text-xl font-semibold text-red-700">{t('UserProfile.deleteAccount')}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-600 mb-4">
                  {t('UserProfile.deleteAccountInfo')}
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-red-700 transition-colors"
                >
                  {t('UserProfile.deleteMyAccount')}
                </button>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;