import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import { Building2, CheckCircle, Clock, XCircle, Star, Plus } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/entrepreneur')
      .then(res => setStats(res.data.data))
      .catch(err => setError(getErrorMessage(err, 'Failed to load dashboard')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div className="max-w-7xl mx-auto px-4 py-8"><Alert type="error">{error}</Alert></div>;

  const cards = [
    { label: 'My Businesses', value: stats?.myBusinesses ?? 0, icon: Building2, color: 'bg-blue-500' },
    { label: 'Approved', value: stats?.myApprovedBusinesses ?? 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Pending Approval', value: stats?.myPendingBusinesses ?? 0, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Rejected', value: stats?.myRejectedBusinesses ?? 0, icon: XCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Entrepreneur Dashboard</h1>
        <Link to="/business/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} /> Create Business
        </Link>
      </div>

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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your impact</h2>
            <p className="text-sm text-gray-500 mt-1">Reviews received across your businesses</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
            <Star size={18} />
            <span className="text-xl font-bold">{stats?.totalReviewsReceived ?? 0}</span>
          </div>
        </div>

        {stats?.businessNames?.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Your businesses:</p>
            <div className="flex flex-wrap gap-2">
              {stats.businessNames.map(name => (
                <span key={name} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{name}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
