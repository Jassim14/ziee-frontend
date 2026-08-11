import { useState, useEffect } from 'react';
import api from '../../api/axios';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import { Users, Briefcase, Building2, TrendingUp, Star, CheckCircle, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/admin')
      .then(res => setStats(res.data.data))
      .catch(err => setError(getErrorMessage(err, 'Failed to load dashboard')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div className="max-w-7xl mx-auto px-4 py-8"><Alert type="error">{error}</Alert></div>;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Businesses', value: stats?.totalBusinesses ?? 0, icon: Briefcase, color: 'bg-green-500' },
    { label: 'Organizations', value: stats?.totalOrganizations ?? 0, icon: Building2, color: 'bg-purple-500' },
    { label: 'Approved Businesses', value: stats?.approvedBusinesses ?? 0, icon: TrendingUp, color: 'bg-amber-500' },
    { label: 'Pending Approval', value: stats?.pendingBusinesses ?? 0, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Total Reviews', value: stats?.totalReviews ?? 0, icon: Star, color: 'bg-pink-500' },
    { label: 'Categories', value: stats?.totalCategories ?? 0, icon: CheckCircle, color: 'bg-indigo-500' },
    { label: 'Trainings', value: stats?.totalTrainings ?? 0, icon: Briefcase, color: 'bg-teal-500' },
  ];

  const categoryStats = stats?.categoryStats || [];
  const maxCount = categoryStats.length ? Math.max(...categoryStats.map(c => c.businessCount)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${c.color}`}>
                <c.icon size={22} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {categoryStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Businesses by Category</h2>
          <div className="space-y-3">
            {categoryStats.map(c => (
              <div key={c.categoryName} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{c.categoryName}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${maxCount ? Math.min(100, (c.businessCount / maxCount) * 100) : 0}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-8 text-right">{c.businessCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
