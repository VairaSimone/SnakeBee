import { HashLink as Link } from "react-router-hash-link";
import { Facebook, Instagram } from "lucide-react";
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className=" text-[#2B2B2B] px-6 pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between gap-10">

        {/* Brand Section */}
        <div className="text-center md:text-left md:w-1/3">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <img src="/Logo.png" alt="SnakeBee logo" className="h-12" />
            <span className="text-2xl font-extrabold tracking-tight">SnakeBee</span>
          </div>
          <p className="text-sm text-gray-700 max-w-sm mx-auto md:mx-0 leading-relaxed">
            {t('footer.desc')}
          </p>
        </div>

        {/* Links Section */}
        <div className="text-center md:text-left md:w-1/4">
          <h5 className="text-lg font-semibold mb-4">{t('footer.info')}</h5>
          <ul className="space-y-3 text-sm">
            <li>
              <Link 
                to="/home#chi-siamo" 
                className="hover:text-[#228B22] transition-colors duration-300"
              >
                {t('footer.whoWeAre')}
              </Link>
            </li>
            <li>
              <Link 
                to="/home#contatti" 
                className="hover:text-[#228B22] transition-colors duration-300"
              >
                {t('footer.contact')}
              </Link>
            </li>
            <li>
              <Link 
                to="/pricing" 
                className="underline hover:text-[#228B22] transition-colors duration-300"
              >
                {t('navbar.subscription')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Section */}
<div className="text-center md:text-left md:w-1/4 flex flex-col items-center md:items-start gap-3">
  <h5 className="text-lg font-semibold">{t('footer.follow')}</h5>
  <div className="flex gap-6">
    <a href="https://www.facebook.com/people/SnakeBee/61578296802324/" aria-label="Facebook"><Facebook className="w-6 h-6" /></a>
    <a href="https://www.instagram.com/snakebeeofficial/" aria-label="Instagram"><Instagram className="w-6 h-6" /></a>
  </div>
</div>
      </div>

      {/* Legal Info */}
      <div className="mt-12 border-t border-[#d0caba] pt-6 text-center text-xs text-gray-500 space-y-1">
        <p>© 2025 SnakeBee – Simone Vaira</p>
        <p>Sede legale: Via Varaita 10, 10126 Torino (TO), Italia</p>
        <p>P.IVA: 13308020018</p>
        <p>Email: <a href="mailto:support@snakebee.it" className="underline hover:text-[#228B22] transition-colors">support@snakebee.it</a></p>
        <p className="flex flex-wrap justify-center gap-2 mt-1">
          <Link to="/it/terms" className="underline hover:text-[#228B22] transition-colors">{t('terms')}</Link>
          <Link to="/it/privacypolicy" className="underline hover:text-[#228B22] transition-colors">{t('privacypolicy')}</Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
