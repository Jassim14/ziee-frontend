import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import toast from 'react-hot-toast';
import { MapPin, Mail, Phone, Heart, Star, Send, Store } from 'lucide-react';

const statusStyles = {
  APPROVED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function BusinessDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviewForm, setReviewForm] = useState({ comment: '', rating: 5 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      api.get(`/businesses/${id}`),
      api.get(`/reviews/${id}`),
    ])
      .then(([bizRes, revRes]) => {
        if (!active) return;
        setBusiness(bizRes.data.data);
        setReviews(revRes.data.data);
      })
      .catch(err => {
        if (active) setError(getErrorMessage(err, 'Failed to load business'));
      })
      .finally(() => { if (active) setLoading(false); });

    if (user) {
      api.get(`/favorites/${id}/check`)
        .then(res => { if (active) setIsFavorited(res.data.data); })
        .catch(() => {});
    }

    return () => { active = false; };
  }, [id, user]);

  const toggleFavorite = async () => {
    try {
      await api.post(`/favorites/${id}`);
      setIsFavorited(!isFavorited);
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update favorites'));
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/reviews', { businessId: parseInt(id), ...reviewForm });
      const res = await api.get(`/reviews/${id}`);
      setReviews(res.data.data);
      setReviewForm({ comment: '', rating: 5 });
      toast.success('Review submitted');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to submit review'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-8"><Alert type="error">{error}</Alert></div>;
  if (!business) return <div className="max-w-4xl mx-auto px-4 py-8"><Alert type="info">Business not found</Alert></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center relative">
          <span className="text-white text-6xl font-bold">{business.name.charAt(0)}</span>
          {user && (
            <button
              onClick={toggleFavorite}
              className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition"
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={20} className={isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{business.categoryName}</span>
                <span className={`text-sm px-3 py-1 rounded-full ${statusStyles[business.status] || 'bg-gray-100 text-gray-700'}`}>{business.status}</span>
              </div>
            </div>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Store size={14} /> {business.ownerName}
            </span>
          </div>

          {business.description && <p className="text-gray-600 mt-4">{business.description}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            {business.location && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin size={16} className="text-gray-400 shrink-0" /> {business.location}
              </div>
            )}
            {business.email && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Mail size={16} className="text-gray-400 shrink-0" /> {business.email}
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone size={16} className="text-gray-400 shrink-0" /> {business.phone}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews ({reviews.length})</h2>

        {user && (
          <form onSubmit={submitReview} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">Rating:</span>
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })} aria-label={`${s} stars`}>
                  <Star size={20} className={s <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <textarea
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={3}
              placeholder="Write your review..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-medium text-gray-900">{r.username}</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} className={s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-gray-600 text-sm mt-2">{r.comment}</p>}
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-gray-200">No reviews yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
