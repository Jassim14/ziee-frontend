import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { reviewApi } from '../../api/services';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import RatingStars from '../../components/RatingStars';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import { MessageSquare, Edit2, Trash2, Calendar, Building2, Save } from 'lucide-react';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ comment: '', rating: 5 });
  const [saving, setSaving] = useState(false);

  // Delete Confirm State
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await reviewApi.my({
        page,
        size: 8,
        sortBy: 'createdAt',
        sortDir: 'desc',
      });
      setReviews(data.items);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load your reviews'));
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  const startEdit = (r) => {
    setEditingId(r.id);
    setForm({ comment: r.comment || '', rating: r.rating || 5 });
  };

  const saveEdit = async (id) => {
    if (!form.rating || form.rating < 1 || form.rating > 5) {
      toast.error('Rating must be between 1 and 5 stars');
      return;
    }

    setSaving(true);
    try {
      await reviewApi.update(id, {
        comment: form.comment.trim(),
        rating: form.rating,
      });
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, comment: form.comment.trim(), rating: form.rating } : r
        )
      );
      setEditingId(null);
      toast.success('Review updated successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update review'));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await reviewApi.remove(deleteTargetId);
      setReviews((prev) => prev.filter((r) => r.id !== deleteTargetId));
      setTotalElements((prev) => Math.max(0, prev - 1));
      toast.success('Review deleted');
      setDeleteTargetId(null);
      if (reviews.length === 1 && page > 0) {
        setPage(page - 1);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete review'));
      fetchMyReviews();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          <MessageSquare className="text-blue-600" size={28} />
          My Reviews
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Review feedback you have shared with local businesses
        </p>
      </div>

      {loading ? (
        <div className="py-20">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="You haven't written any reviews yet"
          message="Visit businesses across Zanzibar, experience their services, and share your valuable feedback with the community."
          action={
            <Link
              to="/businesses"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              <Building2 size={16} /> Browse Businesses
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 sm:p-6 transition hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <Link
                      to={`/businesses/${r.businessId}`}
                      className="font-bold text-gray-900 text-lg hover:text-blue-600 transition"
                    >
                      {r.businessName}
                    </Link>

                    {r.createdAt && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={12} /> {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {editingId === r.id ? (
                    <div className="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-700 uppercase">Rating:</span>
                        <RatingStars
                          value={form.rating}
                          size={22}
                          onChange={(val) => setForm({ ...form, rating: val })}
                        />
                        <span className="text-xs font-bold text-gray-700">{form.rating} / 5</span>
                      </div>

                      <textarea
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                        rows={3}
                        value={form.comment}
                        onChange={(e) => setForm({ ...form, comment: e.target.value })}
                        placeholder="Write your review comment..."
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(r.id)}
                          disabled={saving}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <RatingStars value={r.rating} size={16} />
                        <span className="text-xs font-bold text-gray-700">{r.rating}.0</span>
                      </div>

                      {r.comment && (
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {r.comment}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {editingId !== r.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(r)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      title="Edit review"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(r.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Delete review"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
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
        open={deleteTargetId !== null}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmLabel="Delete Review"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
        loading={deleting}
      />
    </div>
  );
}
