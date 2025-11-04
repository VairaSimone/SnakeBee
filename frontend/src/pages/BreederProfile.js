// src/pages/BreederProfile.js (Basato sul tuo file "import React...")
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicBreederProfile } from '../services/api';
import ReptileCardPublic from '../components/ReptileCardPublic';
import { useTranslation } from 'react-i18next';
// MODIFICATO: Aggiunte icone per i contatti
import {
  MapPinIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  TagIcon,
  InboxIcon,
  CheckBadgeIcon,
  QueueListIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/solid';

// --- NUOVO IMPORT PER ICONE SOCIAL ---
import { FaFacebook, FaInstagram } from 'react-icons/fa';
// --- FINE NUOVO IMPORT ---

// ... (Helper formatJoinDate) ...
const formatJoinDate = (dateString, locale) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
  });
};

const BreederProfile = () => {
  const { userId } = useParams();
  const [breeder, setBreeder] = useState(null);
  const [reptiles, setReptiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, i18n } = useTranslation();

  // ... (useEffect, stati di caricamento, errore e notFound rimangono invariati) ...
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getPublicBreederProfile(userId);
        setBreeder(data.breeder);
        const reptilesWithBreeder = data.reptiles.map(r => ({
          ...r,
          user: data.breeder._id,
          breeder: {
            name: data.breeder.name,
            avatar: data.breeder.avatar,
            address: data.breeder.address
          }
        }));
        setReptiles(reptilesWithBreeder);
      } catch (err) {
        setError(t('breederProfile.error', 'Impossibile caricare il profilo.'));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, t]);

  // --- STATI DI CARICAMENTO E ERRORE ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <ArrowPathIcon className="w-16 h-16 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-10 bg-red-50 border-l-4 border-red-500 text-red-800 p-6 rounded-2xl shadow-lg shadow-red-100/50" role="alert">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 mr-3 text-red-600" />
          <p className="font-semibold text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!breeder) {
    return (
      <div className="text-center bg-white p-12 rounded-2xl shadow-lg text-stone-500 max-w-lg mx-auto my-10">
        <InboxIcon className="w-16 h-16 mx-auto mb-5 text-stone-400" />
        <h3 className="text-2xl font-semibold text-stone-700 mb-2">
          {t('breederProfile.notFound', 'Allevatore non trovato.')}
        </h3>
        <p>{t('breederProfile.notFoundDesc', 'Impossibile trovare questo allevatore. Potrebbe non essere più attivo.')}</p>
      </div>
    );
  }

  // --- FINE STATI ---

    const apiUrl = process.env.REACT_APP_BACKEND_URL_IMAGE; 
