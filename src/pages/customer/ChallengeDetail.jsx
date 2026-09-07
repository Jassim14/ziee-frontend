import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { challengeApi } from '../../api/services';
import StatusBadge from '../../components/StatusBadge';
import LoginPromptModal from '../../components/LoginPromptModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import getErrorMessage from '../../utils/errors';
import toast from 'react-hot-toast';
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  Building,
  ArrowLeft,
  Award,
  CheckCircle2,
  AlertTriangle,
  X,
  Send,
  FileText,
} from 'lucide-react';

export default function ChallengeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();

  const [challenge, setChallenge] = useState(null);
  const [myApplication, setMyApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Apply Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [motivation, setMotivation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Cancel Dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Login prompt
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const fetchChallengeData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const chalData = await challengeApi.get(id);
      setChallenge(chalData);

      if (user) {
        const appData = await challengeApi.getMyApplicationForChallenge(id);
        setMyApplication(appData);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load challenge details'));
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchChallengeData();
  }, [fetchChallengeData]);

  const handleOpenApply = () => {
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }
    setMotivation('');
    setApplyError('');
    setApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setApplyError('');
    setSubmitting(true);

    try {
      const res = await challengeApi.apply(id, motivation.trim() || undefined);
      setMyApplication(res);
      setApplyModalOpen(false);
      toast.success('Challenge application submitted successfully!');
    } catch (err) {
      setApplyError(getErrorMessage(err, 'Failed to submit challenge application'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await challengeApi.cancelApplication(id);
      setMyApplication(null);
      setCancelDialogOpen(false);
      toast.success('Your application has been cancelled.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to cancel application'));
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

  if (error || !challenge) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Alert type="error" message={error || 'Challenge not found'} />
        <div className="mt-6 text-center">
          <Link
            to="/challenges"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} /> Back to Challenges
          </Link>
        </div>
      </div>
    );
  }

  const isDeadlinePassed = challenge.deadline && new Date(challenge.deadline) < new Date();
  const isOpen = (challenge.status === 'OPEN' || !challenge.status) && !isDeadlinePassed;
  const isApplied = Boolean(myApplication && myApplication.status !== 'CANCELLED');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/challenges"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} /> Back to Challenges
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner */}
          <div className="bg-white rounded-3xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="h-64 sm:h-80 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 relative flex items-center justify-center">
              {challenge.imageUrl ? (
                <img
                  src={challenge.imageUrl}
                  alt={challenge.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <Trophy size={96} className="text-white/20" />
              )}

              <div className="absolute top-4 right-4">
                <StatusBadge status={challenge.status || 'OPEN'} className="bg-white/90 shadow-xs" />
              </div>

              {challenge.prizes && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-xs text-amber-300 text-xs sm:text-sm font-bold px-4 py-2 rounded-2xl border border-amber-400/30">
                  <Award size={16} />
                  <span>Prizes & Incubation: {challenge.prizes}</span>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              {/* Organization */}
              {challenge.organizationName && (
                <p className="text-sm font-semibold text-blue-600 flex items-center gap-1.5 mb-2">
                  <Building size={16} />
                  <span>Organized by {challenge.organizationName}</span>
                </p>
              )}

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                {challenge.title}
              </h1>

              {/* Description */}
              <div className="pt-6 border-t border-gray-100">
                <h2 className="text-base font-bold text-gray-900 mb-3">Challenge Brief & Objectives</h2>
                {challenge.description ? (
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                    {challenge.description}
                  </p>
                ) : (
                  <p className="text-gray-400 italic text-sm">No description provided.</p>
                )}
              </div>

              {/* Requirements */}
              {challenge.requirements && (
                <div className="pt-6 mt-6 border-t border-gray-100">
                  <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    Eligibility & Submission Requirements
                  </h2>
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                    {challenge.requirements}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6 space-y-6">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Application Status
            </h3>

            {isApplied ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-900">Your Status:</span>
                  <StatusBadge status={myApplication.status} />
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {myApplication.status === 'PENDING'
                    ? 'Your pitch proposal has been received and is currently under evaluation by the jury panel.'
                    : myApplication.status === 'ACCEPTED'
                    ? 'Congratulations! Your application has been accepted to the challenge shortlist.'
                    : myApplication.status === 'REJECTED'
                    ? 'Thank you for your submission. Your application was not selected for this cohort.'
                    : 'Your application status has been updated.'}
                </p>

                {myApplication.motivation && (
                  <div className="p-2.5 bg-white/80 rounded-xl text-xs text-gray-600 border border-amber-200">
                    <p className="font-semibold text-gray-800 mb-0.5">Submitted Motivation:</p>
                    <p className="line-clamp-3">{myApplication.motivation}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setCancelDialogOpen(true)}
                  className="w-full text-xs font-semibold text-red-600 hover:text-red-700 p-2 border border-red-200 bg-white hover:bg-red-50 rounded-xl transition"
                >
                  Withdraw Application
                </button>
              </div>
            ) : (
              <div>
                {!isOpen ? (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 mb-4">
                    <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Challenge Applications Closed</p>
                      <p className="mt-0.5">This competition is currently closed for new proposal entries.</p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenApply}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    Apply for Challenge
                  </button>
                )}
              </div>
            )}

            {/* Metadata list */}
            <div className="space-y-4 pt-4 border-t border-gray-100 text-xs sm:text-sm">
              {challenge.deadline && (
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">Application Deadline</p>
                    <p className={isDeadlinePassed ? 'text-red-500 font-semibold mt-0.5' : 'text-gray-500 mt-0.5'}>
                      {new Date(challenge.deadline).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {challenge.maxParticipants && (
                <div className="flex items-start gap-3">
                  <Users size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">Max Teams / Innovators</p>
                    <p className="text-gray-500 mt-0.5">{challenge.maxParticipants} slots available</p>
                  </div>
                </div>
              )}

              {challenge.prizes && (
                <div className="flex items-start gap-3">
                  <Award size={18} className="text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">Award Packages</p>
                    <p className="text-gray-500 mt-0.5">{challenge.prizes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Submission Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-extrabold text-gray-900">
                Apply for Challenge
              </h3>
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Submitting for: <strong className="text-gray-800">{challenge.title}</strong>
            </p>

            {applyError && <Alert type="error" message={applyError} />}

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Motivation & Solution Pitch Note (Optional)
                </label>
                <textarea
                  rows={5}
                  maxLength={1000}
                  placeholder="Describe your solution idea, team background, and why your innovation is suited for this challenge..."
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none transition"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px] text-gray-400">
                    {motivation.length} / 1000 characters
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xs transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Send size={15} />
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest Login Prompt */}
      <LoginPromptModal
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        message="Please sign in with your ZIEE account to apply for this innovation challenge."
        returnTo={location.pathname}
      />

      {/* Cancel Confirm Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        title="Withdraw Challenge Application"
        message="Are you sure you want to withdraw your application for this challenge? This action cannot be undone."
        confirmLabel="Withdraw Application"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelDialogOpen(false)}
        loading={cancelling}
      />
    </div>
  );
}