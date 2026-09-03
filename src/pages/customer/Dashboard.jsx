import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trainingApi, challengeApi } from '../../api/services';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import getErrorMessage from '../../utils/errors';
import {
  BookOpen,
  Trophy,
  Calendar,
  ArrowRight,
  Compass,
  Heart,
  Star,
  Building,
  Clock,
} from 'lucide-react';

export default function CustomerDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      trainingApi.getMyRegistrations({ page: 0, size: 5 }).catch(() => ({ items: [] })),
      challengeApi.getMyApplications({ page: 0, size: 5 }).catch(() => ({ items: [] })),
    ])
      .then(([regData, appData]) => {
        if (!active) return;
        setRegistrations(regData.items || []);
        setApplications(appData.items || []);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Failed to load dashboard'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div className="max-w-7xl mx-auto px-4 py-8"><Alert type="error" message={error} /></div>;

  const quickLinks = [
    { to: '/businesses', label: 'Discover Businesses', icon: Compass, color: 'bg-blue-100 text-blue-600' },
    { to: '/trainings', label: 'Browse Trainings', icon: BookOpen, color: 'bg-emerald-100 text-emerald-600' },
    { to: '/challenges', label: 'Explore Challenges', icon: Trophy, color: 'bg-amber-100 text-amber-600' },
    { to: '/organizations', label: 'Organizations', icon: Building, color: 'bg-purple-100 text-purple-600' },
    { to: '/favorites', label: 'My Favorites', icon: Heart, color: 'bg-rose-100 text-rose-600' },
    { to: '/my-reviews', label: 'My Reviews', icon: Star, color: 'bg-indigo-100 text-indigo-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">My Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Track your learning journey, challenge applications, and saved businesses</p>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all flex flex-col items-center gap-2 text-center group"
          >
            <div className={`p-2.5 rounded-xl ${link.color}`}>
              <link.icon size={20} />
            </div>
            <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition">{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Training Registrations */}
        <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" />
              My Training Registrations
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
              My Challenge Applications
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
