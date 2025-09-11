import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useSelector } from "react-redux";
import { selectUser, selectLanguage } from "../features/userSlice";
import { useTranslation } from "react-i18next";

const NewsletterBanner = () => {
  const user = useSelector(selectUser);
  const language = useSelector(selectLanguage);
  const { t } = useTranslation();

  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkNewsletter = async () => {
      const alreadyDismissed = localStorage.getItem("newsletterDismissed");
      if (alreadyDismissed) return;

      if (user?.email) {
        // utente loggato: verifica iscrizione
        try {
          const res = await api.get("/newsletter/check", { params: { email: user.email } });
          if (!res.data.subscribed) setVisible(true);
        } catch (err) {
          console.error("Errore controllo newsletter:", err);
          // fallback: mostra comunque banner
          setVisible(true);
        }
      } else {
        // utente non loggato: probabilità casuale
        if (Math.random() < 0.6) setVisible(true);
      }
    };

    checkNewsletter();
  }, [user]);

  const handleSubscribe = async () => {
    try {
      const res = await api.post("/newsletter/subscribe", { email, language });
      setMessage(res.data.message);
      localStorage.setItem("newsletterDismissed", "true");
      setVisible(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Errore");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-xl p-5 rounded-2xl w-80 border border-gray-200 z-50">
      <button
        onClick={() => {
          localStorage.setItem("newsletterDismissed", "true");
          setVisible(false);
        }}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-900 transition"
        aria-label="Chiudi"
      >
        ✕
      </button>

      <h3 className="text-lg font-bold mb-2 text-gray-900">
        {t("newsletter.title", "Unisciti alla newsletter!")}
      </h3>
      <p className="text-sm mb-3 text-gray-800">
        {t("newsletter.desc", "Ricevi aggiornamenti e novità su SnakeBee.")}
      </p>
      <input
        type="email"
        className="w-full text-black p-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder={t("newsletter.placeholder", "La tua email")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        onClick={handleSubscribe}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition"
      >
        {t("newsletter.subscribe", "Iscriviti")}
      </button>
      {message && <p className="text-xs mt-2 text-gray-700">{message}</p>}
    </div>
  );
};

export default NewsletterBanner;