let avatarUrl = '/default-avatar.png'; // Immagine di default

  if (breeder.avatar) {
    const avatarUrls = breeder.avatar;

    // Controlla se l'URL è assoluto (http:// o https://)
    if (avatarUrls.startsWith('http://') || avatarUrls.startsWith('https://')) {
      avatarUrl = avatarUrls; // Usa l'URL così com'è
    } 
    // Altrimenti, se è un percorso relativo (inizia con /)
    else if (avatarUrls.startsWith('/')) {
      avatarUrl = `${apiUrl}${avatarUrls}`; // Aggiungi il prefisso apiUrl
    }
    // Potresti anche gestire percorsi non validi, ma per ora questo copre i casi principali
  }


  const joinDate = formatJoinDate(breeder.createdAt, i18n.language);
  const reptileCount = reptiles.length;
  const uniqueSpecies = [...new Set(reptiles.map(r => r.species))].sort();

  return (
    <div className=" min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Pulsante Indietro */}
        <div className="mb-6 text-black">
                <Link 
          to="/shop" // Modifica questo percorso se punta a una route diversa
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900 mb-4 transition-colors duration-200 text-black"
        >
          <ArrowLeftIcon className="w-5 h-5 text-black" />
          {t('shop.back', 'Torna allo Shop')}
        </Link>
        </div>

        {/* --- HERO SECTION ALLEVATORE --- */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 relative overflow-hidden mb-12">
          {/* ... (BG e Avatar) ... */}
          <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl -z-0" aria-hidden="true"></div>
          
          <div className="relative z-10 md:flex">
            {/* Colonna Sinistra: Avatar */}
            <div className="md:w-1/3 flex-shrink-0 text-center md:text-left">
              <img 
                src={avatarUrl} 
                alt={breeder.name}
                className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover border-4 border-amber-600 shadow-lg mx-auto md:mx-0"
              />
            </div>
            
          {/* Colonna Destra: Info e Statistiche */}
          <div className="md:pl-8 mt-6 md:mt-0 flex-grow">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-stone-900 mb-2">
                {breeder.name}
              </h1>
              {/* Badge Verificato */}
              {breeder.isVerified && (
                <div className="flex items-center justify-center md:justify-start gap-1.5 text-blue-600 font-semibold mb-4">
                  <CheckBadgeIcon className="w-5 h-5" />
                  <span>{t('breederProfile.verified', 'Allevatore Verificato')}</span>
                </div>
              )}
            </div>
            
            {/* Griglia Statistiche */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-6 text-stone-700">
              
              {/* Stat: Email */}
              {breeder.email && (
                <div className="flex items-center gap-2.5">
                  <EnvelopeIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <a 
                    href={`mailto:${breeder.email}`} 
                    className="text-md font-medium text-emerald-700 hover:text-emerald-800 hover:underline truncate"
                    title={breeder.email}
                  >
                    {breeder.email}
                  </a>
                </div>
              )}

              {/* Stat: Telefono */}
              {breeder.phoneNumber && (
                <div className="flex items-center gap-2.5">
                  <PhoneIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <a 
                    href={`tel:${breeder.phoneNumber}`} 
                    className="text-md font-medium text-emerald-700 hover:text-emerald-800 hover:underline truncate"
                    title={breeder.phoneNumber}
                  >
                    {breeder.phoneNumber}
                  </a>
                </div>
              )}

              {/* --- STAT SOCIALS AGGIUNTI --- */}
              {/* Stat: Facebook */}
              {breeder.socials?.facebook && (
                  <div className="flex items-center gap-2.5">
                  <FaFacebook className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <a 
                      href={breeder.socials.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-md font-medium text-emerald-700 hover:text-emerald-800 hover:underline truncate"
                      title={breeder.socials.facebook}
                  >
                      {t('breederProfile.facebook', 'Facebook')}
                  </a>
                  </div>
              )}

              {/* Stat: Instagram */}
              {breeder.socials?.instagram && (
                  <div className="flex items-center gap-2.5">
                  <FaInstagram className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <a 
                      href={breeder.socials.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-md font-medium text-emerald-700 hover:text-emerald-800 hover:underline truncate"
                      title={breeder.socials.instagram}
                  >
                      {t('breederProfile.instagram', 'Instagram')}
                  </a>
                  </div>
              )}
              {/* --- FINE STAT SOCIALS --- */}

              {/* Stat: Indirizzo */}
              {breeder.address && (
                <div className="flex items-center gap-2.5">
                  <MapPinIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-md font-medium">{breeder.address}</span>
                </div>
              )}
              
              {/* Stat: Membro dal */}
              {breeder.createdAt && (
                <div className="flex items-center gap-2.5">
                  <CalendarDaysIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-md font-medium">
                    {t('breederProfile.joined', 'Membro dal:')} <strong>{joinDate}</strong>
                  </span>
                </div>
              )}

              {/* Stat: Piano */}
              <div className="flex items-center gap-2.5">
                <ShieldCheckIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span className="text-md font-medium">
                  {t('breederProfile.plan', 'Piano:')} <strong>{breeder.subscription.plan}</strong>
                </span>
              </div>
              
              {/* Stat: Numero Rettili */}
              <div className="flex items-center gap-2.5">
                <TagIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span className="text-md font-medium">
                  <strong>{reptileCount}</strong> {reptileCount === 1 ? t('breederProfile.reptile', 'rettile') : t('breederProfile.reptiles', 'rettili')} {t('breederProfile.onSale', 'in vendita')}
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>


        {/* Rettili dell'Allevatore */}
        <h2 className="text-2xl font-semibold text-stone-800 mb-6">
          {t('breederProfile.reptilesTitle', 'Rettili disponibili')}
        </h2>
        {reptiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reptiles.map(reptile => (
              <ReptileCardPublic key={reptile._id} reptile={reptile} />
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-12 rounded-2xl shadow-lg text-stone-500">
            {/* ... (Stato "Nessun annuncio") ... */}
          </div>
        )}
      </div>
    </div>
  );
};

export default BreederProfile;