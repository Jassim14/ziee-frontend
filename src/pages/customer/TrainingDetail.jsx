import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { trainingApi } from '../../api/services';
import StatusBadge from '../../components/StatusBadge';
import LoginPromptModal from '../../components/LoginPromptModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import getErrorMessage from '../../utils/errors';
import toast from 'react-hot-toast';
import {
  Calendar,
  MapPin,
  Globe,
  Clock,
  Users,
  Building,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export default function TrainingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [training, setTraining] = useState(null);
  const [myRegistration, setMyRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Actions
  const [submitting, setSubmitting] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const fetchTrainingData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const trainData = await trainingApi.get(id);
      setTraining(trainData);

      if (user) {
        const regData = await trainingApi.getMyRegistrationForTraining(id);
        setMyRegistration(regData);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load training details'));
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchTrainingData();
  }, [fetchTrainingData]);

  const handleRegister = async () => {
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await trainingApi.register(id);
      setMyRegistration(res);
      toast.success('Registration submitted! Status: PENDING review by organizer.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to submit registration'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await trainingApi.cancelRegistration(id);
      setMyRegistration(null);
      setCancelDialogOpen(false);
      toast.success('Your registration has been cancelled.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to cancel registration'));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Alert type="error" message={error || 'Training program not found'} />
        <div className="mt-6 text-center">
          <Link
            to="/trainings"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} /> Back to Trainings
          </Link>
        </div>
      </div>
    );
  }

  const isOnline = training.type?.toUpperCase() === 'ONLINE';
  const isHybrid = training.type?.toUpperCase() === 'HYBRID';
  const isDeadlinePassed = training.registrationDeadline && new Date(training.registrationDeadline) < new Date();
  const isRegistered = Boolean(myRegistration && myRegistration.status !== 'CANCELLED');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/trainings"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} /> Back to All Trainings
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner Image */}
          <div className="bg-white rounded-3xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="h-64 sm:h-80 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-900 relative flex items-center justify-center">
              {training.imageUrl ? (
                <img
                  src={training.imageUrl}
                  alt={training.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="text-white/20 text-8xl font-black select-none">ZIEE</div>
              )}

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                  {isOnline ? <Globe size={14} /> : <MapPin size={14} />}
                  <span>{training.type || 'IN_PERSON'}</span>
                </span>
              </div>

              <div className="absolute top-4 right-4">
                <StatusBadge status={training.publicationStatus || training.status || 'PUBLISHED'} className="bg-white/90 shadow-xs" />
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* Organization */}
              {training.organizationName && (
                <p className="text-sm font-semibold text-blue-600 flex items-center gap-1.5 mb-2">
                  <Building size={16} />
                  <span>Organized by {training.organizationName}</span>
                </p>
              )}

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                {training.title}
              </h1>

              {training.provider && (
                <p className="text-xs text-gray-500 mb-6">
                  Trainer / Facilitator: <strong className="text-gray-700">{training.provider}</strong>
                </p>
              )}

              {/* Description */}
              <div className="pt-6 border-t border-gray-100">
                <h2 className="text-base font-bold text-gray-900 mb-3">About this Training</h2>
                {training.description ? (
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                    {training.description}
                  </p>
                ) : (
                  <p className="text-gray-400 italic text-sm">No detailed description provided.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Details & Registration Action (1 col) */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6 space-y-6">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Registration Status
            </h3>

            {isRegistered ? (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-900">Your Status:</span>
                  <StatusBadge status={myRegistration.status} />
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  {myRegistration.status === 'PENDING'
                    ? 'Your registration is currently under review by the hosting organization.'
                    : myRegistration.status === 'APPROVED'
                    ? 'Congratulations! Your seat has been approved for this training.'
                    : myRegistration.status === 'ATTENDED'
                    ? 'Attendance recorded for this workshop.'
                    : 'Your registration status has been updated.'}
                </p>
                <button
                  type="button"
                  onClick={() => setCancelDialogOpen(true)}
                  className="w-full text-xs font-semibold text-red-600 hover:text-red-700 p-2 border border-red-200 bg-white hover:bg-red-50 rounded-xl transition"
                >
                  Cancel My Registration
                </button>
              </div>
            ) : (
              <div>
                {isDeadlinePassed ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2 mb-4">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Registration Deadline Passed</p>
                      <p className="mt-0.5">This training program is no longer accepting new participant applications.</p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 size={18} />
                    {submitting ? 'Submitting registration...' : 'Register for Training'}
                  </button>
                )}
              </div>
            )}

            {/* Key Schedule Metadata */}
            <div className="space-y-4 pt-4 border-t border-gray-100 text-xs sm:text-sm">
              {training.startDate && (
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">Start Date & Time</p>
                    <p className="text-gray-500 mt-0.5">
                      {new Date(training.startDate).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {training.endDate && (
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">End Date & Time</p>
                    <p className="text-gray-500 mt-0.5">
                      {new Date(training.endDate).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {training.registrationDeadline && (
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">Registration Deadline</p>
                    <p className={isDeadlinePassed ? 'text-red-500 font-semibold' : 'text-gray-500'}>
                      {new Date(training.registrationDeadline).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {training.capacity && (
                <div className="flex items-start gap-3">
                  <Users size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">Capacity & Seats</p>
                    <p className="text-gray-500 mt-0.5">{training.capacity} participants maximum</p>
                  </div>
                </div>
              )}

              {training.location && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">Venue / Location</p>
                    <p className="text-gray-500 mt-0.5">{training.location}</p>
                  </div>
                </div>
              )}

              {training.link && isRegistered && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="font-bold text-emerald-900 text-xs mb-1">Online Meeting Link:</p>
                  <a
                    href={training.link.startsWith('http') ? training.link : `https://${training.link}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 break-all"
                  >
                    <span>{training.link}</span>
                    <ExternalLink size={12} className="shrink-0" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guest Login Prompt Modal */}
      <LoginPromptModal
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        message="Sign in with your ZIEE account to register for this training workshop and track your participation status."
        returnTo={location.pathname}
      />

      {/* Cancel Registration Confirm Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        title="Cancel Registration"
        message="Are you sure you want to cancel your registration for this training? Your reserved seat will be released."
        confirmLabel="Cancel Registration"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelDialogOpen(false)}
        loading={cancelling}
      />
    </div>
  );
}