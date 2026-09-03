import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { challengeApi } from '../../api/services';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import getErrorMessage from '../../utils/errors';
import toast from 'react-hot-toast';
import { Trophy, Calendar, ArrowRight, Clock, FileText } from 'lucide-react';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancel dialog
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await challengeApi.getMyApplications({ page, size: 8 });
      setApplications(data.items);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load your challenge applications'));
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);

    try {
      await challengeApi.cancelApplication(cancelTarget.challengeId);
      toast.success('Application withdrawn.');
      setCancelTarget(null);
      fetchApplications();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to withdraw application'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          <Trophy className="text-amber-600" size={28} />
          My Challenge Applications
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Review your pitch proposals and status across innovation competitions
        </p>
      </div>

      {loading ? (
        <div className="py-24">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No challenge applications yet"
          message="Compete for prizes and incubation support by applying to open innovation challenges."
          action={
            <Link
              to="/challenges"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              <Trophy size={16} /> Explore Challenges
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 sm:p-6 transition hover:shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link
                      to={`/challenges/${app.challengeId}`}
                      className="font-bold text-gray-900 text-lg hover:text-blue-600 transition"
                    >
                      {app.challengeTitle}
                    </Link>
                    <StatusBadge status={app.status} />
                  </div>

                  {app.motivation && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700">
                      <p className="font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                        <FileText size={13} className="text-gray-500" /> Pitch & Motivation:
                      </p>
                      <p className="line-clamp-3 leading-relaxed">{app.motivation}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
                    {app.appliedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-gray-400" />
                        Submitted on {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    )}
                    {app.status === 'PENDING' && (
                      <span className="text-amber-600 flex items-center gap-1 font-medium">
                        <Clock size={13} /> Under review by challenge jury
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 w-full sm:w-auto justify-end">
                  <Link
                    to={`/challenges/${app.challengeId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl transition"
                  >
                    View Challenge <ArrowRight size={13} />
                  </Link>

                  {app.status !== 'CANCELLED' && (
                    <button
                      onClick={() => setCancelTarget(app)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 transition"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Cancel Confirm Dialog */}
      <ConfirmDialog
        open={cancelTarget !== null}
        title="Withdraw Application"
        message={`Are you sure you want to withdraw your application for "${cancelTarget?.challengeTitle}"?`}
        confirmLabel="Withdraw Application"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
        loading={cancelling}
      />
    </div>
  );
}