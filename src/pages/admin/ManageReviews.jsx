import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { reviewApi } from '../../api/services';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import RatingStars from '../../components/RatingStars';
import toast from 'react-hot-toast';
import { Star, Search, Trash2 } from 'lucide-react';

const RATING_FILTERS = ['ALL', '5', '4', '3', '2', '1'];

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchReviews = useCallback(() => {
    setLoading(true);
    setError('');
    const params = { page, size: 10, sortBy: 'createdAt', sortDir: 'desc' };
    if (search.trim()) params.search = search.trim();
    if (ratingFilter !== 'ALL') params.rating = parseInt(ratingFilter);

    reviewApi.adminList(params)
      .then(data => {
        setReviews(data.items);
        setTotalPages(data.totalPages);
      })
      .catch(err => setError(getErrorMessage(err, 'Failed to load reviews')))
      .finally(() => setLoading(false));
  }, [page, search, ratingFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(input);
    setPage(0);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await reviewApi.remove(deleteTarget.id);
      toast.success('Review deleted');
      setDeleteTarget(null);
      fetchReviews();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete review'));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Star size={24} className="text-gray-700" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-900">Manage Reviews</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by reviewer or business..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Search reviews"
            />
          </div>
          <select
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value); setPage(0); }}
            aria-label="Filter by rating"
          >
            {RATING_FILTERS.map(r => (
              <option key={r} value={r}>{r === 'ALL' ? 'All Ratings' : `${r} Star${r !== '1' ? 's' : ''}`}</option>
            ))}
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
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title={search || ratingFilter !== 'ALL' ? 'No matching reviews' : 'No reviews found'}
          message="No reviews match the current filters."
          action={(search || ratingFilter !== 'ALL') ? (
            <button onClick={() => { setInput(''); setSearch(''); setRatingFilter('ALL'); setPage(0); }} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              Clear Filters
            </button>
          ) : null}
        />
      ) : (
        <>
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <RatingStars value={r.rating} size={14} />
                      <span className="text-sm font-semibold text-gray-700">{r.rating}/5</span>
                      {r.createdAt && (
                        <span className="text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {r.comment && (
                      <p className="text-sm text-gray-700 leading-relaxed mb-2">{r.comment}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      {r.businessName && (
                        <Link
                          to={`/businesses/${r.businessId}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          Business: {r.businessName}
                        </Link>
                      )}
                      {r.reviewerName && (
                        <span>By: {r.reviewerName}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(r)}
                    className="p-2 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-red-50 shrink-0"
                    title="Delete review"
                    aria-label={`Delete review by ${r.reviewerName || 'unknown'}`}
                  >
                    <Trash2 size={16} />
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
        title="Delete Review"
        message="Are you sure you want to permanently delete this review? This action cannot be undone."
        confirmLabel="Delete Review"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
