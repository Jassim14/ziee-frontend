import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, Briefcase, Building2, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  const cards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Businesses', value: stats.totalBusinesses, icon: Briefcase, color: 'bg-green-500' },
    { label: 'Organizations', value: stats.totalOrganizations, icon: Building2, color: 'bg-purple-500' },
    { label: 'Approved Businesses', value: stats.approvedBusinesses, icon: TrendingUp, color: 'bg-amber-500' },
  ] : [];

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

      {stats?.categoryStats?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Businesses by Category</h2>
          <div className="space-y-3">
            {stats.categoryStats.map(c => (
              <div key={c.categoryName} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{c.categoryName}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (c.businessCount / Math.max(...stats.categoryStats.map(x => x.businessCount))) * 100)}%` }} />
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
