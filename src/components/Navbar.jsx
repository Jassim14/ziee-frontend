import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/notifications/unread-count')
        .then(res => setUnread(res.data.data))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ZIEE</span>
            </Link>
          </div>

          {user && (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/notifications" className="relative p-2 text-gray-500 hover:text-gray-700">
                <Bell size={20} />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-blue-600" />
                </div>
                <span className="font-medium">{user.fullName}</span>
              </Link>
              <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600">
                <LogOut size={20} />
              </button>
            </div>
          )}

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-500">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && user && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
          <Link to="/notifications" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Notifications {unread > 0 && `(${unread})`}</Link>
          <Link to="/profile" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Profile</Link>
          <button onClick={handleLogout} className="block py-2 text-red-600">Logout</button>
        </div>
      )}
    </nav>
  );
}
