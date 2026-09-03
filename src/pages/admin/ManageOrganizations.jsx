import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/services';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import { Building, Trash2, Mail, Phone, Search, Eye, MapPin, Globe } from 'lucide-react';

export default function ManageOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchOrganizations = useCallback(() => {
    setLoading(true);
    setError('');
    const params = { page, size: 12, sortBy: 'createdAt', sortDir: 'desc' };
    if (search.trim()) params.search = search.trim();

    adminApi.getOrganizations(params)
      .then(data => {
        setOrganizations(data.items);
        setTotalPages(data.totalPages);
      })
      .catch(err => setError(getErrorMessage(err, 'Failed to load organizations')))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetchOrganizations(); }, [fetchOrganizations]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(input);
    setPage(0);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteOrganization(deleteTarget.id);
      toast.success(`Organization "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchOrganizations();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete organization'));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Building size={24} className="text-gray-700" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-900">Manage Organizations</h1>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search organizations..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Search organizations"
            />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : organizations.length === 0 ? (
        <EmptyState
          icon={Building}
          title={search ? 'No matching organizations' : 'No organizations found'}
          message={search ? `No organizations matching "${search}".` : 'No organizations have been created yet.'}
          action={search ? (
            <button onClick={() => { setInput(''); setSearch(''); setPage(0); }} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              Clear Search
            </button>
          ) : null}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map(o => (
              <div key={o.id} className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {o.logoUrl ? (
                        <img
                          src={o.logoUrl}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Building size={18} className="text-purple-600" />
                        </div>
                      )}
                      <h3 className="font-semibold text-gray-900 text-lg truncate">{o.name}</h3>
                    </div>
                    {o.description && <p className="text-gray-600 text-sm mt-1 line-clamp-2">{o.description}</p>}
                    <div className="mt-3 space-y-1">
                      {o.location && (
                        <p className="text-sm text-gray-500 flex items-center gap-1.5">
                          <MapPin size={14} aria-hidden="true" /> {o.location}
                        </p>
                      )}
                      {o.email && (
                        <p className="text-sm text-gray-500 flex items-center gap-1.5">
                          <Mail size={14} aria-hidden="true" /> {o.email}
                        </p>
                      )}
                      {o.phone && (
                        <p className="text-sm text-gray-500 flex items-center gap-1.5">
                          <Phone size={14} aria-hidden="true" /> {o.phone}
                        </p>
                      )}
                      {o.website && (
                        <p className="text-sm text-gray-500 flex items-center gap-1.5 truncate">
                          <Globe size={14} aria-hidden="true" /> {o.website}
                        </p>
                      )}
                      {o.ownerName && (
                        <p className="text-sm text-gray-400">Owner: {o.ownerName}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  <Link
                    to={`/organizations/${o.id}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                  >
                    <Eye size={14} /> View
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(o)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition ml-auto"
                    aria-label={`Delete ${o.name}`}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Organization"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? All associated trainings and challenges may also be affected.`}
        confirmLabel="Delete Organization"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
