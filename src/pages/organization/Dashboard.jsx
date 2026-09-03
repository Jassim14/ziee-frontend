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
  BookOpen,
  Trophy,
  Users,
  Plus,
  ArrowRight,
  FileText,
  Calendar,
  Clock,
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentTrainings, setRecentTrainings] = useState([]);
  const [recentChallenges, setRecentChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/dashboard/organization').then(res => res.data.data),
      trainingApi.getMy({ page: 0, size: 5, sortBy: 'createdAt', sortDir: 'desc' }).catch(() => ({ items: [] })),
      challengeApi.getMy({ page: 0, size: 5, sortBy: 'createdAt', sortDir: 'desc' }).catch(() => ({ items: [] })),
    ])
      .then(([statsData, trainData, chalData]) => {
        if (!active) return;
        setStats(statsData);
        setRecentTrainings(trainData.items || []);
        setRecentChallenges(chalData.items || []);
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
    { label: 'Total Trainings', value: stats?.totalTrainings ?? 0, icon: Building2, color: 'bg-blue-500' },
    { label: 'Active Trainings', value: stats?.publishedTrainings ?? 0, icon: BookOpen, color: 'bg-green-500' },
    { label: 'Active Challenges', value: stats?.openChallenges ?? 0, icon: Trophy, color: 'bg-amber-500' },
    { label: 'Total Participants', value: stats?.totalParticipants ?? 0, icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Organization Dashboard{stats?.organizationName ? ` - ${stats.organizationName}` : ''}
        </h1>
        <Link to="/organizations/new" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-xs transition">
          <Plus size={18} /> Create Organization
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

      {/* Quick Management Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/org-trainings" className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-100 rounded-xl"><BookOpen size={20} className="text-blue-600" /></div>
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">Manage Trainings</h2>
          </div>
          <p className="text-sm text-gray-500">Create, publish, and manage participant registrations</p>
        </Link>

        <Link to="/org-challenges" className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 hover:shadow-md hover:border-amber-300 transition-all group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-100 rounded-xl"><Trophy size={20} className="text-amber-600" /></div>
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition">Manage Challenges</h2>
          </div>
          <p className="text-sm text-gray-500">Review applications, accept or reject applicants</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trainings */}
        <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" />
              Recent Trainings
            </h2>
            <Link
              to="/org-trainings"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight size={13} />
            </Link>
          </div>

          {recentTrainings.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm font-medium">No trainings created yet</p>
              <Link
                to="/org-trainings"
                className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Create First Training <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrainings.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl border border-gray-100 hover:border-blue-200 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{t.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                        {t.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-gray-400" />
                            {new Date(t.startDate).toLocaleDateString()}
                          </span>
                        )}
                        {t.capacity && (
                          <span className="flex items-center gap-1">
                            <Users size={12} className="text-gray-400" />
                            {t.capacity} seats
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={t.publicationStatus || t.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Link
                      to={`/org-trainings/${t.id}/participants`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition"
                    >
                      <Users size={13} /> View Participants
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Challenges */}
        <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Trophy size={20} className="text-amber-600" />
              Recent Challenges
            </h2>
            <Link
              to="/org-challenges"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight size={13} />
            </Link>
          </div>

          {recentChallenges.length === 0 ? (
            <div className="text-center py-8">
              <Trophy size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm font-medium">No challenges created yet</p>
              <Link
                to="/org-challenges"
                className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Create First Challenge <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentChallenges.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl border border-gray-100 hover:border-amber-200 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{c.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                        {c.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-gray-400" />
                            {new Date(c.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Link
                      to={`/org-challenges/${c.id}/applications`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg transition border border-amber-200"
                    >
                      <FileText size={13} /> Review Applications
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
