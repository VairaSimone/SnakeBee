import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { FaTimes, FaCheckCircle, FaRegCircle } from 'react-icons/fa';
import { VscEmptyWindow } from 'react-icons/vsc';
import { useTranslation } from 'react-i18next';

const formatDistanceToNow = (dateString, t) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return t("notifications.time.yearsAgo", { count: Math.floor(interval) });

  interval = seconds / 2592000;
  if (interval > 1) return t("notifications.time.monthsAgo", { count: Math.floor(interval) });

  interval = seconds / 86400;
  if (interval > 1) return t("notifications.time.daysAgo", { count: Math.floor(interval) });

  interval = seconds / 3600;
  if (interval > 1) return t("notifications.time.hoursAgo", { count: Math.floor(interval) });

  interval = seconds / 60;
  if (interval > 1) return t("notifications.time.minutesAgo", { count: Math.floor(interval) });

  return t("notifications.time.justNow");
};

const Notifications = ({ onNotificationRead, closeDropdown, refresh }) => {
  const [notifications, setNotifications] = useState([]);
  const user = useSelector(selectUser);
  const { t } = useTranslation();

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get(`/notifications/user/${user._id}?limit=10`);
      const all = [...(data.unreadNotifications || []), ...(data.readNotifications || [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setNotifications(all);
    } catch (err) {
      console.error(t("notifications.errors.fetchNotifications"), err);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, [user?._id]);
useEffect(() => {
  fetchNotifications();
}, [refresh]);

const markAsRead = async (notificationId) => {
  try {
    await api.put(`/notifications/${notificationId}`, { read: true });

    setNotifications(prev =>
      prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
    );

    // Aggiorno il badge tramite callback del parent
    onNotificationRead(); 
  } catch (err) {
    console.error(t("notifications.errors.markAsRead"), err);
  }
};

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const NotificationCard = ({ notification }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <li
        className="flex items-start p-3 hover:bg-[#E0D8C3]/50 rounded-lg transition-colors duration-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex-shrink-0 mr-3">
          <span className={`text-xl ${notification.read ? 'text-gray-400' : 'text-green-600'}`}>
            {notification.type === 'feeding' ? '🍽️' : '🩺'}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-800">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(notification.date, t)}</p>
        </div>
        {!notification.read && (
          <button
            onClick={() => markAsRead(notification._id)}
            className="ml-2 text-gray-400 hover:text-green-600 transition-colors"
            title={t("notifications.actions.markAsRead")}
          >
            {isHovered ? <FaCheckCircle /> : <FaRegCircle />}
          </button>
        )}
      </li>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200">
        <h3 className="font-semibold text-md text-[#2B2B2B]">{t("notifications.title")}</h3>
        <button onClick={closeDropdown} className="text-gray-500 hover:text-red-600">
          <FaTimes />
        </button>
      </div>

      <div className="flex-1 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 text-gray-500">
            <VscEmptyWindow className="text-4xl mb-2" />
            <p className="font-semibold">{t("notifications.empty.title")}</p>
            <p className="text-sm">{t("notifications.empty.subtitle")}</p>
          </div>
        ) : (
          <ul>
            {unreadNotifications.length > 0 && (
              <li className="px-3 py-1 text-xs font-bold text-gray-500 uppercase bg-gray-50">{t("notifications.unread")}</li>
            )}
            {unreadNotifications.map(n => <NotificationCard key={n._id} notification={n} />)}

            {readNotifications.length > 0 && unreadNotifications.length > 0 && <hr className="my-1" />}

            {readNotifications.length > 0 && (
              <li className="px-3 py-1 text-xs font-bold text-gray-500 uppercase bg-gray-50">{t("notifications.read")}</li>
            )}
            {readNotifications.map(n => <NotificationCard key={n._id} notification={n} />)}
          </ul>
        )}
      </div>

      {/* Footer */}
    </div>
  );
};

export default Notifications;
