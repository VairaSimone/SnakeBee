import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ReferralBanner = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const shouldShowBanner =
    !user || (
      (!user.subscription?.status || !['active', 'processing'].includes(user.subscription.status)) 
      && !user.hasReferred
    );

  if (!shouldShowBanner) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-100 via-lime-300 to-green-400 text-green-900 py-3 px-6 shadow-md rounded-md animate-fade-in">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-base md:text-lg font-medium text-center md:text-left">
          🐍 {t('ReferralBanner.text')}
        </p>

        {user && (
<button
  onClick={() => {
    navigate('/profile');
    setTimeout(() => {
      const el = document.getElementById('referral');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 400); // attende che la pagina carichi
  }}
  className="bg-green-900 text-white font-semibold py-2 px-5 rounded-full shadow hover:bg-green-800 transition-all duration-200"
>
  {t('ReferralBanner.cta')}
</button>
        )}
      </div>
    </div>
  );
};

export default ReferralBanner;
