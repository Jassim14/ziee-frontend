import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { publicLinks, getRoleLinks } from '../navigation';
import { Bell, User, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (user) {
      api.get('/notifications/unread-count')
        .then(res => setUnread(res.data.data ?? 0))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
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

  const authedLinks = user ? getRoleLinks(user.role) : [];

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

            <div className="hidden md:flex items-center gap-1">
              {publicLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-700">Sign In</Link>
                <Link to="/register" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Join ZIEE</Link>
              </>
            ) : (
              <>
                {authedLinks.length > 0 && (
                  <Link to="/dashboard" className="px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100">
                    Dashboard
                  </Link>
                )}
                <Link to="/notifications" className="relative p-2 text-gray-500 hover:text-gray-700" title="Notifications">
                  <Bell size={20} />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </Link>
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(o => !o)}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-blue-600" />
                    </div>
                    <span className="font-medium max-w-[10rem] truncate">{user.fullName}</span>
                    <ChevronDown size={14} />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                      <Link to="/notifications" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Notifications {unread > 0 && `(${unread})`}</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-500" aria-label="Toggle menu">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
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
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700">Dashboard</NavLink>
              {authedLinks.filter(l => l.to !== '/dashboard').map(link => (
                <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700">
                  {link.label}
                </NavLink>
              ))}
              <NavLink to="/profile" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700">Profile</NavLink>
              <button onClick={handleLogout} className="block py-2 text-sm font-medium text-red-600">Logout</button>
            </>
          ) : (
            <div className="pt-2 flex gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700">Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">Join ZIEE</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
