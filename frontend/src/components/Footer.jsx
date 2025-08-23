import { HashLink as Link } from "react-router-hash-link";
import { Facebook, Instagram } from "lucide-react";
import { useTranslation } from 'react-i18next';

const Footer = () => {
      const { t } = useTranslation();

  return (
    <footer className="bg-[#EDE7D6] text-[#2B2B2B] px-6 pt-10 pb-6 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row flex-wrap justify-between gap-10">

        {/* Brand and description */}
        <div className="md:w-1/3">
          <div className="flex items-center gap-2 mb-4">
            <img src="/icona.png" alt="SnakeBee logo" className="h-10" />
            <span className="text-xl font-bold tracking-wide">SnakeBee</span>
          </div>
          <p className="text-sm text-gray-700">
            {t('footer.desc')}
          </p>
        </div>

        {/* Information Links Section */}
        <div className="md:w-1/4">
          <h5 className="text-lg font-semibold mb-3">{t('footer.info')}</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/home#chi-siamo" className="hover:text-[#228B22] transition">{t('footer.whoWeAre')}</Link></li>
            <li><Link to="/home#contatti" className="hover:text-[#228B22] transition">{t('footer.contact')}</Link></li>
            <a href="https://www.iubenda.com/privacy-policy/71616687" className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe " title="Privacy Policy ">Privacy Policy</a>
          </ul>
        </div>

        {/* Services Section */}
        <div className="md:w-1/4">
          <h5 className="text-lg font-semibold mb-3">{t('footer.services')}</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/home#servizi" className="hover:text-[#228B22] transition">{t('footer.reptile')}</Link></li>
            <li><Link to="/home#servizi" className="hover:text-[#228B22] transition">{t('footer.breeding')}</Link></li>
            <li><Link to="/home#servizi" className="hover:text-[#228B22] transition">{t('footer.notifications')}</Link></li>
          </ul>
        </div>

        {/* Social */}
        <div className="md:w-1/4">
          <h5 className="text-lg font-semibold mb-3">{t('footer.follow')}</h5>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/profile.php?id=61578296802324" aria-label="Facebook" className="hover:text-[#228B22] transition">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/snakebeeofficial/" aria-label="Instagram" className="hover:text-[#228B22] transition">
              <Instagram className="w-5 h-5" />
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
