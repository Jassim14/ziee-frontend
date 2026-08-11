import { useState, useEffect } from 'react';
import api from '../../api/axios';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import toast from 'react-hot-toast';
import { Bell, Check, Trash2 } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data.data))
      .catch(err => setError(getErrorMessage(err, 'Failed to load notifications')))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update notification'));
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update notifications'));
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete notification'));
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return <Spinner />;
  if (error) return <div className="max-w-2xl mx-auto px-4 py-8"><Alert type="error">{error}</Alert></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            <Check size={16} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className={`bg-white rounded-xl shadow-sm border p-4 flex items-start justify-between ${n.read ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'}`}>
              <div className="flex-1">
                <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{n.message}</p>
                {n.createdAt && <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>}
              </div>
              <div className="flex gap-1 ml-3">
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="p-1.5 text-gray-400 hover:text-blue-600 transition" title="Mark read">
                    <Check size={16} />
                  </button>
                )}
                <button onClick={() => deleteNotification(n.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
