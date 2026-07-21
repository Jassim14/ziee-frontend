import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Building2, FolderOpen, Users, CheckCircle,
  PlusCircle, BookOpen, Trophy, Heart, Bell, User
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/categories', icon: FolderOpen, label: 'Categories' },
  { to: '/admin/approve-businesses', icon: CheckCircle, label: 'Approve Businesses' },
];

const entrepreneurLinks = [
  { to: '/my-businesses', icon: Building2, label: 'My Businesses' },
  { to: '/create-business', icon: PlusCircle, label: 'Create Business' },
];

const customerLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/favorites', icon: Heart, label: 'Favorites' },
];

const organizationLinks = [
  { to: '/my-organizations', icon: Users, label: 'My Organizations' },
  { to: '/create-organization', icon: PlusCircle, label: 'Create Organization' },
  { to: '/trainings', icon: BookOpen, label: 'Trainings' },
  { to: '/challenges', icon: Trophy, label: 'Challenges' },
];

export default function Sidebar() {
  const { user } = useAuth();

  const getLinks = () => {
    switch (user?.role) {
      case 'ADMIN': return adminLinks;
      case 'ENTREPRENEUR': return entrepreneurLinks;
      case 'ORGANIZATION': return [...entrepreneurLinks, ...organizationLinks];
      case 'CUSTOMER': return customerLinks;
      default: return [];
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] hidden lg:block">
      <nav className="p-4 space-y-1">
        {getLinks().map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/' || link.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
