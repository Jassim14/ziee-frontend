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
  UserCog,
  Building,
  Compass,
  FileText,
  ClipboardList,
  MessageSquare,
} from 'lucide-react';

export const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/businesses', label: 'Businesses' },
  { to: '/organizations', label: 'Organizations' },
  { to: '/trainings', label: 'Trainings' },
  { to: '/challenges', label: 'Challenges' },
  { to: '/categories', label: 'Categories' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export const roleLinks = {
  ADMIN: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: UserCog, label: 'Users' },
    { to: '/admin/organizations', icon: Building, label: 'Organizations' },
    { to: '/admin/categories', icon: FolderOpen, label: 'Categories' },
    { to: '/admin/approve', icon: CheckCircle, label: 'Approve Businesses' },
    { to: '/admin/trainings', icon: BookOpen, label: 'Trainings' },
    { to: '/admin/challenges', icon: Trophy, label: 'Challenges' },
    { to: '/admin/reviews', icon: MessageSquare, label: 'Reviews' },
  ],
  ENTREPRENEUR: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/my-businesses', icon: Building2, label: 'My Businesses' },
    { to: '/business/new', icon: PlusCircle, label: 'Create Business' },
    { to: '/favorites', icon: Heart, label: 'Favorites' },
    { to: '/trainings', icon: BookOpen, label: 'Trainings' },
    { to: '/challenges', icon: Trophy, label: 'Challenges' },
    { to: '/my-registrations', icon: ClipboardList, label: 'My Registrations' },
    { to: '/my-applications', icon: FileText, label: 'My Applications' },
  ],
  CUSTOMER: [
    { to: '/customer-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/businesses', icon: Compass, label: 'Discover' },
    { to: '/organizations', icon: Building, label: 'Organizations' },
    { to: '/trainings', icon: BookOpen, label: 'Trainings' },
    { to: '/challenges', icon: Trophy, label: 'Challenges' },
    { to: '/favorites', icon: Heart, label: 'Favorites' },
    { to: '/my-reviews', icon: Star, label: 'My Reviews' },
    { to: '/my-registrations', icon: ClipboardList, label: 'My Registrations' },
    { to: '/my-applications', icon: FileText, label: 'My Applications' },
  ],
  ORGANIZATION: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/org-trainings', icon: BookOpen, label: 'Trainings' },
    { to: '/org-challenges', icon: Trophy, label: 'Challenges' },
    { to: '/my-organizations', icon: Users, label: 'My Organizations' },
    { to: '/organizations/new', icon: PlusCircle, label: 'Create Organization' },
  ],
};

export function getRoleLinks(role) {
  return roleLinks[role] || [];
}