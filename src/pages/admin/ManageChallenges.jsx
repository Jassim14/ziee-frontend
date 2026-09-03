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
import { Trophy, Search, Eye, Trash2, Clock } from 'lucide-react';

const STATUS_FILTERS = ['ALL', 'OPEN', 'CLOSED', 'DRAFT'];

export default function ManageChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchChallenges = useCallback(() => {
    setLoading(true);
    setError('');
    const params = { page, size: 10, sortBy: 'createdAt', sortDir: 'desc' };
    if (search.trim()) params.search = search.trim();
    if (statusFilter !== 'ALL') params.status = statusFilter;

    adminApi.getChallenges(params)
      .then(data => {
        setChallenges(data.items);
        setTotalPages(data.totalPages);
      })
      .catch(err => setError(getErrorMessage(err, 'Failed to load challenges')))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(input);
    setPage(0);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteChallenge(deleteTarget.id);
      toast.success(`Challenge "${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      fetchChallenges();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete challenge'));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Trophy size={24} className="text-gray-700" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-900">Manage Challenges</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search challenges..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Search challenges"
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
      ) : challenges.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={search || statusFilter !== 'ALL' ? 'No matching challenges' : 'No challenges found'}
          message="No challenges match the current filters."
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
                    <th className="text-left px-5 py-3 font-medium text-gray-600 hidden md:table-cell">Deadline</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {challenges.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900 truncate max-w-xs">{c.title}</p>
                        {c.prizes && <span className="text-xs text-amber-600 font-medium">Prize available</span>}
                      </td>
                      <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{c.organizationName || '—'}</td>
                      <td className="px-5 py-3 text-gray-500 hidden md:table-cell">
                        {c.deadline ? (
                          <span className="flex items-center gap-1">
                            <Clock size={13} aria-hidden="true" />
                            {new Date(c.deadline).toLocaleDateString()}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Link
                            to={`/challenges/${c.id}`}
                            className="p-2 text-gray-400 hover:text-amber-600 transition rounded-lg hover:bg-amber-50"
                            title="View details"
                            aria-label={`View challenge: ${c.title}`}
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="p-2 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-red-50"
                            title="Delete"
                            aria-label={`Delete challenge: ${c.title}`}
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
        title="Delete Challenge"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This will remove all associated applications.`}
        confirmLabel="Delete Challenge"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
