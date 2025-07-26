import React from "react";
import { HashLink as Link } from "react-router-hash-link";
import { Facebook, Instagram } from "lucide-react"; // oppure usa <i> se resti su FontAwesome

const Footer = () => {
  return (
    <footer className="bg-[#EDE7D6] text-[#2B2B2B] px-6 pt-10 pb-6 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row flex-wrap justify-between gap-10">
        
        {/* Brand e descrizione */}
        <div className="md:w-1/3">
          <div className="flex items-center gap-2 mb-4">
            <img src="/icona.png" alt="SnakeBee logo" className="h-10" />
            <span className="text-xl font-bold tracking-wide">SnakeBee</span>
          </div>
          <p className="text-sm text-gray-700">
            La piattaforma italiana per gestire, monitorare e valorizzare i tuoi rettili. Dai baby ai riproduttori, tutto sotto controllo.
          </p>
        </div>

        {/* Sezione Link Informativi */}
        <div className="md:w-1/4">
          <h5 className="text-lg font-semibold mb-3">Informazioni</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/home#chi-siamo" className="hover:text-[#228B22] transition">Chi siamo</Link></li>
            <li><Link to="/home#contatti" className="hover:text-[#228B22] transition">Contatti</Link></li>
            <a href="https://www.iubenda.com/privacy-policy/71616687" class="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe " title="Privacy Policy ">Privacy Policy</a>
          </ul>
        </div>

        {/* Sezione Servizi */}
        <div className="md:w-1/4">
          <h5 className="text-lg font-semibold mb-3">Servizi</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/home#servizi" className="hover:text-[#228B22] transition">Gestione rettili</Link></li>
            <li><Link to="/home#servizi" className="hover:text-[#228B22] transition">Riproduzione</Link></li>
            <li><Link to="/home#servizi" className="hover:text-[#228B22] transition">Notifiche email</Link></li>
          </ul>
        </div>

        {/* Social */}
        <div className="md:w-1/4">
          <h5 className="text-lg font-semibold mb-3">Seguici</h5>
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

      {/* Linea divisoria */}
      <div className="mt-10 border-t border-[#d0caba] pt-4 text-center text-xs text-gray-600">
        © 2025 SnakeBee. Tutti i diritti riservati.
      </div>
    </footer>
    
  );
  
};

export default Footer;
