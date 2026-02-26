import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaBell, FaBars, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectUser } from '../features/userSlice';
import api from '../services/api';
import Notifications from './Notifications';
import { useTranslation } from 'react-i18next';
import { MARKET_URL } from '../utils/marketData';

// --- COMPONENTE HELPER PER I LINK DESKTOP ---
const StyledNavLink = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `hover:text-[#228B22] transition whitespace-nowrap ${
        isActive
          ? 'text-[#228B22] underline underline-offset-4 font-semibold'
          : ''
      }`
    }
  >
    {children}
  </NavLink>
);

// --- COMPONENTE HELPER PER I LINK MOBILE ---
const StyledMobileLink = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className="block px-4 py-2 rounded hover:bg-[#E0D8C3] transition"
  >
    {children}
  </NavLink>
);

// --- COMPONENTE HELPER PER I LINK DEL DROPDOWN AVATAR ---
const AvatarDropdownLink = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className="block w-full text-left px-4 py-2 hover:bg-[#F1F1F1] whitespace-nowrap"
  >
    {children}
  </NavLink>
);

// --- COMPONENTE PULSANTE MARKET ---
const MarketButton = ({ mobile = false }) => (
  <a
    href={MARKET_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={`${
      mobile ? 'block w-full text-left px-4' : 'px-4 whitespace-nowrap'
    } py-2 rounded-md font-semibold text-black bg-amber-600 hover:bg-amber-500 transition-colors duration-200 flex items-center gap-2`}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
    <span>Market</span>
  </a>
);

const Navbar = () => {
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const avatarMenuRef = useRef();
  const notificationsRef = useRef();

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
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) { }
  };

  const fetchNotificationsCount = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications/unread/count');
      setNotificationsCount(data.unreadCount);
    } catch (err) { }
  };

  useEffect(() => {
    fetchNotificationsCount();
    const interval = setInterval(fetchNotificationsCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setAvatarMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target) && !e.target.closest('.notification-bell-button')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const commonLinks = [
    { to: '/blog', label: t('navbar.blog') },
    { to: '/shop', label: t('navbar.shop', 'Shop') },
  ];

  const guestLinks = [
    { to: '/login', label: t('navbar.login') },
    { to: '/register', label: t('navbar.register') },
    { to: '/pricing', label: t('navbar.subscription') },
  ];

  const userNavLinks = [
    { to: '/dashboard', label: t('navbar.dashboard') },
    { to: '/breeding', label: t('navbar.breeding') },
    { to: '/inventory', label: t('navbar.inventory') },
  ];

  const userDropdownLinks = [
    { to: '/profile', label: t('navbar.profile') },
    { to: '/pricing', label: t('navbar.subscription') },
  ];

  return (
    <nav className="bg-[#FAF3E0] text-[#2B2B2B] shadow-md sticky w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* LOGO - Aggiunto shrink-0 e whitespace-nowrap */}
        <Link to="/" className="text-xl font-bold text-[#228B22] flex items-center gap-2 shrink-0 whitespace-nowrap">
          <img src="/Logo.png" alt="SnakeBee" className="h-8" />
          SnakeBee
        </Link>

        {/* Mobile menu toggle - Cambiato da sm:hidden a lg:hidden */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-2xl p-2 focus:outline-none"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* --- 💻 Desktop Menu - Cambiato da sm:flex a lg:flex e gap dinamico --- */}
        <ul className="hidden lg:flex gap-4 xl:gap-6 items-center font-medium">
          {/* Link Comuni */}
          {commonLinks.map((link) => (
            <li key={link.to}>
              <StyledNavLink to={link.to}>{link.label}</StyledNavLink>
            </li>
          ))}

          {/* PULSANTE MARKET */}
          <li>
             <MarketButton />
          </li>

          {!user ? (
            <>
              {/* Link per Ospiti */}
              {guestLinks.map((link) => (
                <li key={link.to}>
                  <StyledNavLink to={link.to}>{link.label}</StyledNavLink>
                </li>
              ))}
            </>
          ) : (
            <>
              {/* Link per Utenti Loggati */}
              {userNavLinks.map((link) => (
                <li key={link.to}>
                  <StyledNavLink to={link.to}>{link.label}</StyledNavLink>
                </li>
              ))}

              {/* Icona Notifiche */}
              <li className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative notification-bell-button p-2"
                >
                  <FaBell className="text-xl hover:text-[#228B22] transition-colors" />
                  {notificationsCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-xs font-bold text-white rounded-full h-5 w-5 flex items-center justify-center border-2 border-[#FAF3E0]">
                      {notificationsCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Notifiche - Aggiunto max-w-[90vw] e origin-top-right */}
                <div
                  ref={notificationsRef}
                  className={`absolute top-full right-0 mt-3 w-80 max-w-[90vw] bg-[#FDFBF5] border border-gray-200 rounded-lg shadow-xl transition-all duration-300 ease-in-out z-50 origin-top-right
                    ${showNotifications ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-10px] pointer-events-none'}`}
                >
                  <Notifications
                    onNotificationRead={fetchNotificationsCount}
                    closeDropdown={() => setShowNotifications(false)}
                    refresh={notificationsCount}
                  />
                </div>
              </li>

              {/* Dropdown Avatar */}
              <li className="relative" ref={avatarMenuRef}>
                <button 
                  onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <img
                    src={getAvatarUrl()}
                    alt="Avatar"
                    onError={(e) => { e.target.src = '/default-avatar.png'; }}
                    className="w-9 h-9 rounded-full border-2 border-[#228B22] hover:ring-2 ring-offset-2 ring-[#FFD700] transition object-cover"
                  />
                </button>

                {avatarMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50 animate-fade-in-down py-1 origin-top-right">
                    {userDropdownLinks.map((link) => (
                      <AvatarDropdownLink 
                        key={link.to}
                        to={link.to} 
                        onClick={() => setAvatarMenuOpen(false)}
                      >
                        {link.label}
                      </AvatarDropdownLink>
                    ))}
                    
                    {user.role === 'admin' && (
                      <AvatarDropdownLink 
                        to="/admin/blog" 
                        onClick={() => setAvatarMenuOpen(false)}
                      >
                        <span className="font-semibold text-red-600">{t('navbar.admin')}</span>
                      </AvatarDropdownLink>
                    )}
                    
                    <hr className="my-1 border-gray-200" />

                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-[#F1F1F1] transition-colors"
                    >
                      {t('navbar.logout')}
                    </button>
                  </div>
                )}
              </li>
            </>
          )}
        </ul>
      </div>

      {/* --- 📱 Mobile/Tablet Menu - Cambiato da sm:hidden a lg:hidden --- */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 py-3 bg-[#EDE7D6] text-base animate-fade-in-down shadow-inner max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            
            {/* Link Comuni */}
            {commonLinks.map((link) => (
              <StyledMobileLink 
                key={link.to} 
                to={link.to} 
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </StyledMobileLink>
            ))}

            {/* PULSANTE MARKET MOBILE */}
            <MarketButton mobile={true} />

            {!user ? (
              <>
                {/* Link per Ospiti */}
                {guestLinks.map((link) => (
                  <StyledMobileLink 
                    key={link.to} 
                    to={link.to} 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </StyledMobileLink>
                ))}
              </>
            ) : (
              <>
                {/* Link per Utenti Loggati */}
                {userNavLinks.map((link) => (
                  <StyledMobileLink 
                    key={link.to} 
                    to={link.to} 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </StyledMobileLink>
                ))}
                
                <hr className="my-2 border-[#D5CDB5]" />
                
                {/* Link Account Utente (che prima erano nel dropdown che spariva) */}
                {userDropdownLinks.map((link) => (
                  <StyledMobileLink 
                    key={link.to} 
                    to={link.to} 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </StyledMobileLink>
                ))}

                {user.role === 'admin' && (
                  <StyledMobileLink 
                    to="/admin/blog" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="font-semibold text-red-600">{t('navbar.admin')}</span>
                  </StyledMobileLink>
                )}

                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                  className="block w-full text-left px-4 py-2 rounded text-red-600 hover:bg-[#FCEFEF] transition mt-2 font-medium"
                >
                  {t('navbar.logout')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;