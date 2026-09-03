import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { trainingApi, organizationApi } from '../../api/services';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import FileUpload from '../../components/FileUpload';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import getErrorMessage from '../../utils/errors';
import { validateForm, required, maxLen } from '../../utils/validation';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Calendar,
  Users,
  MapPin,
  Globe,
  Clock,
  X,
  Save,
  CheckCircle,
  Eye,
  Sparkles,
} from 'lucide-react';

const initialForm = {
  title: '',
  description: '',
  provider: '',
  organizationId: '',
  type: 'IN_PERSON',
  location: '',
  link: '',
  capacity: '',
  startDate: '',
  endDate: '',
  registrationDeadline: '',
  imageUrl: '',
};

export default function Trainings() {
  const [trainings, setTrainings] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTrainings = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [tData, oData] = await Promise.all([
        trainingApi.getMy({ page, size: 8, sortBy: 'createdAt', sortDir: 'desc' }),
        organizationApi.getMy({ page: 0, size: 100 }).catch(() => ({ items: [] })),
      ]);
      setTrainings(tData.items);
      setTotalPages(tData.totalPages);
      setTotalElements(tData.totalElements);
      setOrganizations(oData.items || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load your managed trainings'));
      setTrainings([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const openCreate = () => {
    setEditId(null);
    setForm({
      ...initialForm,
      organizationId: organizations.length === 1 ? String(organizations[0].id) : '',
    });
    setFormErrors({});
    setModalError('');
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditId(t.id);
    const matchedOrg = organizations.find((o) => o.name === t.organizationName);
    setForm({
      title: t.title || '',
      description: t.description || '',
      provider: t.provider || '',
      organizationId: matchedOrg ? String(matchedOrg.id) : '',
      type: t.type || 'IN_PERSON',
      location: t.location || '',
      link: t.link || '',
      capacity: t.capacity ? String(t.capacity) : '',
      startDate: t.startDate ? t.startDate.slice(0, 16) : '',
      endDate: t.endDate ? t.endDate.slice(0, 16) : '',
      registrationDeadline: t.registrationDeadline ? t.registrationDeadline.slice(0, 16) : '',
      imageUrl: t.imageUrl || '',
    });
    setFormErrors({});
    setModalError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm(
      {
        title: [required('Training title is required'), maxLen(200, 'Title must not exceed 200 characters')],
        description: [maxLen(2000, 'Description must not exceed 2000 characters')],
        organizationId: [required('Please select an organization')],
        startDate: [required('Start date and time is required')],
      },
      form
    );

    if (form.capacity && parseInt(form.capacity, 10) <= 0) {
      nextErrors.capacity = 'Capacity must be greater than 0';
    }

    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setModalError('');
    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        provider: form.provider.trim() || undefined,
        organizationId: parseInt(form.organizationId, 10),
        type: form.type,
        location: form.location.trim() || undefined,
        link: form.link.trim() || undefined,
        capacity: form.capacity ? parseInt(form.capacity, 10) : undefined,
        startDate: form.startDate ? `${form.startDate}:00` : undefined,
        endDate: form.endDate ? `${form.endDate}:00` : undefined,
        registrationDeadline: form.registrationDeadline ? `${form.registrationDeadline}:00` : undefined,
      };

      if (editId) {
        await trainingApi.update(editId, payload);
        toast.success('Training updated successfully');
      } else {
        await trainingApi.create(payload);
        toast.success('Training created successfully');
      }
      setShowModal(false);
      fetchTrainings();
    } catch (err) {
      setModalError(getErrorMessage(err, 'Failed to save training'));
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (t) => {
    try {
      if (t.publicationStatus === 'PUBLISHED') {
        await trainingApi.unpublish(t.id);
        toast.success('Training unpublished.');
      } else {
        await trainingApi.publish(t.id);
        toast.success('Training published to marketplace!');
      }
      fetchTrainings();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update publication status'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await trainingApi.remove(deleteTarget.id);
      toast.success('Training deleted.');
      setDeleteTarget(null);
      fetchTrainings();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete training'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="text-blue-600" size={28} />
            Manage Trainings & Workshops
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create, publish, and track participant registrations for your organization's programs
          </p>
        </div>

        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} /> New Training
        </button>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="py-24">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : trainings.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No training programs created yet"
          message="Schedule your first workshop or capacity building course to train entrepreneurs across Zanzibar."
          action={
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              <Plus size={18} /> Create Training
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {trainings.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 sm:p-6 transition hover:shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-lg">{t.title}</h3>
                    <StatusBadge status={t.publicationStatus || t.status} />
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                      {t.type}
                    </span>
                  </div>

                  {t.description && (
                    <p className="text-gray-600 text-sm mt-1.5 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
                    {t.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-gray-400" />
                        {new Date(t.startDate).toLocaleDateString()}
                      </span>
                    )}
                    {t.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-gray-400" />
                        {t.location}
                      </span>
                    )}
                    {t.capacity && (
                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-gray-400" />
                        Capacity: {t.capacity}
                      </span>
                    )}
                    {t.organizationName && (
                      <span>Org: <strong>{t.organizationName}</strong></span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end lg:self-start pt-2 lg:pt-0 border-t lg:border-0 border-gray-100 w-full lg:w-auto justify-end flex-wrap">
                  <Link
                    to={`/org-trainings/${t.id}/participants`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition"
                  >
                    <Users size={14} /> Participants
                  </Link>

                  <button
                    onClick={() => handleTogglePublish(t)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      t.publicationStatus === 'PUBLISHED'
                        ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {t.publicationStatus === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    onClick={() => openEdit(t)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                    title="Edit training"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(t)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="Delete training"
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 px-4 py-6 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 relative my-auto animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-xl font-extrabold text-gray-900">
                {editId ? 'Edit Training Program' : 'New Training Program'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            {modalError && <Alert type="error" message={modalError} />}

            <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Training Title *
                </label>
                <input
                  type="text"
                  maxLength={200}
                  placeholder="e.g. Digital Marketing & Financial Literacy for SMEs"
                  className={`w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition ${
                    formErrors.title ? 'border-red-400 bg-red-50/20' : ''
                  }`}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                {formErrors.title && <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.title}</p>}
              </div>

              {/* Organization & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Hosting Organization *
                  </label>
                  <select
                    className={`w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition ${
                      formErrors.organizationId ? 'border-red-400' : ''
                    }`}
                    value={form.organizationId}
                    onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
                  >
                    <option value="">Select an organization</option>
                    {organizations.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.organizationId && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.organizationId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Training Delivery Type *
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="IN_PERSON">In Person</option>
                    <option value="ONLINE">Online</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Provider & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Lead Facilitator / Trainer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Amina Said (Lead Instructor)"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Participant Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 30"
                    className={`w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition ${
                      formErrors.capacity ? 'border-red-400' : ''
                    }`}
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  />
                  {formErrors.capacity && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.capacity}</p>
                  )}
                </div>
              </div>

              {/* Location & Online Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Physical Venue / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SUZA Innovation Lab, Tunguu"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Online Meeting / Virtual Link
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://meet.google.com/xyz"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                  />
                </div>
              </div>

              {/* Schedule Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition ${
                      formErrors.startDate ? 'border-red-400' : ''
                    }`}
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                  {formErrors.startDate && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Registration Deadline
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                    value={form.registrationDeadline}
                    onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Program Description & Objectives
                </label>
                <textarea
                  rows={4}
                  maxLength={2000}
                  placeholder="Outline what participants will learn, prerequisites, and takeaway certifications..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 resize-none transition"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <div className="flex justify-end mt-0.5">
                  <span className="text-[11px] text-gray-400">
                    {form.description.length} / 2000 characters
                  </span>
                </div>
              </div>

              {/* Image upload in edit mode */}
              {editId && (
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Training Banner Image
                  </label>
                  <FileUpload
                    label="Upload Banner (16:9 recommended)"
                    onUploaded={(url) => setForm({ ...form, imageUrl: url || '' })}
                    currentUrl={form.imageUrl}
                    endpoint={`/trainings/${editId}/image`}
                    deleteEndpoint={`/trainings/${editId}/image`}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xs transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Training'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Training"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Training"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}