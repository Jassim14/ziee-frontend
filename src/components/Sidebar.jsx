import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoleLinks } from '../navigation';
import { Bell, User, LogOut, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../api/services';

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user ? getRoleLinks(user.role) : [];
  const [unread, setUnread] = useState(0);

  const fetchUnread = useCallback(() => {
    if (user) {
      notificationApi.unreadCount()
        .then(setUnread)
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    const onPopState = () => fetchUnread();
    window.addEventListener('popstate', onPopState);
    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', onPopState);
    };
  }, [fetchUnread]);

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  const authLinks = (
    <>
      <div className="border-t border-gray-100 mt-2 pt-2 space-y-1">
        <NavLink
          to="/profile"
          onClick={onClose}
          className={navLinkClass}
        >
          <User size={18} />
          Profile
        </NavLink>
        <NavLink
          to="/notifications"
          onClick={onClose}
          className={navLinkClass}
        >
          <Bell size={18} />
          <span className="flex-1">Notifications</span>
          {unread > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-200 ease-in-out lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link to="/" onClick={onClose} className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">Z</span>
            </div>
            <span className="text-lg font-bold text-gray-900">ZIEE</span>
          </Link>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 5rem)' }}>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={onClose} className={navLinkClass}>
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
          {authLinks}
        </nav>
      </aside>

      {/* Desktop sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh)] hidden lg:block">
        <nav className="p-4 space-y-1 sticky top-0">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
          {authLinks}
        </nav>
      </aside>
    </>
  );
}
