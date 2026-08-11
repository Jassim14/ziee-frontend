import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  FolderOpen,
  CheckCircle,
  Users,
  BookOpen,
  Trophy,
  Heart,
  Star,
} from 'lucide-react';

export const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/businesses', label: 'Businesses' },
  { to: '/categories', label: 'Categories' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export const roleLinks = {
  ADMIN: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/categories', icon: FolderOpen, label: 'Categories' },
    { to: '/admin/approve', icon: CheckCircle, label: 'Approve Businesses' },
  ],
  ENTREPRENEUR: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/my-businesses', icon: Building2, label: 'My Businesses' },
    { to: '/business/new', icon: PlusCircle, label: 'Create Business' },
  ],
  CUSTOMER: [
    { to: '/businesses', icon: LayoutDashboard, label: 'Discover' },
    { to: '/favorites', icon: Heart, label: 'Favorites' },
    { to: '/my-reviews', icon: Star, label: 'My Reviews' },
  ],
  ORGANIZATION: [
    { to: '/my-organizations', icon: Users, label: 'My Organizations' },
    { to: '/organizations/new', icon: PlusCircle, label: 'Create Organization' },
    { to: '/trainings', icon: BookOpen, label: 'Trainings' },
    { to: '/challenges', icon: Trophy, label: 'Challenges' },
  ],
};

export function getRoleLinks(role) {
  return roleLinks[role] || [];
}
