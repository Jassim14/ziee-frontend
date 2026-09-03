import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { businessApi } from '../../api/services';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, MapPin, Eye, Building2, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';

const statusConfig = {
  APPROVED: {
    style: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle2,
    label: 'Approved & Live',
    message: 'Your business is visible to public customers across the ecosystem.',
  },
  PENDING: {
    style: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
    label: 'Pending Approval',
    message: 'Submitted for verification. An administrator will review your profile shortly.',
  },
  REJECTED: {
    style: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
    label: 'Rejected',
    message: 'This submission did not meet verification criteria. You may edit and update the profile details.',
  },
  INACTIVE: {
    style: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: AlertCircle,
    label: 'Inactive',
    message: 'This business is currently deactivated.',
  },
};

export default function MyBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete Confirm Dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyBusinesses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await businessApi.getMy({ page, size: 6, sortBy: 'createdAt', sortDir: 'desc' });
      setBusinesses(data.items);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load your businesses'));
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchMyBusinesses();
  }, [fetchMyBusinesses]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await businessApi.remove(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" has been deleted.`);
      setDeleteTarget(null);
      fetchMyBusinesses();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete business'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Businesses</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your registered businesses, update profile details, and track approval status
          </p>
        </div>
        <Link
          to="/business/new"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-xs transition flex items-center gap-2"
        >
          <Plus size={18} /> Register Business
        </Link>
      </div>

      {loading ? (
        <div className="py-20">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : businesses.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No businesses registered yet"
          message="Create your first business profile to get discovered by customers and participate in ecosystem programs."
          action={
            <Link
              to="/business/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              <Plus size={18} /> Register Business
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {businesses.map((b) => {
            const conf = statusConfig[b.status] || statusConfig.PENDING;
            const StatusIcon = conf.icon;

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 sm:p-6 transition hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-xl">{b.name}</h3>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${conf.style}`}
                      >
                        <StatusIcon size={13} />
                        {conf.label}
                      </span>
                    </div>

                    {b.status === 'REJECTED' && (
                      <div className="mt-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                        <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Action Required</p>
                          <p className="mt-0.5">{conf.message}</p>
                        </div>
                      </div>
                    )}

                    {b.description && (
                      <p className="text-gray-600 text-sm mt-2.5 line-clamp-2 leading-relaxed">
                        {b.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
                      {b.categoryName && (
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md font-medium">
                          {b.categoryName}
                        </span>
                      )}
                      {b.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-gray-400" /> {b.location}
                        </span>
                      )}
                      {b.phone && <span>Phone: {b.phone}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-start pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 w-full sm:w-auto justify-end">
                    <Link
                      to={`/businesses/${b.id}`}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      title="View public profile"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      to={`/businesses/${b.id}/edit`}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      title="Edit business profile"
                    >
                      <Edit2 size={18} />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(b)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Delete business"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Business"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone and will remove all associated gallery images and reviews.`}
        confirmLabel="Delete Business"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
