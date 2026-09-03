import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../../api/services';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';

const PAGE_SIZE = 10;

function getRelatedLink(type, id) {
  if (!type || !id) return null;
  switch (type) {
    case 'BUSINESS': return `/businesses/${id}`;
    case 'TRAINING': return `/trainings/${id}`;
    case 'CHALLENGE': return `/challenges/${id}`;
    default: return null;
  }
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [unreadServer, setUnreadServer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchNotifications = useCallback((p = 0) => {
    setLoading(true);
    setError('');
    notificationApi.list({ page: p, size: PAGE_SIZE })
      .then(data => {
        setNotifications(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
        setPage(p);
      })
      .catch(err => setError(getErrorMessage(err, 'Unable to load notifications.')))
      .finally(() => setLoading(false));
  }, []);

  const fetchUnread = useCallback(() => {
    notificationApi.unreadCount()
      .then(setUnreadServer)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchNotifications(0);
    fetchUnread();
  }, [fetchNotifications, fetchUnread]);

  const handlePageChange = (newPage) => {
    fetchNotifications(newPage);
  };

  const markRead = async (n) => {
    try {
      await notificationApi.markRead(n.id);
      setNotifications(prev => prev.map(item =>
        item.id === n.id ? { ...item, read: true } : item
      ));
      setUnreadServer(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update notification'));
    }
  };

  const markAllRead = async () => {
    if (markAllLoading) return;
    setMarkAllLoading(true);
    try {
      await notificationApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadServer(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update notifications'));
    } finally {
      setMarkAllLoading(false);
    }
  };

  const deleteNotification = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await notificationApi.remove(deleteTarget.id);
      setNotifications(prev => prev.filter(n => n.id !== deleteTarget.id));
      if (!deleteTarget.read) {
        setUnreadServer(prev => Math.max(0, prev - 1));
      }
      setTotalElements(prev => Math.max(0, prev - 1));
      setDeleteTarget(null);
      toast.success('Notification deleted');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete notification'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClick = (n) => {
    if (!n.read) {
      markRead(n);
    }
    const link = getRelatedLink(n.relatedEntityType, n.relatedEntityId);
    if (link) {
      navigate(link);
    }
  };

  if (loading && notifications.length === 0 && !error) return <Spinner />;
  if (error && notifications.length === 0) return <div className="max-w-2xl mx-auto px-4 py-8"><Alert type="error">{error}</Alert></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadServer > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full" aria-label={`${unreadServer} unread`}>
              {unreadServer}
            </span>
          )}
          {totalElements > 0 && (
            <span className="text-sm text-gray-400">{totalElements} total</span>
          )}
        </div>
        {unreadServer > 0 && (
          <button
            onClick={markAllRead}
            disabled={markAllLoading}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
          >
            <CheckCheck size={16} /> {markAllLoading ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" aria-hidden="true" />
          <p className="text-gray-500 font-medium mb-1">No notifications yet</p>
          <p className="text-sm text-gray-400">You'll see updates about your ZIEE activities here.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {notifications.map(n => {
              const link = getRelatedLink(n.relatedEntityType, n.relatedEntityId);
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`bg-white rounded-2xl shadow-xs border p-4 flex items-start justify-between transition ${
                    n.read ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'
                  } ${link ? 'cursor-pointer hover:shadow-sm' : ''}`}
                  role={link ? 'button' : undefined}
                  tabIndex={link ? 0 : undefined}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleClick(n); }}
                >
                  <div className="flex-1 min-w-0">
                    {n.title && (
                      <p className={`text-sm font-semibold mb-0.5 ${n.read ? 'text-gray-500' : 'text-gray-900'}`}>
                        {n.title}
                      </p>
                    )}
                    <p className={`text-sm leading-relaxed ${n.read ? 'text-gray-500' : 'text-gray-800'}`}>
                      {n.message}
                    </p>
                    {n.createdAt && (
                      <p className="text-xs text-gray-400 mt-1.5">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-3 shrink-0">
                    {!n.read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markRead(n); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"
                        title="Mark as read"
                        aria-label="Mark notification as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(n); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-red-50"
                      title="Delete"
                      aria-label="Delete notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Notification"
        message="Are you sure you want to permanently delete this notification?"
        confirmLabel="Delete"
        onConfirm={deleteNotification}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
