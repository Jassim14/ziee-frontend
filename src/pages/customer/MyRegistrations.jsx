import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { trainingApi } from '../../api/services';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import getErrorMessage from '../../utils/errors';
import toast from 'react-hot-toast';
import { BookOpen, Calendar, Trash2, ArrowRight, Clock, AlertCircle } from 'lucide-react';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancel dialog
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await trainingApi.getMyRegistrations({ page, size: 8 });
      setRegistrations(data.items);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load your training registrations'));
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);

    try {
      await trainingApi.cancelRegistration(cancelTarget.trainingId);
      toast.success('Registration cancelled successfully.');
      setCancelTarget(null);
      fetchRegistrations();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to cancel registration'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          <BookOpen className="text-blue-600" size={28} />
          My Training Registrations
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Track the status of your workshop and capacity building program applications
        </p>
      </div>

      {loading ? (
        <div className="py-24">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No training registrations yet"
          message="Browse through our verified capacity building workshops and register to expand your skills."
          action={
            <Link
              to="/trainings"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              <BookOpen size={16} /> Explore Trainings
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {registrations.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 sm:p-6 transition hover:shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link
                      to={`/trainings/${r.trainingId}`}
                      className="font-bold text-gray-900 text-lg hover:text-blue-600 transition"
                    >
                      {r.trainingTitle}
                    </Link>
                    <StatusBadge status={r.status} />
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
                    {r.registeredAt && (
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-gray-400" />
                        Registered on {new Date(r.registeredAt).toLocaleDateString()}
                      </span>
                    )}
                    {r.status === 'PENDING' && (
                      <span className="text-amber-600 flex items-center gap-1 font-medium">
                        <Clock size={13} /> Awaiting host review
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 w-full sm:w-auto justify-end">
                  <Link
                    to={`/trainings/${r.trainingId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl transition"
                  >
                    View Details <ArrowRight size={13} />
                  </Link>

                  {r.status !== 'CANCELLED' && (
                    <button
                      onClick={() => setCancelTarget(r)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 transition"
                    >
                      Cancel
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
        title="Cancel Training Registration"
        message={`Are you sure you want to cancel your registration for "${cancelTarget?.trainingTitle}"?`}
        confirmLabel="Cancel Registration"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
        loading={cancelling}
      />
    </div>
  );
}