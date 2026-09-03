import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/services';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';
import { BookOpen, Search, Eye, Trash2, Calendar } from 'lucide-react';

const STATUS_FILTERS = ['ALL', 'PUBLISHED', 'DRAFT', 'CLOSED'];

export default function ManageTrainings() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTrainings = useCallback(() => {
    setLoading(true);
    setError('');
    const params = { page, size: 10, sortBy: 'createdAt', sortDir: 'desc' };
    if (search.trim()) params.search = search.trim();
    if (statusFilter !== 'ALL') params.status = statusFilter;

    adminApi.getTrainings(params)
      .then(data => {
        setTrainings(data.items);
        setTotalPages(data.totalPages);
      })
      .catch(err => setError(getErrorMessage(err, 'Failed to load trainings')))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => { fetchTrainings(); }, [fetchTrainings]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(input);
    setPage(0);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteTraining(deleteTarget.id);
      toast.success(`Training "${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      fetchTrainings();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete training'));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen size={24} className="text-gray-700" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-900">Manage Trainings</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search trainings..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Search trainings"
            />
          </div>
          <select
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            aria-label="Filter by status"
          >
            {STATUS_FILTERS.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
          </select>
          <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm">
            Search
          </button>
        </form>
      </div>

      {/* Content */}
      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : trainings.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={search || statusFilter !== 'ALL' ? 'No matching trainings' : 'No trainings found'}
          message="No trainings match the current filters."
          action={(search || statusFilter !== 'ALL') ? (
            <button onClick={() => { setInput(''); setSearch(''); setStatusFilter('ALL'); setPage(0); }} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              Clear Filters
            </button>
          ) : null}
        />
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Title</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600 hidden sm:table-cell">Organization</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600 hidden md:table-cell">Date</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {trainings.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900 truncate max-w-xs">{t.title}</p>
                        {t.type && <span className="text-xs text-gray-500">{t.type}</span>}
                      </td>
                      <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{t.organizationName || '—'}</td>
                      <td className="px-5 py-3 text-gray-500 hidden md:table-cell">
                        {t.startDate ? (
                          <span className="flex items-center gap-1">
                            <Calendar size={13} aria-hidden="true" />
                            {new Date(t.startDate).toLocaleDateString()}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={t.publicationStatus || t.status} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Link
                            to={`/trainings/${t.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"
                            title="View details"
                            aria-label={`View training: ${t.title}`}
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(t)}
                            className="p-2 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-red-50"
                            title="Delete"
                            aria-label={`Delete training: ${t.title}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Training"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This will remove all associated registrations.`}
        confirmLabel="Delete Training"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
