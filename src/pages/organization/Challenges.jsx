import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { challengeApi, organizationApi } from '../../api/services';
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
  Trophy,
  Calendar,
  Users,
  Award,
  Clock,
  X,
  Save,
  CheckCircle,
  FileText,
} from 'lucide-react';

const initialForm = {
  title: '',
  description: '',
  requirements: '',
  prizes: '',
  deadline: '',
  status: 'OPEN',
  organizationId: '',
  maxParticipants: '',
  imageUrl: '',
};

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
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

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [cData, oData] = await Promise.all([
        challengeApi.getMy({ page, size: 8, sortBy: 'createdAt', sortDir: 'desc' }),
        organizationApi.getMy({ page: 0, size: 100 }).catch(() => ({ items: [] })),
      ]);
      setChallenges(cData.items);
      setTotalPages(cData.totalPages);
      setTotalElements(cData.totalElements);
      setOrganizations(oData.items || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load your managed challenges'));
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

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

  const openEdit = (c) => {
    setEditId(c.id);
    const matchedOrg = organizations.find((o) => o.name === c.organizationName);
    setForm({
      title: c.title || '',
      description: c.description || '',
      requirements: c.requirements || '',
      prizes: c.prizes || '',
      deadline: c.deadline ? c.deadline.slice(0, 16) : '',
      status: c.status || 'OPEN',
      organizationId: matchedOrg ? String(matchedOrg.id) : '',
      maxParticipants: c.maxParticipants ? String(c.maxParticipants) : '',
      imageUrl: c.imageUrl || '',
    });
    setFormErrors({});
    setModalError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm(
      {
        title: [required('Challenge title is required'), maxLen(200, 'Title must not exceed 200 characters')],
        description: [maxLen(2000, 'Description must not exceed 2000 characters')],
        deadline: [required('Application deadline is required')],
        organizationId: [required('Please select an organization')],
      },
      form
    );

    if (form.maxParticipants && parseInt(form.maxParticipants, 10) <= 0) {
      nextErrors.maxParticipants = 'Max participants must be greater than 0';
    }

    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setModalError('');
    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        requirements: form.requirements.trim() || undefined,
        prizes: form.prizes.trim() || undefined,
        deadline: form.deadline ? `${form.deadline}:00` : undefined,
        status: form.status,
        organizationId: parseInt(form.organizationId, 10),
        maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants, 10) : undefined,
      };

      if (editId) {
        await challengeApi.update(editId, payload);
        toast.success('Challenge updated successfully');
      } else {
        await challengeApi.create(payload);
        toast.success('Challenge created successfully');
      }
      setShowModal(false);
      fetchChallenges();
    } catch (err) {
      setModalError(getErrorMessage(err, 'Failed to save challenge'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleClose = async (c) => {
    try {
      if (c.status === 'CLOSED') {
        await challengeApi.publish(c.id);
        toast.success('Challenge reopened for applications.');
      } else {
        await challengeApi.close(c.id);
        toast.success('Challenge marked as closed.');
      }
      fetchChallenges();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update challenge status'));
    }
  };

  const handlePublish = async (c) => {
    try {
      await challengeApi.publish(c.id);
      toast.success('Challenge published to the marketplace.');
      fetchChallenges();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to publish challenge'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await challengeApi.remove(deleteTarget.id);
      toast.success('Challenge deleted.');
      setDeleteTarget(null);
      fetchChallenges();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete challenge'));
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
            <Trophy className="text-amber-600" size={28} />
            Manage Innovation Challenges
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Publish competitions, review applicant pitches, and award grants to Zanzibar entrepreneurs
          </p>
        </div>

        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} /> New Challenge
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-24">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : challenges.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No challenges created yet"
          message="Create your organization's first pitch challenge to scout top talent and innovative solutions in Zanzibar."
          action={
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              <Plus size={18} /> Create Challenge
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {challenges.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 sm:p-6 transition hover:shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-lg">{c.title}</h3>
                    <StatusBadge status={c.status} />
                    {c.prizes && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Award size={12} /> {c.prizes}
                      </span>
                    )}
                  </div>

                  {c.description && (
                    <p className="text-gray-600 text-sm mt-1.5 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
                    {c.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-gray-400" />
                        Deadline: {new Date(c.deadline).toLocaleDateString()}
                      </span>
                    )}
                    {c.maxParticipants && (
                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-gray-400" />
                        Max slots: {c.maxParticipants}
                      </span>
                    )}
                    {c.organizationName && (
                      <span>Org: <strong>{c.organizationName}</strong></span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end lg:self-start pt-2 lg:pt-0 border-t lg:border-0 border-gray-100 w-full lg:w-auto justify-end flex-wrap">
                  <Link
                    to={`/org-challenges/${c.id}/applications`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-xl transition border border-amber-200"
                  >
                    <FileText size={14} /> Review Applications
                  </Link>

                  {c.publicationStatus === 'DRAFT' ? (
                    <button
                      onClick={() => handlePublish(c)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold transition bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleClose(c)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        c.status === 'CLOSED'
                          ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                      }`}
                    >
                      {c.status === 'CLOSED' ? 'Reopen' : 'Close Challenge'}
                    </button>
                  )}

                  <button
                    onClick={() => openEdit(c)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                    title="Edit challenge"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="Delete challenge"
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
                {editId ? 'Edit Challenge' : 'New Innovation Challenge'}
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
                  Challenge Title *
                </label>
                <input
                  type="text"
                  maxLength={200}
                  placeholder="e.g. Zanzibar Blue Economy Agri-Tech Innovation Challenge 2026"
                  className={`w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition ${
                    formErrors.title ? 'border-red-400 bg-red-50/20' : ''
                  }`}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                {formErrors.title && <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.title}</p>}
              </div>

              {/* Organization & Status */}
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
                    Challenge Status *
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="OPEN">Open (Accepting Applications)</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              {/* Prizes & Max Participants */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Prizes / Incubation Awards
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $10,000 Seed Grant + 6-mo Mentorship"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                    value={form.prizes}
                    onChange={(e) => setForm({ ...form, prizes: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Max Participant Teams
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                    value={form.maxParticipants}
                    onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                  />
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Submission Deadline *
                </label>
                <input
                  type="datetime-local"
                  className={`w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition ${
                    formErrors.deadline ? 'border-red-400' : ''
                  }`}
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
                {formErrors.deadline && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.deadline}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Challenge Brief & Problem Statement
                </label>
                <textarea
                  rows={4}
                  maxLength={2000}
                  placeholder="Describe the challenge goals, problem context, and desired innovation outcomes..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 resize-none transition"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Eligibility & Submission Requirements
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  placeholder="List team size, resident requirements, prototype readiness, and deliverables..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 resize-none transition"
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                />
              </div>

              {/* Image upload in edit mode */}
              {editId && (
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Challenge Cover Image
                  </label>
                  <FileUpload
                    label="Upload Banner (16:9 recommended)"
                    onUploaded={(url) => setForm({ ...form, imageUrl: url || '' })}
                    currentUrl={form.imageUrl}
                    endpoint={`/challenges/${editId}/image`}
                    deleteEndpoint={`/challenges/${editId}/image`}
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
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Challenge"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Challenge"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}