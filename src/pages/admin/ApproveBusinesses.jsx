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
import { CheckCircle, XCircle, MapPin, Eye, Building2, Search, User as UserIcon, Trash2 } from 'lucide-react';

const FILTERS = [
  { key: 'PENDING', label: 'Pending Review' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'ALL', label: 'All Businesses' },
];

const badgeColors = {
  APPROVED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  INACTIVE: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function ApproveBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Action Dialog State
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null); // 'APPROVE' | 'REJECT'
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = {
      page,
      size: 8,
      sortBy: 'createdAt',
      sortDir: 'desc',
    };

    if (filter !== 'ALL') {
      params.status = filter;
    }
    if (search.trim()) {
      params.search = search.trim();
    }

    try {
      const data = await businessApi.adminList(params);
      setBusinesses(data.items);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load businesses for review'));
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleActionClick = (biz, type) => {
    setActionTarget(biz);
    setActionType(type);
    setRejectReason('');
  };

  const handleConfirmAction = async () => {
    if (!actionTarget || !actionType) return;
    setActionLoading(true);

    try {
      if (actionType === 'APPROVE') {
        await businessApi.approve(actionTarget.id);
        toast.success(`Business "${actionTarget.name}" has been approved!`);
      } else if (actionType === 'REJECT') {
        if (rejectReason.trim()) {
          await businessApi.updateStatus(actionTarget.id, 'REJECTED', rejectReason.trim());
        } else {
          await businessApi.updateStatus(actionTarget.id, 'REJECTED');
        }
        toast.success(`Business "${actionTarget.name}" has been rejected.`);
      }
      setActionTarget(null);
      setActionType(null);
      setRejectReason('');
      fetchBusinesses();
    } catch (err) {
      toast.error(getErrorMessage(err, `Failed to ${actionType.toLowerCase()} business`));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await businessApi.remove(deleteTarget.id);
      toast.success(`Business "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchBusinesses();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete business'));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <CheckCircle className="text-blue-600" size={28} />
            Business Verification & Approval
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review entrepreneur submissions and grant marketplace approval
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 sm:p-5 mb-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setFilter(f.key);
                  setPage(0);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filter === f.key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search submissions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs transition"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-20">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : businesses.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={
            filter === 'PENDING'
              ? 'No businesses pending review'
              : 'No businesses found'
          }
          message={
            filter === 'PENDING'
              ? 'All entrepreneur business submissions have been reviewed.'
              : 'No businesses match the selected status filter.'
          }
        />
      ) : (
        <div className="space-y-4">
          {businesses.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 sm:p-6 transition hover:shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-lg">{b.name}</h3>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        badgeColors[b.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {b.description && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2 leading-relaxed">
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
                    {b.ownerName && (
                      <span className="flex items-center gap-1">
                        <UserIcon size={13} className="text-gray-400" /> Submitted by: <strong>{b.ownerName}</strong>
                      </span>
                    )}
                    {b.email && <span>Email: {b.email}</span>}
                    {b.phone && <span>Phone: {b.phone}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-start pt-2 md:pt-0 border-t md:border-0 border-gray-100 w-full md:w-auto justify-end">
                  <Link
                    to={`/businesses/${b.id}`}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                    title="View details"
                  >
                    <Eye size={18} />
                  </Link>

                  {b.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleActionClick(b, 'APPROVE')}
                        className="flex items-center gap-1.5 bg-green-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-green-700 shadow-xs transition"
                      >
                        <CheckCircle size={15} /> Approve
                      </button>
                      <button
                        onClick={() => handleActionClick(b, 'REJECT')}
                        className="flex items-center gap-1.5 bg-red-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-red-700 shadow-xs transition"
                      >
                        <XCircle size={15} /> Reject
                      </button>
                    </>
                  ) : b.status === 'APPROVED' ? (
                    <button
                      onClick={() => handleActionClick(b, 'REJECT')}
                      className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1.5 border border-red-200 hover:bg-red-50 rounded-xl transition"
                    >
                      Revoke Approval
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActionClick(b, 'APPROVE')}
                      className="text-xs text-green-600 hover:text-green-700 font-medium px-3 py-1.5 border border-green-200 hover:bg-green-50 rounded-xl transition"
                    >
                      Approve Business
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget(b)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                    title="Delete business"
                    aria-label={`Delete ${b.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
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

      {/* Action Confirmation Modal (Approve) */}
      <ConfirmDialog
        open={actionTarget !== null && actionType === 'APPROVE'}
        title={`Approve "${actionTarget?.name}"`}
        message={`Are you sure you want to approve "${actionTarget?.name}"? This business will become publicly discoverable in the ZIEE marketplace.`}
        confirmLabel="Approve Business"
        onConfirm={handleConfirmAction}
        onCancel={() => { setActionTarget(null); setActionType(null); }}
        loading={actionLoading}
      />

      {/* Rejection Reason Modal */}
      {actionTarget && actionType === 'REJECT' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true" aria-label="Reject business">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Reject "{actionTarget.name}"</h2>
            <p className="text-sm text-gray-500 mb-4">
              Optionally provide a reason for rejection. The entrepreneur will be notified.
            </p>
            <div className="mb-4">
              <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700 mb-1.5">Rejection Reason (optional)</label>
              <textarea
                id="reject-reason"
                rows={4}
                maxLength={500}
                placeholder="e.g. Incomplete information, invalid documents..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{rejectReason.length}/500</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setActionTarget(null); setActionType(null); setRejectReason(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Business'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Business"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Business"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
