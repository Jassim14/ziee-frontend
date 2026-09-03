import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import Sidebar from '../components/Sidebar';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile-only top bar */}
      <div className="lg:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200 sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">Z</span>
          </div>
          <span className="text-lg font-bold text-gray-900">ZIEE</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-500 hover:text-gray-700"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
