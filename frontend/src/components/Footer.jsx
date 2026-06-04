import React, { useState } from 'react';
import { HashLink as Link } from "react-router-hash-link";
import { 
  FaShoppingCart, FaBullhorn, FaRegNewspaper, FaChartLine, 
  FaCreditCard, FaEnvelope, FaQuestionCircle, FaBook, 
  FaInfoCircle, FaFacebookF, FaInstagram, FaYoutube 
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from "../services/api";
import { useSelector } from "react-redux";
import { selectUser, selectLanguage } from "../features/userSlice";

const Footer = () => {
  const { t } = useTranslation();
  
  const user = useSelector(selectUser);
  const language = useSelector(selectLanguage);
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await api.post("/newsletter/subscribe", { email, language });
      setMessage(res.data.message);
      if (!user) setEmail(""); 
    } catch (err) {
      setMessage(err.response?.data?.message || t("footer.newsletter.error", "Errore"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#FAF3E0] text-[#2B2B2B] pt-16 pb-6 border-t border-[#E5DCC3] mt-16">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* 1. BRAND */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-4">
              <img src="/Logo.png" alt="SnakeBee" className="h-10 w-auto" />
              <span className="text-2xl font-bold font-serif">SnakeBee</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-700 text-center md:text-left">
              {t("footer.desc", "La tua piattaforma completa per l'allevamento di rettili. Monitoraggio e valorizzazione professionali.")}
            </p>
          </div>

          {/* 2. ESPLORA */}
          <div className="flex flex-col items-center md:items-start">
            <h5 className="font-bold text-sm uppercase tracking-wider mb-5">{t("footer.explore", "Esplora")}</h5>
            <ul className="space-y-4">
              <FooterLink to="/shop" icon={FaBullhorn} label={t("navbar.shop", "Annunci")} />
              <FooterLink to="/blog" icon={FaRegNewspaper} label={t("navbar.blog", "Blog")} />
              <FooterLink to="/dashboard" icon={FaChartLine} label={t("navbar.dashboard", "Dashboard")} />
              <FooterLink to="/pricing" icon={FaCreditCard} label={t("navbar.subscription", "Abbonamento")} />
            </ul>
          </div>

          {/* 3. SUPPORTO */}
          <div className="flex flex-col items-center md:items-start">
            <h5 className="font-bold text-sm uppercase tracking-wider mb-5">{t("footer.info", "Supporto & Risorse")}</h5>
            <ul className="space-y-4">
              <FooterLink to="/home#contatti" icon={FaEnvelope} label={t("footer.contact", "Contatti")} />
              <FooterLink to="/home#faq" icon={FaQuestionCircle} label={t("footer.faq", "FAQ (Domande Frequenti)")} />
              <FooterLink to="/home#chi-siamo" icon={FaInfoCircle} label={t("footer.whoWeAre", "Chi Siamo")} />
            </ul>
          </div>

          {/* 4. NEWSLETTER */}
          <div className="flex flex-col items-center md:items-start">
            <h5 className="font-bold text-sm uppercase tracking-wider mb-5">{t("footer.follow", "Resta Connesso")}</h5>
            <p className="text-xs mb-3 text-gray-600 text-center md:text-left">
              {t("footer.newsletter.prompt", "Iscriviti alla nostra Newsletter per aggiornamenti esclusivi.")}
            </p>
            
            <div className="flex w-full max-w-[260px]"> 
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("footer.newsletter.placeholder", "La tua email")} 
                className="flex-1 bg-white border border-gray-300 px-3 py-1.5 text-xs rounded-l focus:outline-none focus:border-[#228B22] text-black"
              />
              <button 
                onClick={handleSubscribe}
                disabled={loading}
                className="bg-white border border-gray-300 border-l-0 px-3 py-1.5 text-xs font-bold hover:bg-gray-50 transition-colors rounded-r disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? "..." : t("footer.newsletter.subscribeBtn", "Iscriviti")}
              </button>
            </div>
            
            {message && (
              <p className={`text-[10px] mt-2 font-semibold ${message.includes("Errore") || message.includes("Error") ? "text-red-600" : "text-[#228B22]"}`}>
                {message}
              </p>
            )}

            <div className="flex gap-4 mt-6">
              <SocialIcon href="https://www.facebook.com/profile.php?id=61578296802324" icon={FaFacebookF} />
              <SocialIcon href="https://www.instagram.com/snakebeeofficial/" icon={FaInstagram} />
            </div>
          </div>

        </div>

        {/* --- PAYMENTS & LEGAL --- */}
        <div className="border-t border-[#E5DCC3] py-6 flex justify-center lg:justify-end gap-4 opacity-60">
           <img src="/visa.png" alt="Visa" className="h-5" />
           <img src="/mastercard.png" alt="Mastercard" className="h-5" />
           <img src="/paypal.png" alt="Paypal" className="h-5" />
           <img src="/stripe.png" alt="Stripe" className="h-5" />
        </div>

        <div className="border-t border-[#E5DCC3] pt-6 flex flex-col lg:flex-row justify-between items-center text-[11px] text-gray-500 gap-4 text-center lg:text-left">
          <div>
            {t("footer.legalCopyright", "© 2025 SnakeBee – Simone Vaira | Sede: Via Varaita 10, Torino (TO) | P.IVA: 13308020018")} | 
            <a href="mailto:support@snakebee.it" className="ml-1 hover:text-[#228B22]">support@snakebee.it</a>
          </div>
          
          <div className="flex gap-4">
            <Link to={t("footer.legal.termsUrl", "/en/terms")} className="hover:underline hover:text-[#228B22]">{t("footer.legal.terms", "Termini e condizioni generali")}</Link>
            <span>|</span>
            <Link to={t("footer.legal.privacyUrl", "/en/privacypolicy")} className="hover:underline hover:text-[#228B22]">{t("footer.legal.privacy", "Politica sulla riservatezza")}</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

// --- HELPERS ---
const FooterLink = ({ to, icon: Icon, label }) => (
  <li>
    <Link to={to} className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#228B22] transition-colors group">
      <Icon className="text-base text-gray-500 group-hover:text-[#228B22] transition-colors" />
      <span>{label}</span>
    </Link>
  </li>
);

const SocialIcon = ({ href, icon: Icon }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center text-gray-600 hover:border-[#228B22] hover:text-[#228B22] transition-all"
  >
    <Icon className="text-sm" />
  </a>
);

export default Footer;