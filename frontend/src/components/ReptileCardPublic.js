// src/components/ReptileCardPublic.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// NUOVO: Importa icone per le nuove info
import { Cake, CalendarPlus } from 'lucide-react';

/**
 * ReptileCardPublic - markup + stile ridisegnati.
 * Nota: non tocco la logica esistente (image url, price formatting, link).
 */

// NUOVO: Simboli universali di sesso (Unicode) all'interno di SVG per scalabilità e stili
const IconMale = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="16" y1="16" x2="20" y2="20"></line>
    <line x1="4" y1="4" x2="20" y2="20"></line> {/* Rimossa la parte "freccia" per renderla neutra, solo cerchio e linea */}
  </svg>
);
const IconFemale = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="17" x2="12" y2="22"></line>
    <line x1="17" y1="12" x2="22" y2="12"></line>
  </svg>
);
const IconUnknown = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.75 15h-1.5v-1.5h1.5V17zM13 11.5c0 .83-.67 1.5-1.5 1.5h-.25v1h-.75v-.5c0-.83.67-1.5 1.5-1.5h.25v-.5C11.5 10.67 12.17 10 13 10s1 .67 1 1.5V11.5z" />
  </svg>
);
// --- FINE ICONE SESSO ---

// MIGLIORATO: Helper per formattare la data e gestire casi nulli/invalidi
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  // Controlla se la data è valida
  if (isNaN(date.getTime())) {
    return 'N/A';
  }
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const ReptileCardPublic = ({ reptile }) => {
  const { t } = useTranslation();

  const imageUrl = reptile.image && reptile.image.length > 0
    ? reptile.image[0]
    : 'https://res.cloudinary.com/dg2wcqflh/image/upload/v1757791253/Logo_duqbig.png';

  const getSexIcon = () => {
    if (reptile.sex === 'M')
      return (
        // NUOVO: Colore blu per il maschio
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100 flex-shrink-0">
          <IconMale className="w-4 h-4" />
          <span className="sr-only">{t('shop.male', 'Maschio')}</span>
        </span>
      );
    if (reptile.sex === 'F')
      return (
        // NUOVO: Colore rosa per la femmina
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-50 text-pink-600 ring-1 ring-pink-100 flex-shrink-0">
          <IconFemale className="w-4 h-4" />
          <span className="sr-only">{t('shop.female', 'Femmina')}</span>
        </span>
      );
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-50 text-stone-400 ring-1 ring-neutral-100 flex-shrink-0">
        <IconUnknown className="w-4 h-4" />
        <span className="sr-only">{t('shop.unknown', 'Sconosciuto')}</span>
      </span>
    );
  };

  // MODIFICATO: Ritorna null se il prezzo non è disponibile
  const formatPrice = (price) => {
    if (!price || !price.amount) return null;
    return new Intl.NumberFormat(t('locale', 'it-IT'), {
      style: 'currency',
      currency: price.currency || 'EUR',
    }).format(price.amount);
  };

const apiUrl = process.env.REACT_APP_BACKEND_URL_IMAGE; 

