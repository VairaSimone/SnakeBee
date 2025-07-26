import React, { useState, useEffect } from 'react';

const messages = [
  "Fai felice un appassionato di rettili.. Offrigli un caffè (digitale) ☕",
  "Sostieni il progetto... o il serpente piange 🐍😭",
  "Fai la tua buona azione digitale del giorno →",
  "Non ci sono pubblicità, solo rettili. Aiutaci a tenerla così!",
  "Questa app è gratuita, ma l'amore per questo settore ha bisogno di carburante 💾⛽",
  "Sostieni SnakeBee e sblocca... il nostro eterno affetto 💘",
  "Ti è piaciuto SnakeBee? Offri un topo al serpente 🐍",
  "Donare è il nuovo scrollare. Provalo, è terapeutico.",
  "SnakeBee non vende i tuoi dati. Ma accetta volentieri PayPal.",
  "Questo sito funziona grazie a: magia, caffè e il tuo supporto.",
  "I draghi non esistono... ma SnakeBee sì. E ha bisogno di te 🐉",
  "I rettili a sangue freddo, noi col cuore caldo. Dona! 🔥",
  "Anche i rettili hanno bisogno d'amore. E anche questo sito 💘",
  "Noi ci mettiamo le zampette (e le squame), tu mettici il cuore 💚",

];

const DonationBanner = () => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Se già chiuso, non mostrare
    if (sessionStorage.getItem('hideDonationBanner')) return;

    // Mostra con una probabilità del 50%
    const shouldShow = Math.random() < 0.5;
    if (shouldShow) {
      // Scegli un messaggio casuale
      const randomIndex = Math.floor(Math.random() * messages.length);
      setMessage(messages[randomIndex]);
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem('hideDonationBanner', 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 text-yellow-900 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">Supporta il progetto SnakeBee 💚</p>
          <p className="text-xs mt-1">{message}</p>
          <a
            href="https://www.paypal.com/donate/?hosted_button_id=8NYR4QZZ3QGBS"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm text-blue-600 hover:underline"
          >
            Dona con PayPal
          </a>
        </div>
        <button onClick={handleClose} className="ml-4 text-sm text-yellow-700 hover:text-yellow-900">
          ✕
        </button>
      </div>

      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 0.6s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default DonationBanner;
