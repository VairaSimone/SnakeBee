import React from 'react';
import { useTranslation } from 'react-i18next';
import { MARKET_KITS, MARKET_URL } from '../utils/marketData';
// Assicurati che il percorso dell'immagine sia corretto in base alla tua struttura cartelle
import MarketLogo from '../utils/snakebee-market-logo.png'; 

const MarketPromoSection = () => {
  const { t } = useTranslation();

  // Prendiamo solo i primi 3 kit per la preview
  const previewKits = MARKET_KITS.slice(0, 3);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-amber-50 relative overflow-hidden">
      
      {/* Elementi decorativi di sfondo (Blob sfocati) */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
          
          {/* Lato Testo e Logo */}
          <div className="md:w-1/2 text-center md:text-left">
            <img 
              src={MarketLogo} 
              alt="Snakebee Market" 
              className="h-24 md:h-32 mx-auto md:mx-0 mb-8 object-contain drop-shadow-sm transition-transform hover:scale-105 duration-500"
            />
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-gray-900 tracking-tight">
              {t('market.promo_title')}
            </h2>
            <p className="text-gray-600 text-lg md:text-xl mb-10 leading-relaxed max-w-lg mx-auto md:mx-0">
              {t('market.promo_subtitle')}
            </p>
            <a 
              href={MARKET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-lg bg-green-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-200 hover:shadow-amber-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              {t('market.cta_button')}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>

          {/* Lato Cards Kit (Preview) */}
          <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {previewKits.map((kit) => (
              <div key={kit.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-md hover:shadow-xl hover:border-amber-200 transition-all duration-300 group flex flex-col justify-between h-full">
                <div>
                  <div className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-2 bg-amber-50 inline-block px-2 py-1 rounded-md">
                    {kit.category}
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors">
                    {kit.name}
                  </h3>
                </div>
                
                <div className="flex justify-between items-end mt-4 border-t border-gray-100 pt-3">
                  <div className="text-gray-500 text-sm font-medium">
                    {kit.features.length} articoli
                  </div>
                  <div className="text-xl font-extrabold text-gray-900 bg-gray-50 px-2 py-1 rounded-lg">
                    {kit.price.toFixed(2)} €
                  </div>
                </div>
              </div>
            ))}
            
            {/* Card "Vedi tutti" */}
            <a 
              href={MARKET_URL} 
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center bg-amber-50 border-2 border-dashed border-amber-200 rounded-2xl p-4 hover:bg-amber-100 hover:border-amber-400 transition-all cursor-pointer group h-full"
            >
                <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🛍️</span>
                </div>
                <span className="text-amber-800 font-bold text-lg group-hover:text-amber-900">
                    Vedi tutti i Kit
                </span>
                <span className="text-green-600 text-sm mt-1">Vai allo shop &rarr;</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MarketPromoSection;