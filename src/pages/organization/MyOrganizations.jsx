import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { organizationApi } from '../../api/services';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Building2, Eye, Mail, Phone, ExternalLink } from 'lucide-react';

export default function MyOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyOrgs = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await organizationApi.getMy({ page, size: 8, sortBy: 'name', sortDir: 'asc' });
      setOrganizations(data.items);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load your organizations'));
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchMyOrgs();
  }, [fetchMyOrgs]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await organizationApi.remove(deleteTarget.id);
      toast.success(`Organization "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      fetchMyOrgs();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete organization'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="text-blue-600" size={28} />
            My Organizations
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your partner organization profiles, branding, and contact details
          </p>
        </div>

        <Link
          to="/organizations/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} /> Register Organization
        </Link>
      </div>

      {loading ? (
        <div className="py-24">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : organizations.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organizations registered yet"
          message="Register your organization to host capacity building workshops, publish challenges, and support Zanzibari entrepreneurs."
          action={
            <Link
              to="/organizations/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              <Plus size={18} /> Register Organization
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 sm:p-6 transition hover:shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {org.logoUrl ? (
                      <img
                        src={org.logoUrl}
                        alt={org.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-blue-600 font-bold text-xl">{org.name?.charAt(0) || 'O'}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg">{org.name}</h3>
                    {org.description && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2 leading-relaxed">
                        {org.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
                      {org.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={13} className="text-gray-400" /> {org.email}
                        </span>
                      )}
                      {org.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={13} className="text-gray-400" /> {org.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-start pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 w-full sm:w-auto justify-end">
                  <Link
                    to={`/organizations/${org.id}`}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                    title="View public profile"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    to={`/organizations/${org.id}/edit`}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                    title="Edit organization"
                  >
                    <Edit2 size={18} />
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(org)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="Delete organization"
                  >
                    <Trash2 size={18} />
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

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Organization"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? All associated trainings and challenges may be affected.`}
        confirmLabel="Delete Organization"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}