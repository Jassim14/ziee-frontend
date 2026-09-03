import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { organizationApi, trainingApi, challengeApi } from '../../api/services';
import TrainingCard from '../../components/TrainingCard';
import ChallengeCard from '../../components/ChallengeCard';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import EmptyState from '../../components/EmptyState';
import getErrorMessage from '../../utils/errors';
import {
  Building2,
  Mail,
  Phone,
  ArrowLeft,
  BookOpen,
  Trophy,
  Calendar,
  User,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Globe,
} from 'lucide-react';

export default function OrganizationDetail() {
  const { id } = useParams();
  const [organization, setOrganization] = useState(null);
  const [trainings, setTrainings] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'trainings' | 'challenges'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      organizationApi.get(id),
      trainingApi.getByOrganization(id, { page: 0, size: 20 }).catch(() => ({ items: [] })),
      challengeApi.getByOrganization(id, { page: 0, size: 20 }).catch(() => ({ items: [] })),
    ])
      .then(([orgData, trainData, chalData]) => {
        if (!active) return;
        setOrganization(orgData);
        setTrainings(trainData.items || []);
        setChallenges(chalData.items || []);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Failed to load organization profile'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="py-32 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Alert type="error" message={error || 'Organization not found'} />
        <div className="mt-6 text-center">
          <Link
            to="/organizations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} /> Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <div className="mb-6">
        <Link
          to="/organizations"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} /> Back to Organizations
        </Link>
      </div>

      {/* Header Profile Banner */}
      <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.innerHTML = `<span class="text-blue-600 font-extrabold text-3xl">${organization.name?.charAt(0) || 'O'}</span>`;
                }}
              />
            ) : (
              <span className="text-blue-600 font-extrabold text-3xl">
                {organization.name?.charAt(0) || 'O'}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {organization.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <ShieldCheck size={13} /> Verified Partner
              </span>
            </div>

            <div className="flex items-center gap-5 mt-3 text-xs sm:text-sm text-gray-500 flex-wrap">
              {organization.ownerName && (
                <span className="flex items-center gap-1.5 font-medium text-gray-700">
                  <User size={15} className="text-gray-400" /> Lead: {organization.ownerName}
                </span>
              )}
              {organization.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={15} className="text-gray-400" /> Joined {new Date(organization.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
              {organization.email && (
                <a
                  href={`mailto:${organization.email}`}
                  className="flex items-center gap-1.5 text-blue-600 hover:underline"
                >
                  <Mail size={14} /> {organization.email}
                </a>
              )}
              {organization.phone && (
                <a
                  href={`tel:${organization.phone}`}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
                >
                  <Phone size={14} /> {organization.phone}
                </a>
              )}
              {organization.location && (
                <span className="flex items-center gap-1.5 text-gray-600">
                  <MapPin size={14} className="text-gray-400" /> {organization.location}
                </span>
              )}
              {organization.website && (
                <a
                  href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-blue-600 hover:underline"
                >
                  <Globe size={14} /> Website
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-gray-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            About & Overview
          </button>
          <button
            onClick={() => setActiveTab('trainings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'trainings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BookOpen size={15} />
            Trainings & Workshops ({trainings.length})
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'challenges'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Trophy size={15} />
            Innovation Challenges ({challenges.length})
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xs border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">About the Organization</h2>
            {organization.description ? (
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {organization.description}
              </p>
            ) : (
              <p className="text-gray-400 italic text-sm">No detailed description has been provided.</p>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Organization Snapshot
              </h3>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Trainings Hosted</span>
                  <span className="font-bold text-gray-900">{trainings.length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Challenges Posted</span>
                  <span className="font-bold text-gray-900">{challenges.length}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Ecosystem Status</span>
                  <span className="font-bold text-emerald-600">Active Organization</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {(organization.facebook || organization.twitter || organization.linkedin || organization.instagram) && (
              <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  Connect & Follow
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  {organization.facebook && (
                    <a
                      href={organization.facebook.startsWith('http') ? organization.facebook : `https://${organization.facebook}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition border border-blue-200"
                    >
                      <ExternalLink size={14} /> Facebook
                    </a>
                  )}
                  {organization.twitter && (
                    <a
                      href={organization.twitter.startsWith('http') ? organization.twitter : `https://${organization.twitter}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-50 text-sky-700 text-xs font-semibold hover:bg-sky-100 transition border border-sky-200"
                    >
                      <ExternalLink size={14} /> Twitter / X
                    </a>
                  )}
                  {organization.linkedin && (
                    <a
                      href={organization.linkedin.startsWith('http') ? organization.linkedin : `https://${organization.linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition border border-indigo-200"
                    >
                      <ExternalLink size={14} /> LinkedIn
                    </a>
                  )}
                  {organization.instagram && (
                    <a
                      href={organization.instagram.startsWith('http') ? organization.instagram : `https://${organization.instagram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-pink-50 text-pink-700 text-xs font-semibold hover:bg-pink-100 transition border border-pink-200"
                    >
                      <ExternalLink size={14} /> Instagram
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'trainings' && (
        <div>
          {trainings.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No trainings scheduled"
              message="This organization has not published any public training programs yet."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainings.map((t) => (
                <TrainingCard key={t.id} training={t} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div>
          {challenges.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No challenges active"
              message="This organization does not have any ongoing innovation challenges at this time."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((c) => (
                <ChallengeCard key={c.id} challenge={c} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}