import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { publicLinks } from '../navigation';
import { Bell, User, Menu, X, ChevronDown, Check, CheckCheck } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { notificationApi } from '../api/services';

function getRelatedLink(type, id) {
  if (!type || !id) return null;
  switch (type) {
    case 'BUSINESS': return `/businesses/${id}`;
    case 'TRAINING': return `/trainings/${id}`;
    case 'CHALLENGE': return `/challenges/${id}`;
    default: return null;
  }
}

export default function Navbar({ onMenuClick }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const refreshNotifs = useCallback(() => {
    if (user) {
      notificationApi.unreadCount()
        .then(setUnread)
        .catch(() => {});
      notificationApi.list({ page: 0, size: 5 })
        .then(data => {
          setRecentNotifs(data.items || []);
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    refreshNotifs();
    // Poll every 60 seconds
    const pollInterval = setInterval(refreshNotifs, 60000);
    // Refresh on navigation
    const onPopState = () => refreshNotifs();
    window.addEventListener('popstate', onPopState);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('popstate', onPopState);
    };
  }, [refreshNotifs]);

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/login');
  };

  const handleNotifClick = async (n) => {
    setNotifOpen(false);
    if (!n.read) {
      try {
        await notificationApi.markRead(n.id);
        setRecentNotifs(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
        setUnread(prev => Math.max(0, prev - 1));
      } catch {
        // silently fail
      }
    }
    const link = getRelatedLink(n.relatedEntityType, n.relatedEntityId);
    if (link) {
      navigate(link);
    }
  };

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationApi.markRead(id);
      setRecentNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {
      // silently fail; server state is truth
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setRecentNotifs(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch {
      // silently fail
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString();
  };

  // Authenticated + layout (sidebar available): hamburger opens the Sidebar drawer
  // Authenticated + public page (no sidebar): no hamburger
  // Unauthenticated: toggles the public mobile nav dropdown
  const showHamburger = !isAuthenticated || Boolean(onMenuClick);

  const handleMobileToggle = () => {
    if (isAuthenticated && onMenuClick) {
      onMenuClick();
    } else if (!isAuthenticated) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ZIEE</span>
            </Link>

            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-1 min-w-0 overflow-x-auto">
                {publicLinks.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <div className={`${isAuthenticated ? 'flex' : 'hidden md:flex'} items-center gap-3`}>
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-700">Sign In</Link>
                <Link to="/register" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Join ZIEE</Link>
              </>
            ) : (
              <>
                {/* Notification Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(o => !o)}
                    className="relative p-2 text-gray-500 hover:text-gray-700 transition"
                    title="Notifications"
                    aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
                  >
                    <Bell size={20} />
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                        {unread > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <CheckCheck size={14} /> Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                        {recentNotifs.length === 0 ? (
                          <div className="py-8 text-center">
                            <Bell size={24} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">No notifications</p>
                          </div>
                        ) : (
                          recentNotifs.map(n => {
                            const link = getRelatedLink(n.relatedEntityType, n.relatedEntityId);
                            return (
                              <div
                                key={n.id}
                                onClick={() => handleNotifClick(n)}
                                className={`px-4 py-3 flex items-start gap-3 ${n.read ? '' : 'bg-blue-50/50'} ${link ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'} transition`}
                              >
                                <div className="flex-1 min-w-0">
                                  {n.title && (
                                    <p className={`text-xs font-semibold mb-0.5 ${n.read ? 'text-gray-400' : 'text-gray-700'}`}>
                                      {n.title}
                                    </p>
                                  )}
                                  <p className={`text-sm leading-snug ${n.read ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                                    {n.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(n.createdAt)}</p>
                                </div>
                                {!n.read && (
                                  <button
                                    onClick={(e) => handleMarkRead(e, n.id)}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition shrink-0 mt-0.5"
                                    title="Mark as read"
                                    aria-label="Mark notification as read"
                                  >
                                    <Check size={14} />
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      <Link
                        to="/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-3 border-t border-gray-100 hover:bg-blue-50 transition"
                      >
                        View all notifications
                      </Link>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(o => !o)}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {user.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : (
                        <User size={16} className="text-blue-600" />
                      )}
                    </div>
                    <span className="font-medium max-w-[10rem] truncate hidden sm:inline">{user.fullName}</span>
                    <ChevronDown size={14} />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                      <Link to="/notifications" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Notifications {unread > 0 && `(${unread})`}</Link>
                      <Link to="/notification-preferences" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Notification Preferences</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {showHamburger && (
            <div className={`${isAuthenticated ? 'lg:hidden' : 'md:hidden'} flex items-center`}>
              <button onClick={handleMobileToggle} className="p-2 text-gray-500" aria-label="Toggle menu">
                {!isAuthenticated && mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {!isAuthenticated && mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          {publicLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block py-2 text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-2 flex gap-2">
            <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700">Sign In</Link>
            <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">Join ZIEE</Link>
          </div>
        </div>
      )}
    </nav>
  );
}