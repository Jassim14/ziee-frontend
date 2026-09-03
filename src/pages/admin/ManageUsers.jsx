import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/services';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import { Search, UserCog, Trash2, Ban, CheckCircle, Eye, X, ShieldCheck } from 'lucide-react';

const ROLES = ['ALL', 'ADMIN', 'ENTREPRENEUR', 'CUSTOMER', 'ORGANIZATION'];
const STATUSES = ['ALL', 'ACTIVE', 'INACTIVE'];
const CHANGEABLE_ROLES = ['ADMIN', 'ENTREPRENEUR', 'CUSTOMER', 'ORGANIZATION'];

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // View detail modal
  const [viewUser, setViewUser] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewData, setViewData] = useState(null);

  // Change role modal
  const [roleTarget, setRoleTarget] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [roleSaving, setRoleSaving] = useState(false);

  // Confirm dialogs
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError('');
    const params = { page, size: 10 };
    if (search) params.search = search;
    if (role !== 'ALL') params.role = role;
    if (status !== 'ALL') params.status = status;

    adminApi.getUsers(params)
      .then(data => {
        setUsers(data.items);
        setTotalPages(data.totalPages);
      })
      .catch(err => setError(getErrorMessage(err, 'Failed to load users')))
      .finally(() => setLoading(false));
  }, [search, role, status, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(input);
    setPage(0);
  };

  // View user detail
  const openViewUser = async (user) => {
    setViewUser(user);
    setViewLoading(true);
    setViewData(null);
    try {
      const detail = await adminApi.getUser(user.id);
      setViewData(detail);
    } catch {
      setViewData(user);
    } finally {
      setViewLoading(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    setStatusSaving(true);
    const newStatus = statusTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminApi.updateUserStatus(statusTarget.id, newStatus);
      setUsers(users.map(u => u.id === statusTarget.id ? { ...u, status: newStatus } : u));
      toast.success(`User ${newStatus.toLowerCase()}`);
      setStatusTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update status'));
    } finally {
      setStatusSaving(false);
    }
  };

  // Delete user
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSaving(true);
    try {
      await adminApi.deleteUser(deleteTarget.id);
      setUsers(users.filter(u => u.id !== deleteTarget.id));
      toast.success('User deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete user'));
    } finally {
      setDeleteSaving(false);
    }
  };

  // Change role
  const openChangeRole = (user) => {
    setRoleTarget(user);
    setNewRole(user.role);
  };

  const handleRoleChange = async () => {
    if (!roleTarget || newRole === roleTarget.role) return;
    setRoleSaving(true);
    try {
      await adminApi.updateUserRole(roleTarget.id, newRole);
      setUsers(users.map(u => u.id === roleTarget.id ? { ...u, role: newRole } : u));
      toast.success(`Role changed to ${newRole}`);
      setRoleTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to change role'));
    } finally {
      setRoleSaving(false);
    }
  };

  const roleBadge = (r) => ({
    ADMIN: 'bg-red-100 text-red-700',
    ENTREPRENEUR: 'bg-blue-100 text-blue-700',
    CUSTOMER: 'bg-green-100 text-green-700',
    ORGANIZATION: 'bg-purple-100 text-purple-700',
  }[r] || 'bg-gray-100 text-gray-700');

  const statusBadge = (s) => s === 'ACTIVE'
    ? 'bg-green-100 text-green-700'
    : 'bg-gray-100 text-gray-700';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <UserCog size={24} className="text-gray-700" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Search users"
            />
          </div>
          <select
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(0); }}
            aria-label="Filter by role"
          >
            {ROLES.map(r => <option key={r} value={r}>{r === 'ALL' ? 'All Roles' : r}</option>)}
          </select>
          <select
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            aria-label="Filter by status"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
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
      ) : users.length === 0 ? (
        <EmptyState icon={UserCog} title="No users found" message="No users match the current filters." />
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{u.fullName}</td>
                      <td className="px-5 py-3 text-gray-500">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge(u.role)}`}>{u.role}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(u.status)}`}>{u.status}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openViewUser(u)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"
                            title="View details"
                            aria-label={`View ${u.fullName}`}
                          >
                            <Eye size={16} />
                          </button>
                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => openChangeRole(u)}
                              className="p-2 text-gray-400 hover:text-purple-600 transition rounded-lg hover:bg-purple-50"
                              title="Change role"
                              aria-label={`Change role for ${u.fullName}`}
                            >
                              <ShieldCheck size={16} />
                            </button>
                          )}
                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => setStatusTarget(u)}
                              className="p-2 text-gray-400 hover:text-yellow-600 transition rounded-lg hover:bg-yellow-50"
                              title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              aria-label={`${u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} ${u.fullName}`}
                            >
                              {u.status === 'ACTIVE' ? <Ban size={16} /> : <CheckCircle size={16} />}
                            </button>
                          )}
                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="p-2 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-red-50"
                              title="Delete"
                              aria-label={`Delete ${u.fullName}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
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

      {/* View User Detail Modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true" aria-label="User details">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => { setViewUser(null); setViewData(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Details</h2>

            {viewLoading ? (
              <Spinner size="h-8 w-8" />
            ) : viewData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {viewData.profileImageUrl ? (
                    <img src={viewData.profileImageUrl} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCog size={24} className="text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{viewData.fullName}</p>
                    <p className="text-sm text-gray-500">{viewData.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Role</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge(viewData.role)}`}>{viewData.role}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(viewData.status)}`}>{viewData.status}</span>
                  </div>
                  {viewData.phone && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                      <p className="text-sm text-gray-900">{viewData.phone}</p>
                    </div>
                  )}
                  {viewData.createdAt && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Joined</p>
                      <p className="text-sm text-gray-900">{new Date(viewData.createdAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Failed to load user details.</p>
            )}
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {roleTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true" aria-label="Change user role">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Change Role</h2>
            <p className="text-sm text-gray-500 mb-4">
              Change role for <strong>{roleTarget.fullName}</strong>
            </p>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="role-select">New Role</label>
              <select
                id="role-select"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                {CHANGEABLE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRoleTarget(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition">
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                disabled={roleSaving || newRole === roleTarget.role}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {roleSaving ? 'Saving...' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Confirm */}
      <ConfirmDialog
        open={statusTarget !== null}
        title={statusTarget?.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${statusTarget?.status === 'ACTIVE' ? 'deactivate' : 'activate'} "${statusTarget?.fullName}"?`}
        confirmLabel={statusTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        onConfirm={handleToggleStatus}
        onCancel={() => setStatusTarget(null)}
        loading={statusSaving}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete User"
        message={`Are you sure you want to permanently delete "${deleteTarget?.fullName}"? This action cannot be undone.`}
        confirmLabel="Delete User"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteSaving}
      />
    </div>
  );
}
