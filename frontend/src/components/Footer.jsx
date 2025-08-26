import { HashLink as Link } from "react-router-hash-link";
import { Facebook, Instagram } from "lucide-react";
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#EDE7D6] text-[#2B2B2B] px-6 pt-10 pb-6 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between md:gap-10">

        {/* Brand and description */}
        <div className="text-center md:text-left md:w-1/3">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <img src="/icona.png" alt="SnakeBee logo" className="h-10" />
            <span className="text-xl font-bold tracking-wide">SnakeBee</span>
          </div>
          <p className="text-sm text-gray-700 max-w-sm mx-auto md:mx-0">
            {t('footer.desc')}
          </p>
        </div>

        {/* Information Links Section */}
        <div className="text-center md:text-left md:w-1/4">
          <h5 className="text-base font-semibold mb-3">{t('footer.info')}</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/home#chi-siamo" className="hover:text-[#228B22] transition">{t('footer.whoWeAre')}</Link></li>
            <li><Link to="/home#contatti" className="hover:text-[#228B22] transition">{t('footer.contact')}</Link></li>
            <li>
              <a href="https://www.iubenda.com/privacy-policy/71616687"
                 className="hover:text-[#228B22] transition">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Services Section */}
        <div className="text-center md:text-left md:w-1/4">
          <h5 className="text-base font-semibold mb-3">{t('footer.services')}</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/home#servizi" className="hover:text-[#228B22] transition">{t('footer.reptile')}</Link></li>
            <li><Link to="/home#servizi" className="hover:text-[#228B22] transition">{t('footer.breeding')}</Link></li>
            <li><Link to="/home#servizi" className="hover:text-[#228B22] transition">{t('footer.notifications')}</Link></li>
          </ul>
        </div>

        {/* Social */}
        <div className="text-center md:text-left md:w-1/4">
          <h5 className="text-base font-semibold mb-3">{t('footer.follow')}</h5>
          <div className="flex justify-center md:justify-start gap-6">
            <a href="https://www.facebook.com/profile.php?id=61578296802324" aria-label="Facebook" className="hover:text-[#228B22] transition">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="https://www.instagram.com/snakebeeofficial/" aria-label="Instagram" className="hover:text-[#228B22] transition">
              <Instagram className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-[#d0caba] pt-4 text-center text-xs text-gray-600">
        {t('footer.copyright')}
      </div>
    </footer>
  );
};

export default Footer;
