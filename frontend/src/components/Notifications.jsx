import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';

const MAX_UNREAD = 4;
const MAX_READ = 3;

const Notifications = ({ onNotificationRead }) => {
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [showAllUnread, setShowAllUnread] = useState(false);
  const [showAllRead, setShowAllRead] = useState(false);
  const user = useSelector(selectUser);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get(`/notifications/user/${user._id}`);
      setUnreadNotifications(data.unreadNotifications || []);
      setReadNotifications(data.readNotifications || []);
    } catch (err) {
      console.error('Errore nel recupero delle notifiche:', err);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, [user?._id]);

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}`, { read: true });

      const notification = unreadNotifications.find(n => n._id === notificationId);
      setUnreadNotifications(prev => prev.filter(n => n._id !== notificationId));
      setReadNotifications(prev => [notification, ...prev]);

      if (onNotificationRead) onNotificationRead();
    } catch (err) {
      console.error('Errore nel segnare la notifica come letta:', err);
    }
  };

  const renderNotificationCard = (notification, isUnread) => (
    <li
      key={notification._id}
      className={`bg-white shadow-sm rounded-lg p-4 flex justify-between items-start mb-3 border-l-4 ${
        isUnread ? 'border-yellow-400' : 'border-gray-300'
      }`}
    >
      <div className="flex-1">
        <p className="text-sm text-gray-800">
          <span className="font-semibold text-green-700">
            {notification.type === 'feeding' ? '🍽️ Alimentazione' : '🩺 Salute'}:
          </span>{' '}
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 mt-1">{new Date(notification.date).toLocaleDateString()}</p>
      </div>
      {isUnread && (
        <button
          onClick={() => markAsRead(notification._id)}
          className="text-sm text-yellow-600 hover:underline ml-4"
        >
          Segna come letto
        </button>
      )}
    </li>
  );

  const displayedUnread = showAllUnread ? unreadNotifications : unreadNotifications.slice(0, MAX_UNREAD);
  const displayedRead = showAllRead ? readNotifications : readNotifications.slice(0, MAX_READ);

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 px-4">
      <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-6">🔔 Le tue Notifiche</h2>

      {/* Sezione non lette */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[#556B2F] mb-2">📬 Non lette</h3>
        {unreadNotifications.length === 0 ? (
          <p className="text-sm text-gray-600">Tutto letto! 🐍</p>
        ) : (
          <>
            <ul>{displayedUnread.map(n => renderNotificationCard(n, true))}</ul>
            {unreadNotifications.length > MAX_UNREAD && (
              <button
                onClick={() => setShowAllUnread(!showAllUnread)}
                className="text-sm text-blue-600 hover:underline mt-2"
              >
                {showAllUnread ? 'Mostra meno' : 'Mostra tutte'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Sezione lette */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">🗂️ Ultime lette</h3>
        {readNotifications.length === 0 ? (
          <p className="text-sm text-gray-600">Nessuna notifica letta ancora.</p>
        ) : (
          <>
            <ul>{displayedRead.map(n => renderNotificationCard(n, false))}</ul>
            {readNotifications.length > MAX_READ && (
              <button
                onClick={() => setShowAllRead(!showAllRead)}
                className="text-sm text-blue-600 hover:underline mt-2"
              >
                {showAllRead ? 'Mostra meno' : 'Mostra tutte'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