let breederAvatar = '/default-avatar.png'; // Immagine di default

  if (reptile.breeder?.avatar) {
    const avatarUrl = reptile.breeder.avatar;

    // Controlla se l'URL è assoluto (http:// o https://)
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      breederAvatar = avatarUrl; // Usa l'URL così com'è
    } 
    // Altrimenti, se è un percorso relativo (inizia con /)
    else if (avatarUrl.startsWith('/')) {
      breederAvatar = `${apiUrl}${avatarUrl}`; // Aggiungi il prefisso apiUrl
    }
    // Potresti anche gestire percorsi non validi, ma per ora questo copre i casi principali
  }  const formattedPrice = formatPrice(reptile.price);

  return (
    <article
      className="group relative bg-white rounded-2xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
      aria-labelledby={`reptile-${reptile._id}-title`}
    >
      {/* Top breeder badge */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          to={`/shop/breeders/${reptile.user}`} // reptile.user è l'ID
          className="flex items-center gap-3 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-transparent hover:border-amber-300 hover:bg-white hover:shadow-md transition-all duration-200"
          aria-label={reptile.breeder?.name || t('shop.breeder', 'Allevatore')}
        >
          <img
            src={breederAvatar}
            alt={reptile.breeder?.name || ''}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
            loading="lazy"
          />
          <span className="text-xs font-semibold text-stone-800 leading-none">
            {reptile.breeder?.name}
          </span>
        </Link>
      </div>
      
      {/* Image area */}
      <Link
        to={`/public/reptile/${reptile._id}`}
        className="block w-full h-56 md:h-64 bg-stone-100 relative"
        aria-hidden={false}
      >
        <img
          src={imageUrl}
          alt={reptile.name || reptile.species}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
      </Link>

      {/* --- CONTENT AREA (RIORGANIZZATA) --- */}
      {/* Aggiunto flex flex-col flex-grow per spingere la sezione prezzo/bottone in basso */}
      <div className="p-5 md:p-6 flex flex-col flex-grow">
        
        {/* Sezione 1: Info (cresce) */}
        <div className="flex-grow">
          {/* Row 1: Species + Sex */}
          <div className="flex items-start justify-between gap-4 mb-1">
            <h3
              id={`reptile-${reptile._id}-title`}
              className="text-lg md:text-xl font-semibold text-stone-900 truncate"
              title={reptile.species}
            >
              {reptile.species}
            </h3>
            {getSexIcon()}
          </div>
          
          {/* Row 2: Morph */}
          <p className="text-sm text-stone-600 truncate" title={reptile.morph}>
            {reptile.morph || <span className="italic text-stone-400">{t('shop.noMorph', 'N/A')}</span>}
          </p>
                    
          {/* NUOVO: Row 4: Dettagli (Nascita, Pubblicazione, Luogo) */}
          <div className="mt-4 space-y-2.5 text-sm text-stone-600">
            {/* Data di Nascita */}
            <div className="flex items-center gap-2">
              <Cake className="w-4 h-4 text-stone-400 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">
                {t('shop.born', 'Nato il:')} <strong>{formatDate(reptile.birthDate)}</strong>
              </span>
            </div>
            
            {/* Data di Pubblicazione */}
            <div className="flex items-center gap-2">
              <CalendarPlus className="w-4 h-4 text-stone-400 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">
                {t('shop.listed', 'In vendita dal:')} <strong>{formatDate(reptile.createdAt)}</strong>
              </span>
            </div>

            {/* Luogo */}
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-stone-400 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M11.536 21.886a1.5 1.5 0 01-1.072-.439C6.901 18.06 4.5 14.532 4.5 11.25 4.5 7.23 7.73 4 11.75 4s7.25 3.23 7.25 7.25c0 3.282-2.401 6.81-5.964 10.197a1.5 1.5 0 01-1.072.439zm.214-11.636a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-stone-500 truncate" title={reptile.breeder?.address}>
                {reptile.breeder?.address || t('shop.noAddress', 'Indirizzo non disponibile')}
              </p>
            </div>
          </div>
        </div>

        {/* Sezione 2: Azione (in basso) */}
        {/* Layout riorganizzato: Prezzo a sinistra, Bottone a destra */}
        <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-between gap-4">
          
          {/* MODIFICATO: Prezzo (condizionale) */}
          {formattedPrice ? (
            <span
              className="inline-flex text-black items-center px-3 py-1.5 rounded-full text-base font-semibold bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 ring-1 ring-amber-50 shadow-sm"
              aria-label={t('shop.price', 'Prezzo')}
              title={t('shop.price', 'Prezzo')}
            >
              {formattedPrice}
            </span>
          ) : (
            <div /> // Div vuoto per mantenere l'allineamento (justify-between)
          )}

          {/* Pulsante Vedi Dettagli */}
          <Link
            to={`/public/reptile/${reptile._id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-md hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-px transition-all duration-200"
            aria-label={t('shop.viewDetails', 'Vedi dettagli')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t('shop.view', 'Vedi')}
          </Link>
        </div>
        
      </div>
    </article>
  );
};

export default ReptileCardPublic;