import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  FaBell, FaBars, FaTimes, FaRegNewspaper, FaBullhorn, FaShoppingBag, 
  FaChartLine, FaWrench, FaBoxOpen, FaDna, FaCalendarAlt, FaFileAlt, 
  FaUser, FaCreditCard, FaBox, FaCogs, FaStore, FaSignOutAlt, FaSignInAlt, FaUserPlus,
  FaLock 
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectUser } from '../features/userSlice';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { MARKET_URL } from '../utils/marketData';
import WorkspaceSelector from './WorkspaceSelector';

// --- HELPERS AGGIORNATI CON GESTIONE LOCK ---
const NavItem = ({ to, icon: Icon, label, onClick, isLocked }) => (
  <NavLink
    to={isLocked ? "/pricing" : to}
    onClick={(e) => {
      if (isLocked) {
        // Gestione click bloccato
      } else if (onClick) {
        onClick(e);
      }
    }}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 transition-colors duration-200 ${
        isLocked 
          ? 'text-gray-400 cursor-not-allowed opacity-70' 
          : isActive ? 'text-[#228B22] font-semibold hover:text-[#228B22]' : 'text-[#2B2B2B] hover:text-[#228B22]'
      }`
    }
  >
    {Icon && <Icon className="text-lg" />}
    <span>{label}</span>
    {isLocked && <FaLock className="text-xs text-gray-400 ml-auto" />}
  </NavLink>
);

const DropdownItem = ({ to, icon: Icon, label, onClick, colorClass = "text-gray-700", isLocked }) => {
  return (
    <Link
      to={isLocked ? "/pricing" : to}
      onClick={(e) => {
        if (isLocked) {
          if (onClick) onClick();
        } else if (onClick) {
          onClick();
        }
      }}
      className={`flex items-center gap-3 px-4 py-2 transition-colors ${
        isLocked 
          ? 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-70' 
          : `hover:bg-gray-100 ${colorClass}`
      }`}
    >
      {Icon && <Icon className="text-base shrink-0" />}
      <span className="text-sm whitespace-nowrap flex-1">{label}</span>
      {isLocked && <FaLock className="text-xs text-gray-400" />}
    </Link>
  );
};

const MobileLink = ({ to, icon: Icon, label, onClick, colorClass = "text-gray-800", isLocked }) => (
  <Link 
    to={isLocked ? "/pricing" : to} 
    onClick={onClick} 
    className={`flex items-center gap-4 px-6 py-3 transition-colors ${
      isLocked 
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70' 
        : `hover:bg-[#E5DCC3] ${colorClass}`
    }`}
  >
    {Icon && <Icon className="text-lg shrink-0" />}
    <span className="font-medium flex-1">{label}</span>
    {isLocked && <FaLock className="text-xs text-gray-400" />}
  </Link>
);

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [strumentiOpen, setStrumentiOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const avatarMenuRef = useRef();
  const strumentiRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) setAvatarMenuOpen(false);
      if (strumentiRef.current && !strumentiRef.current.contains(e.target)) setStrumentiOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPlan = user?.subscription?.plan?.toUpperCase() || 'NEOPHYTE'; 
  const isSubscribed = user?.subscription?.status === 'active' || user?.subscription?.status === 'processing' || user?.subscription?.status === 'pending_cancellation';
  const effectivePlan = isSubscribed ? currentPlan : 'NEOPHYTE';

  const canAccessPractitioner = effectivePlan === 'PRACTITIONER' || effectivePlan === 'BREEDER';
  const canAccessBreeder = effectivePlan === 'BREEDER';

  const getAvatarUrl = () => {
    if (!user?.avatar?.trim()) {
      return '/default-avatar.png';
    }
    if (/^https?:\/\//.test(user.avatar)) {
      return user.avatar;
    }
    return process.env.REACT_APP_BACKEND_URL_IMAGE + user.avatar;
  };

  const handleLogout = async () => {
    try {
      await api.post('/v1/logout', null, { withCredentials: true });
      dispatch(logoutUser());
      localStorage.clear();
      setAvatarMenuOpen(false);
      navigate('/login');
    } catch (err) {}
  };

  return (
    <nav className="bg-[#FAF3E0] text-[#2B2B2B] shadow-sm sticky w-full z-50 top-0 border-b border-[#E5DCC3]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/Logo.png" alt="SnakeBee" className="h-9 w-auto" />
          <span className="text-2xl font-bold text-[#4A5D23] font-serif">SnakeBee</span>
        </Link>

        {/* --- DESKTOP NAVIGATION --- */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-4">
          <NavItem to="/blog" icon={FaRegNewspaper} label={t('navbar.blog', 'Blog')} />
          <NavItem to="/shop" icon={FaBullhorn} label={t('navbar.shop', 'Annunci')} />

          {user ? (
            <>
              <NavItem to="/dashboard" icon={FaChartLine} label={t('navbar.dashboard', 'Dashboard')} />
              <div className="relative" ref={strumentiRef}>
                <button 
                  onClick={() => setStrumentiOpen(!strumentiOpen)}
                  className="flex items-center gap-2 px-3 py-2 hover:text-[#228B22] transition-colors"
                >
                  <FaWrench /> <span>{t('navbar.tools', 'Strumenti')}</span>
                  <svg className={`w-4 h-4 transition-transform ${strumentiOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {strumentiOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-xl py-2 z-50">
                    <DropdownItem to="/inventory" icon={FaBoxOpen} label={t('navbar.inventory', 'Inventario')} isLocked={!canAccessPractitioner} onClick={() => setStrumentiOpen(false)} />
                    <DropdownItem to="/breeding" icon={FaDna} label={t('navbar.breeding', 'Riproduzione')} isLocked={!canAccessPractitioner} onClick={() => setStrumentiOpen(false)} />
                    <DropdownItem to="/cites" icon={FaFileAlt} label={t('navbar.citesGeneration', 'Generazione Cites')} isLocked={false} onClick={() => setStrumentiOpen(false)} />
                    <DropdownItem to="/finance" icon={FaFileAlt} label={t('navbar.costCalculator', 'Calcolatore costi')} isLocked={!canAccessBreeder} onClick={() => setStrumentiOpen(false)} />
                    <DropdownItem to="/genetic" icon={FaFileAlt} label={t('navbar.morphCalculator', 'Calcolatore morph')} isLocked={!canAccessBreeder} onClick={() => setStrumentiOpen(false)} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <NavItem to="/pricing" icon={FaCreditCard} label={t('navbar.subscription', 'Abbonamento')} />
          )}
        </div>

        {/* --- USER ACTIONS --- */}
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              {/* WORKSPACE SELECTOR - DESKTOP */}
              <div className="hidden lg:block border-r border-[#E5DCC3] pr-4 mr-2">
                <WorkspaceSelector className="ml-0" />
              </div>
              <div className="hidden lg:block relative" ref={avatarMenuRef}>
                <button onClick={() => setAvatarMenuOpen(!avatarMenuOpen)} className="flex items-center">
                  <img 
                    src={getAvatarUrl()} 
                    onError={(e) => { e.target.src = '/default-avatar.png'; }}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm hover:border-[#228B22] transition-all object-cover" 
                    alt="User" 
                  />
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {avatarMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-xl py-2 z-50">
                    <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{t('navbar.yourAccount', 'Il tuo Account')}</div>
                    <DropdownItem to="/profile" icon={FaUser} label={t('navbar.profile', 'Profilo')} onClick={() => setAvatarMenuOpen(false)} />
                    <DropdownItem to="/pricing" icon={FaCreditCard} label={t('navbar.subscription', 'Abbonamento')} onClick={() => setAvatarMenuOpen(false)} />
                    
                    {user?.role === 'admin' && (
                      <>
                        <div className="border-t my-2"></div>
                        <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{t('navbar.administration', 'Amministrazione')}</div>
                        <DropdownItem to="/admin/blog" icon={FaCogs} label={t('navbar.admin', 'Pannello Admin')} colorClass="text-red-700" onClick={() => setAvatarMenuOpen(false)} />
                      </>
                    )}

                    <div className="border-t my-2"></div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <FaSignOutAlt className="text-base shrink-0" />
                      <span>{t('navbar.logout', 'Esci')}</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-semibold hover:text-[#228B22] transition-colors flex items-center gap-2">
                <FaSignInAlt /> {t('navbar.login', 'Accedi')}
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-bold bg-[#228B22] text-white rounded-md hover:bg-[#1a6b1a] transition-colors flex items-center gap-2">
                <FaUserPlus /> {t('navbar.register', 'Registrati')}
              </Link>
            </div>
          )}

          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-2xl">
            <FaBars />
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      <div className={`fixed inset-0 z-[100] transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`}>
        <div className="absolute inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
        <div className="absolute right-0 top-0 h-full w-[280px] bg-[#FAF3E0] shadow-2xl flex flex-col">
          <div className="p-4 flex justify-between items-center border-b border-[#E5DCC3]">
            {user ? (
              <div className="flex items-center gap-3">
                <img 
                  src={getAvatarUrl()} 
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                  className="w-10 h-10 rounded-full border border-[#228B22] object-cover" 
                  alt="User" 
                />
                <span className="font-bold text-gray-800 text-sm truncate max-w-[120px]">{user.username || t('navbar.profile', 'Profilo')}</span>
              </div>
            ) : (
              <span className="font-bold text-lg">{t('navbar.menu', 'Menu')}</span>
            )}
            <button onClick={() => setMobileMenuOpen(false)} className="text-2xl p-1"><FaTimes /></button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <MobileLink to="/blog" icon={FaRegNewspaper} label={t('navbar.blog', 'Blog')} onClick={() => setMobileMenuOpen(false)} />
            <MobileLink to="/shop" icon={FaBullhorn} label={t('navbar.shop', 'Annunci')} onClick={() => setMobileMenuOpen(false)} />

            {user ? (
              <>
                <div className="h-px bg-gray-300 my-4 mx-4"></div>
                <div className="px-6 mb-4">
                  <WorkspaceSelector className="w-full bg-[#E5DCC3] p-2 rounded-lg" />
                </div>
                <div className="px-6 mb-2 text-xs font-bold text-gray-500 uppercase">{t('navbar.panelSection', 'Pannello')}</div>
                <MobileLink to="/dashboard" icon={FaChartLine} label={t('navbar.dashboard', 'Dashboard')} onClick={() => setMobileMenuOpen(false)} />
                
                <div className="h-px bg-gray-300 my-4 mx-4"></div>
                <div className="px-6 mb-2 text-xs font-bold text-gray-500 uppercase">{t('navbar.toolsSection', 'Strumenti')}</div>
                <MobileLink to="/inventory" icon={FaBoxOpen} label={t('navbar.inventory', 'Inventario')} isLocked={!canAccessPractitioner} onClick={() => setMobileMenuOpen(false)} />
                <MobileLink to="/breeding" icon={FaDna} label={t('navbar.breeding', 'Riproduzione')} isLocked={!canAccessPractitioner} onClick={() => setMobileMenuOpen(false)} />
                <MobileLink to="/cites" icon={FaFileAlt} label={t('navbar.citesGeneration', 'Generazione Cites')} isLocked={false} onClick={() => setMobileMenuOpen(false)} />
                <MobileLink to="/finance" icon={FaFileAlt} label={t('navbar.costCalculator', 'Calcolatore Costi')} isLocked={!canAccessBreeder} onClick={() => setMobileMenuOpen(false)} />
                <MobileLink to="/genetic" icon={FaFileAlt} label={t('navbar.morphCalculator', 'Calcolatore morph')} isLocked={!canAccessBreeder} onClick={() => setMobileMenuOpen(false)} />

                <div className="h-px bg-gray-300 my-4 mx-4"></div>
                <div className="px-6 mb-2 text-xs font-bold text-gray-500 uppercase">{t('navbar.userSection', 'Utente')}</div>
                <MobileLink to="/profile" icon={FaUser} label={t('navbar.profile', 'Profilo')} onClick={() => setMobileMenuOpen(false)} />
                <MobileLink to="/pricing" icon={FaCreditCard} label={t('navbar.subscription', 'Abbonamento')} onClick={() => setMobileMenuOpen(false)} />

                <div className="mt-8 px-4">
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg font-semibold">
                    <FaSignOutAlt /> {t('navbar.logout', 'Esci')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="h-px bg-gray-300 my-4 mx-4"></div>
                <div className="px-6 mb-4">
                  <MobileLink to="/pricing" icon={FaCreditCard} label={t('navbar.subscription', 'Abbonamento')} onClick={() => setMobileMenuOpen(false)} />
                </div>
                <div className="mt-8 px-4 flex flex-col gap-3">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-3 w-full px-4 py-3 border-2 border-[#228B22] text-[#228B22] rounded-lg font-bold">
                    <FaSignInAlt /> {t('navbar.login', 'Accedi')}
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-[#228B22] text-white rounded-lg font-bold">
                    <FaUserPlus /> {t('navbar.register', 'Registrati')}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;