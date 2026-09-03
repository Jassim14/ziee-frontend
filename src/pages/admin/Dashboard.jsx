import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/services';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import {
  Users, Briefcase, Building2, Star, CheckCircle, Clock,
  BookOpen, Trophy, Heart, FileText, ClipboardList, XCircle, ArrowRight,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getDashboard()
      .then(setStats)
      .catch(err => setError(getErrorMessage(err, 'Failed to load dashboard')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div className="max-w-7xl mx-auto px-4 py-8"><Alert type="error">{error}</Alert></div>;

  const primaryCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'bg-blue-500', link: '/admin/users' },
    { label: 'Total Businesses', value: stats?.totalBusinesses ?? 0, icon: Briefcase, color: 'bg-green-500', link: '/admin/approve' },
    { label: 'Organizations', value: stats?.totalOrganizations ?? 0, icon: Building2, color: 'bg-purple-500', link: '/admin/organizations' },
    { label: 'Categories', value: stats?.totalCategories ?? 0, icon: CheckCircle, color: 'bg-indigo-500', link: '/admin/categories' },
  ];

  const statusCards = [
    { label: 'Approved', value: stats?.approvedBusinesses ?? 0, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { label: 'Pending', value: stats?.pendingBusinesses ?? 0, icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Rejected', value: stats?.rejectedBusinesses ?? 0, icon: XCircle, color: 'bg-red-100 text-red-700' },
  ];

  const activityCards = [
    { label: 'Trainings', value: stats?.totalTrainings ?? 0, icon: BookOpen, color: 'bg-teal-100 text-teal-700', link: '/admin/trainings' },
    { label: 'Challenges', value: stats?.totalChallenges ?? 0, icon: Trophy, color: 'bg-amber-100 text-amber-700', link: '/admin/challenges' },
    { label: 'Reviews', value: stats?.totalReviews ?? 0, icon: Star, color: 'bg-pink-100 text-pink-700', link: '/admin/reviews' },
    { label: 'Favorites', value: stats?.totalFavorites ?? 0, icon: Heart, color: 'bg-rose-100 text-rose-700' },
    { label: 'Registrations', value: stats?.totalRegistrations ?? 0, icon: ClipboardList, color: 'bg-cyan-100 text-cyan-700' },
    { label: 'Applications', value: stats?.totalApplications ?? 0, icon: FileText, color: 'bg-violet-100 text-violet-700' },
  ];

  const categoryStats = stats?.categoryStats || [];
  const maxCount = categoryStats.length ? Math.max(...categoryStats.map(c => c.businessCount)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Admin Dashboard</h1>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {primaryCards.map(c => (
          <Link
            key={c.label}
            to={c.link}
            className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${c.color}`}>
                <c.icon size={22} className="text-white" aria-hidden="true" />
              </div>
            </div>
            <span className="text-xs text-blue-600 font-medium mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              View details <ArrowRight size={12} />
            </span>
          </Link>
        ))}
      </div>

      {/* Business Status Breakdown */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Business Status Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statusCards.map(c => (
            <div key={c.label} className={`rounded-xl p-4 flex items-center gap-3 ${c.color}`}>
              <c.icon size={22} aria-hidden="true" />
              <div>
                <p className="text-sm font-medium opacity-80">{c.label}</p>
                <p className="text-2xl font-bold">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Stats */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Platform Activity</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {activityCards.map(c => (
            <div key={c.label}>
              {c.link ? (
                <Link to={c.link} className="block rounded-xl p-4 text-center hover:ring-2 hover:ring-blue-300 transition">
                  <div className={`inline-flex p-2.5 rounded-xl mb-2 ${c.color}`}>
                    <c.icon size={20} aria-hidden="true" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">{c.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
                </Link>
              ) : (
                <div className="rounded-xl p-4 text-center">
                  <div className={`inline-flex p-2.5 rounded-xl mb-2 ${c.color}`}>
                    <c.icon size={20} aria-hidden="true" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">{c.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Category Distribution Chart */}
      {categoryStats.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Businesses by Category</h2>
          <div className="space-y-3">
            {categoryStats.map(c => (
              <div key={c.categoryName} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-32 sm:w-40 truncate shrink-0" title={c.categoryName}>
                  {c.categoryName}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-blue-500 h-6 rounded-full transition-all duration-500"
                    style={{ width: `${maxCount ? Math.min(100, (c.businessCount / maxCount) * 100) : 0}%` }}
                    role="progressbar"
                    aria-valuenow={c.businessCount}
                    aria-valuemin={0}
                    aria-valuemax={maxCount}
                    aria-label={`${c.categoryName}: ${c.businessCount} businesses`}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-10 text-right">{c.businessCount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
