import { useState, useEffect, useCallback } from 'react';
import { categoryApi } from '../../api/services';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Search, FolderOpen, Save } from 'lucide-react';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        size: 10,
        sortBy: 'name',
        sortDir: 'asc',
      };
      if (search.trim()) params.search = search.trim();

      const data = await categoryApi.list(params);
      setCategories(data.items);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load categories'));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', description: '' });
    setFormErrors({});
    setModalError('');
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditId(c.id);
    setForm({ name: c.name || '', description: c.description || '' });
    setFormErrors({});
    setModalError('');
    setShowModal(true);
  };

  const validateCategoryForm = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = 'Category name is required';
    } else if (form.name.trim().length > 100) {
      errs.name = 'Category name must not exceed 100 characters';
    }

    if (form.description && form.description.length > 500) {
      errs.description = 'Description must not exceed 500 characters';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCategoryForm()) return;

    setModalError('');
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
      };

      if (editId) {
        await categoryApi.update(editId, payload);
        toast.success('Category updated successfully');
      } else {
        await categoryApi.create(payload);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setModalError(getErrorMessage(err, 'Operation failed. A category with this name may already exist.'));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoryApi.remove(deleteTarget.id);
      toast.success(`Category "${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          'Cannot delete category because it is currently assigned to one or more businesses.'
        )
      );
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
            <FolderOpen className="text-blue-600" size={28} />
            Manage Categories
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create, update, and manage industry classifications for all businesses in Zanzibar
          </p>
        </div>

        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
          />
        </div>
      </div>

      {/* Main Categories Table / List */}
      {loading ? (
        <div className="py-20">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={search ? 'No matching categories' : 'No categories found'}
          message={
            search
              ? `No categories matching "${search}".`
              : 'Add your first business category to organize the marketplace.'
          }
          action={
            search ? (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(0);
                }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={openCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
              >
                Create Category
              </button>
            )
          }
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {categories.map((c) => (
              <div
                key={c.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex-1 pr-4">
                  <h3 className="font-bold text-gray-900 text-base">{c.name}</h3>
                  {c.description ? (
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{c.description}</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5 italic">No description provided</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                    title="Edit category"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="Delete category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editId ? 'Edit Category' : 'New Category'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalError && <Alert type="error" message={modalError} />}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Agriculture & Agribusiness"
                  className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition ${
                    formErrors.name ? 'border-red-400 bg-red-50/20' : ''
                  }`}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  maxLength={500}
                  rows={3}
                  placeholder="Provide a brief summary of what businesses fall into this category..."
                  className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none transition ${
                    formErrors.description ? 'border-red-400 bg-red-50/20' : ''
                  }`}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <div className="flex justify-between items-center mt-1">
                  {formErrors.description ? (
                    <p className="text-xs text-red-600 font-medium">{formErrors.description}</p>
                  ) : <div />}
                  <span className="text-[11px] text-gray-400">
                    {form.description.length} / 500 characters
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
                  className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save size={15} />
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirm Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? You cannot delete categories that have businesses assigned to them.`}
        confirmLabel="Delete Category"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
