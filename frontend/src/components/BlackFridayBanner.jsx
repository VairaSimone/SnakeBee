// src/components/BlackFridayBanner.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Icona di chiusura (X)
const XMarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const BlackFridayBanner = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // --- LOGICA DATE ---
        // 1. Controlla il periodo del Black Friday
        const now = new Date();
        const currentYear = now.getFullYear();
        // Mese 10 = Novembre (0-indexed)
        const startDate = new Date(currentYear, 10, 24); 
        // Mese 11 = Dicembre. Mettiamo il 2 per includere tutto il 1° Dicembre (fino alle 23:59:59)
        const endDate = new Date(currentYear, 11, 2); 

        const isBlackFridayPeriod = now >= startDate && now < endDate;
        
        // --- LOGICA DISMISS ---
        // 2. Controlla se l'utente lo ha già chiuso
        // Usiamo un nome univoco per non sovrapporlo a future promo
        const hasDismissed = localStorage.getItem('bfBannerDismissed_2024'); 

        // 3. Mostra il banner solo se siamo nel periodo E non è stato chiuso
        if (isBlackFridayPeriod && hasDismissed !== 'true') {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        // Salva la scelta dell'utente per questa sessione e future
        localStorage.setItem('bfBannerDismissed_2024', 'true');
    };

    // Se non deve essere visibile, non renderizza nulla
    if (!isVisible) {
        return null;
    }

    // --- RENDER BANNER ---
    return (
        <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-red-700 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-sm leading-6 text-white font-semibold">
                    <strong className="font-extrabold text-yellow-300">🔥 BLACK FRIDAY</strong>
                    {/* Testo visibile solo su schermi grandi */}
                    <span className="hidden sm:inline mx-2">|</span>
                    {/* Testo della promo */}
                    <span className="hidden sm:inline">{t('blackFridayBanner.promoText')}</span>
                </p>
                <Link
                    to="/pricing"
                    onClick={handleDismiss} // Chiudiamo il banner anche quando l'utente clicca
                    className="flex-none rounded-full bg-yellow-400 px-3.5 py-1 text-sm font-semibold text-gray-900 shadow-sm hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 transition-colors"
                >
                    {t('blackFridayBanner.ctaButton')}
                </Link>
            </div>
            <div className="flex flex-1 justify-end">
                <button type="button" className="-m-3 p-3 focus-visible:outline-offset-[-4px] text-white hover:text-yellow-300" onClick={handleDismiss}>
                    <span className="sr-only">Dismiss</span>
                    <XMarkIcon />
                </button>
            </div>
        </div>
    );
};

export default BlackFridayBanner;