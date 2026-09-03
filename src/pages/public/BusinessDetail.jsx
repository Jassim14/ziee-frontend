import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { businessApi, reviewApi, favoriteApi, averageRating } from '../../api/services';
import { useAuth } from '../../hooks/useAuth';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import RatingStars from '../../components/RatingStars';
import GalleryViewer from '../../components/GalleryViewer';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoginPromptModal from '../../components/LoginPromptModal';
import toast from 'react-hot-toast';
import {
  MapPin,
  Mail,
  Phone,
  Heart,
  Share2,
  Send,
  User as UserIcon,
  MessageSquare,
  Edit2,
  Trash2,
  Info,
  CheckCircle,
  Clock,
  ArrowLeft,
} from 'lucide-react';

const statusStyles = {
  APPROVED: 'bg-green-100 text-green-700 border-green-200',
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  INACTIVE: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function BusinessDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [business, setBusiness] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [reviewsData, setReviewsData] = useState({ items: [], page: 0, totalPages: 1, totalElements: 0 });
  const [reviewsPage, setReviewsPage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Review Form State
  const [reviewForm, setReviewForm] = useState({ comment: '', rating: 5 });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Review Edit State
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editForm, setEditForm] = useState({ comment: '', rating: 5 });
  const [savingEdit, setSavingEdit] = useState(false);

  // Review Delete Confirm Dialog State
  const [deleteReviewId, setDeleteReviewId] = useState(null);
  const [deletingReview, setDeletingReview] = useState(false);

  // Login Modal State
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch Business Data & Gallery
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      businessApi.get(id),
      businessApi.gallery(id).catch(() => []),
    ])
      .then(([biz, gal]) => {
        if (!active) return;
        setBusiness(biz);
        setGallery(gal);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Failed to load business details'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id]);

  // Check Favorite Status if user is logged in
  useEffect(() => {
    let active = true;
    if (isAuthenticated && id) {
      favoriteApi.check(id)
        .then((fav) => {
          if (active) setIsFavorited(fav);
        })
        .catch(() => {});
    } else {
      setIsFavorited(false);
    }
    return () => { active = false; };
  }, [id, isAuthenticated]);

  // Fetch Reviews
  const fetchReviews = useCallback(async () => {
    if (!id) return;
    try {
      const res = await reviewApi.list(id, {
        page: reviewsPage,
        size: 5,
        sortBy: 'createdAt',
        sortDir: 'desc',
      });
      setReviewsData(res);
    } catch {
      // Keep existing reviews on minor fetch error
    }
  }, [id, reviewsPage]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle Favorite Toggle
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setLoginPromptMessage('Please sign in to add this business to your favorites.');
      setLoginPromptOpen(true);
      return;
    }

    setFavoriteLoading(true);
    try {
      await favoriteApi.toggle(id);
      setIsFavorited((prev) => !prev);
      toast.success(isFavorited ? 'Removed from favorites' : 'Saved to favorites');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update favorites'));
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Handle Share Link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Business link copied to clipboard!');
  };

  // Handle Review Submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setLoginPromptMessage('Please sign in to leave a review for this business.');
      setLoginPromptOpen(true);
      return;
    }

    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      setReviewError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setReviewError('');
    setSubmittingReview(true);
    try {
      await reviewApi.create({
        businessId: Number(id),
        comment: reviewForm.comment.trim(),
        rating: reviewForm.rating,
      });
      toast.success('Thank you! Your review has been submitted.');
      setReviewForm({ comment: '', rating: 5 });
      setReviewsPage(0);
      fetchReviews();
    } catch (err) {
      setReviewError(getErrorMessage(err, 'Failed to submit review'));
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Review Edit
  const handleStartEditReview = (rev) => {
    setEditingReviewId(rev.id);
    setEditForm({ comment: rev.comment || '', rating: rev.rating });
  };

  const handleSaveEditReview = async (revId) => {
    setSavingEdit(true);
    try {
      await reviewApi.update(revId, {
        comment: editForm.comment.trim(),
        rating: editForm.rating,
      });
      toast.success('Review updated');
      setEditingReviewId(null);
      fetchReviews();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update review'));
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Review Delete
  const handleConfirmDeleteReview = async () => {
    if (!deleteReviewId) return;
    setDeletingReview(true);
    try {
      await reviewApi.remove(deleteReviewId);
      toast.success('Review deleted');
      setDeleteReviewId(null);
      fetchReviews();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete review'));
    } finally {
      setDeletingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Alert type="error" message={error} />
        <div className="mt-4">
          <Link to="/businesses" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700">
            <ArrowLeft size={16} /> Back to Businesses
          </Link>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Alert type="info" message="Business not found or is currently not available." />
        <div className="mt-4">
          <Link to="/businesses" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700">
            <ArrowLeft size={16} /> Back to Businesses
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && (user.fullName === business.ownerName || user.email === business.email);
  const avgRating = averageRating(reviewsData.items);
  const userExistingReview = user
    ? reviewsData.items.find((r) => r.username === user.fullName)
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          to="/businesses"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} /> Back to all businesses
        </Link>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl shadow-xs border border-gray-200 overflow-hidden mb-8">
        {/* Cover Banner */}
        <div className="h-56 sm:h-72 w-full relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 overflow-hidden">
          {business.coverImageUrl ? (
            <img
              src={business.coverImageUrl}
              alt={`${business.name} cover`}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/20 font-black text-8xl select-none">
                {business.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Action Buttons on Cover */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 bg-white/90 backdrop-blur-xs text-gray-700 rounded-full hover:bg-white shadow-md transition"
              title="Share business"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className="p-2.5 bg-white/90 backdrop-blur-xs rounded-full hover:bg-white shadow-md transition disabled:opacity-50"
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                size={18}
                className={isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}
              />
            </button>
          </div>
        </div>

        {/* Header Profile Info */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            {/* Logo Avatar */}
            <div className="relative">
              {business.logoUrl ? (
                <img
                  src={business.logoUrl}
                  alt={business.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-xl border-4 border-white bg-white"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-4xl shadow-xl border-4 border-white">
                  {business.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Status / Category Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              {business.categoryName && (
                <span className="text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1 rounded-full">
                  {business.categoryName}
                </span>
              )}
              {business.status && (
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    statusStyles[business.status] || 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {business.status}
                </span>
              )}
            </div>
          </div>

          {/* Business Title & Owner */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {business.name}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
              {business.ownerName && (
                <span className="flex items-center gap-1.5">
                  <UserIcon size={16} className="text-gray-400" />
                  Operated by <strong className="text-gray-700 font-medium">{business.ownerName}</strong>
                </span>
              )}
              {reviewsData.totalElements > 0 && (
                <div className="flex items-center gap-1.5">
                  <RatingStars value={avgRating} size={15} />
                  <span className="font-semibold text-gray-800">{avgRating.toFixed(1)}</span>
                  <span className="text-gray-400">({reviewsData.totalElements} {reviewsData.totalElements === 1 ? 'review' : 'reviews'})</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {business.description && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">About the Business</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                {business.description}
              </p>
            </div>
          )}

          {/* Contact & Location Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
            {business.location && (
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <MapPin size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Location</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{business.location}</p>
                </div>
              </div>
            )}

            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-blue-50/50 hover:border-blue-200 transition group"
              >
                <div className="p-2 bg-green-100 text-green-600 rounded-xl group-hover:bg-green-200 transition">
                  <Phone size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">
                    {business.phone}
                  </p>
                </div>
              </a>
            )}

            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-blue-50/50 hover:border-blue-200 transition group"
              >
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl group-hover:bg-purple-200 transition">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">
                    {business.email}
                  </p>
                </div>
              </a>
            )}
          </div>

          {/* Photo Gallery Viewer */}
          <GalleryViewer images={gallery} />
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6 sm:p-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare size={22} className="text-blue-600" />
              Customer Reviews ({reviewsData.totalElements})
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Read authentic feedback from community members
            </p>
          </div>

          {reviewsData.totalElements > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
              <RatingStars value={avgRating} size={18} />
              <span className="text-lg font-bold text-blue-900">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-blue-600 font-medium">/ 5.0</span>
            </div>
          )}
        </div>

        {/* Review Form / Status Banners */}
        {!isAuthenticated ? (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-blue-900 text-sm">Have you used this business's services?</h3>
              <p className="text-blue-700 text-xs mt-1">Sign in to leave your feedback and rate your experience.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoginPromptMessage('Please sign in to write a review for this business.');
                setLoginPromptOpen(true);
              }}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shrink-0 transition"
            >
              Sign In to Review
            </button>
          </div>
        ) : isOwner ? (
          <div className="bg-gray-50 border border-gray-200 text-gray-700 text-sm px-4 py-3 rounded-2xl mb-8 flex items-center gap-2">
            <Info size={18} className="text-gray-400 shrink-0" />
            <span>You are the registered owner of this business. Business owners cannot review their own businesses.</span>
          </div>
        ) : userExistingReview ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8 flex items-center gap-3 text-sm text-green-800">
            <CheckCircle size={18} className="text-green-600 shrink-0" />
            <span>You have submitted a review for this business. You can edit or delete it below.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-2xl border border-gray-200 p-5 sm:p-6 mb-8">
            <h3 className="font-bold text-gray-900 text-base mb-4">Write a Review</h3>

            {reviewError && <div className="mb-4"><Alert type="error" message={reviewError} /></div>}

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Overall Rating (1 to 5 Stars) *
              </label>
              <div className="flex items-center gap-3">
                <RatingStars
                  value={reviewForm.rating}
                  size={24}
                  onChange={(r) => setReviewForm({ ...reviewForm, rating: r })}
                />
                <span className="text-sm font-bold text-gray-700">
                  {reviewForm.rating} {reviewForm.rating === 1 ? 'Star' : 'Stars'}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Your Comments (Optional)
              </label>
              <textarea
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none transition"
                rows={3}
                placeholder="Describe your experience with this business, quality of products or services..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={16} /> {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviewsData.items.map((r) => {
            const isUserReview = user && r.username === user.fullName;
            const isEditing = editingReviewId === r.id;

            return (
              <div
                key={r.id}
                className={`rounded-2xl border p-5 transition ${
                  isUserReview
                    ? 'bg-blue-50/40 border-blue-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                {isEditing ? (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold text-gray-700 uppercase">Edit Rating:</span>
                      <RatingStars
                        value={editForm.rating}
                        size={20}
                        onChange={(val) => setEditForm({ ...editForm, rating: val })}
                      />
                    </div>
                    <textarea
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                      rows={3}
                      value={editForm.comment}
                      onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleSaveEditReview(r.id)}
                        disabled={savingEdit}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingEdit ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setEditingReviewId(null)}
                        className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {r.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                            {r.username}
                            {isUserReview && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                You
                              </span>
                            )}
                          </p>
                          {r.createdAt && (
                            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock size={11} /> {new Date(r.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <RatingStars value={r.rating} size={15} />
                        </div>
                        {isUserReview && (
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleStartEditReview(r)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-white transition"
                              title="Edit review"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteReviewId(r.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white transition"
                              title="Delete review"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {r.comment && (
                      <p className="text-gray-700 text-sm mt-3 pl-10 leading-relaxed whitespace-pre-line">
                        {r.comment}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {reviewsData.items.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100">
              <MessageSquare size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="font-medium text-gray-700">No reviews yet</p>
              <p className="text-xs text-gray-500 mt-0.5">Be the first to share your experience with this business.</p>
            </div>
          )}
        </div>

        {/* Reviews Pagination */}
        <Pagination
          page={reviewsPage}
          totalPages={reviewsData.totalPages}
          onPageChange={(p) => setReviewsPage(p)}
        />
      </div>

      {/* Delete Review Confirm Dialog */}
      <ConfirmDialog
        open={deleteReviewId !== null}
        title="Delete Review"
        message="Are you sure you want to permanently remove your review for this business?"
        confirmLabel="Delete Review"
        onConfirm={handleConfirmDeleteReview}
        onCancel={() => setDeleteReviewId(null)}
        loading={deletingReview}
      />

      {/* Login Prompt Modal */}
      <LoginPromptModal
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        title="Sign in required"
        message={loginPromptMessage}
      />
    </div>
  );
}
