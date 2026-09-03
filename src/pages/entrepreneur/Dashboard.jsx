import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { trainingApi, challengeApi } from '../../api/services';
import StatusBadge from '../../components/StatusBadge';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import {
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  Plus,
  BookOpen,
  Trophy,
  Calendar,
  ArrowRight,
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/dashboard/entrepreneur').then(res => res.data.data),
      trainingApi.getMyRegistrations({ page: 0, size: 5 }).catch(() => ({ items: [] })),
      challengeApi.getMyApplications({ page: 0, size: 5 }).catch(() => ({ items: [] })),
    ])
      .then(([statsData, regData, appData]) => {
        if (!active) return;
        setStats(statsData);
        setRegistrations(regData.items || []);
        setApplications(appData.items || []);
      })
      .catch(err => {
        if (active) setError(getErrorMessage(err, 'Failed to load dashboard'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div className="max-w-7xl mx-auto px-4 py-8"><Alert type="error" message={error} /></div>;

  const cards = [
    { label: 'My Businesses', value: stats?.myBusinesses ?? 0, icon: Building2, color: 'bg-blue-500' },
    { label: 'Approved', value: stats?.myApprovedBusinesses ?? 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Pending Approval', value: stats?.myPendingBusinesses ?? 0, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Rejected', value: stats?.myRejectedBusinesses ?? 0, icon: XCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Entrepreneur Dashboard</h1>
        <Link to="/business/new" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-xs transition">
          <Plus size={18} /> Create Business
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${c.color}`}>
                <c.icon size={22} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reviews Impact */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Your Impact</h2>
            <p className="text-sm text-gray-500 mt-1">Reviews received across your businesses</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl">
            <Star size={18} />
            <span className="text-xl font-bold">{stats?.totalReviewsReceived ?? 0}</span>
          </div>
        </div>

        {stats?.businessNames?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Your businesses:</p>
            <div className="flex flex-wrap gap-2">
              {stats.businessNames.map(name => (
                <span key={name} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{name}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Training Registrations & Challenge Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Training Registrations */}
        <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" />
              Training Registrations
            </h2>
            <Link
              to="/my-registrations"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight size={13} />
            </Link>
          </div>

          {registrations.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm font-medium">No training registrations yet</p>
              <Link
                to="/trainings"
                className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Browse Trainings <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {registrations.map((r) => (
                <Link
                  key={r.id}
                  to={`/trainings/${r.trainingId}`}
                  className="block p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition truncate">
                        {r.trainingTitle}
                      </p>
                      {r.registeredAt && (
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400" />
                          {new Date(r.registeredAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Challenge Applications */}
        <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Trophy size={20} className="text-amber-600" />
              Challenge Applications
            </h2>
            <Link
              to="/my-applications"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight size={13} />
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-8">
              <Trophy size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm font-medium">No challenge applications yet</p>
              <Link
                to="/challenges"
                className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Explore Challenges <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((a) => (
                <Link
                  key={a.id}
                  to={`/challenges/${a.challengeId}`}
                  className="block p-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm group-hover:text-amber-600 transition truncate">
                        {a.challengeTitle}
                      </p>
                      {a.appliedAt && (
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" />
                          {new Date(a.appliedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
