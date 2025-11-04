// src/components/BreederCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// MODIFICATO: Import da heroicons e react-icons
import { MapPinIcon, ShieldCheckIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { FaFacebook, FaInstagram } from 'react-icons/fa';

// Creiamo un componente 'MotionLink' per animare il Link di react-router
const MotionLink = motion(Link);

/**
 * Varianti di animazione per Framer Motion.
 */
const cardVariants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  hover: {
    scale: 1.03,
    y: -4, // Leggero sollevamento
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

const BreederCard = ({ breeder }) => {
  // Assumiamo che breeder.avatar sia un URL completo
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

  // MODIFICATO: Logica badge corretta in base allo schema User
  const getPlanBadgeClasses = (plan) => {
    const safePlan = plan ? plan.toLowerCase() : 'neophyte';
    switch (safePlan) {
      case 'breeder':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'practitioner':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'apprentice':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'neophyte':
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  /**
   * Impedisce al link genitore (la card) di attivarsi
   * quando si fa clic su un link social.
   */
  const handleSocialClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(e.currentTarget.href, '_blank', 'noopener,noreferrer');
  };

  return (
    <MotionLink
      to={`/shop/breeders/${breeder._id}`}
      className="group block" // 'group' è fondamentale per gli hover interni
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      animate="rest"
      layout
    >
      {/* Contenitore principale della card 
        MODIFICATO: flex-col per separare info e footer
      */}
      <div className="flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-neutral-200/80">
        
        {/* Sezione 1: Info Principali */}
        <div className="flex items-start space-x-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={avatarUrl}
              alt={breeder.name}
              className="h-16 w-16 rounded-full object-cover shadow-md"
            />
            {/* Anello di "glow" sull'avatar in hover */}
            <div className="absolute inset-0 rounded-full ring-2 ring-amber-400 ring-offset-2 ring-offset-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>

          {/* Contenuto Testuale */}
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            
            {/* Nome Allevatore + Badge Verificato */}
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-neutral-800 transition-colors duration-300 group-hover:text-amber-700" title={breeder.name}>
                {breeder.name}
              </h3>
            </div>

            {/* Indirizzo (se presente) */}
            {breeder.address && (
              <div className="mt-1 flex items-center text-sm text-neutral-500">
                <MapPinIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
                <span className="truncate">{breeder.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sezione 2: Footer Card (Piano + Social)
          NUOVO: Layout separato per il footer
        */}
        <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
          {/* Badge Piano di Sottoscrizione */}
          <span
            className={`text-black inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium ${getPlanBadgeClasses(
              breeder.subscription?.plan // Accesso sicuro
            )}`}
          >
            <ShieldCheckIcon className="mr-1 h-3.5 w-3.5 opacity-80" />
            {breeder.subscription?.plan || 'NEOPHYTE'}
          </span>

          {/* NUOVO: Icone Social */}
          <div className="flex items-center space-x-3">
            {breeder.socials?.facebook && (
              <a 
                href={breeder.socials.facebook} 
                onClick={handleSocialClick}
                className="text-black text-neutral-400 hover:text-blue-700 transition-colors"
                title="Facebook"
              >
                <FaFacebook className="h-5 w-5" />
              </a>
            )}
            {breeder.socials?.instagram && (
              <a 
                href={breeder.socials.instagram} 
                onClick={handleSocialClick}
                className="text-black text-neutral-400 hover:text-pink-600 transition-colors"
                title="Instagram"
              >
                <FaInstagram className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </MotionLink>
  );
};

export default BreederCard;