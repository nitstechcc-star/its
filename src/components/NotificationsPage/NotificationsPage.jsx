import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, AlertCircle, Info, CheckCircle, RefreshCw } from 'lucide-react';
import { getJudgeNotifications, markJudgeNotificationRead } from '../../Axios';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });



  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const result = await getJudgeNotifications();
      if (result.success !== false && result.data) {
        setNotifications(result.data || []);
      }
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    const result = await markJudgeNotificationRead(id);
    if (result.success) {
      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      ));
    }
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const notif of unread) {
      await markAsRead(notif.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Mark All Read
          </button>
          <button
            onClick={() => window.location.reload()}
            className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'unread', 'success', 'warning', 'info'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                  !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-800 dark:text-white">
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    {notification.time}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

