import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Mail, Phone, Heart, Star, Send } from 'lucide-react';

export default function BusinessDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviewForm, setReviewForm] = useState({ comment: '', rating: 5 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/businesses/${id}`),
      api.get(`/reviews/${id}`),
    ]).then(([bizRes, revRes]) => {
      setBusiness(bizRes.data.data);
      setReviews(revRes.data.data);
    }).finally(() => setLoading(false));

    if (user) {
      api.get(`/favorites/${id}/check`).then(res => setIsFavorited(res.data.data)).catch(() => {});
    }
  }, [id, user]);

  const toggleFavorite = async () => {
    await api.post(`/favorites/${id}`);
    setIsFavorited(!isFavorited);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', { businessId: parseInt(id), ...reviewForm });
      const res = await api.get(`/reviews/${id}`);
      setReviews(res.data.data);
      setReviewForm({ comment: '', rating: 5 });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  if (!business) return <div className="text-center py-20 text-gray-500">Business not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center relative">
          <span className="text-white text-6xl font-bold">{business.name.charAt(0)}</span>
          {user && (
            <button onClick={toggleFavorite} className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition">
              <Heart size={20} className={isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full mt-2 inline-block">{business.categoryName}</span>
            </div>
            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">{business.status}</span>
          </div>

          {business.description && <p className="text-gray-600 mt-4">{business.description}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            {business.location && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin size={16} className="text-gray-400" /> {business.location}
              </div>
            )}
            {business.email && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Mail size={16} className="text-gray-400" /> {business.email}
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone size={16} className="text-gray-400" /> {business.phone}
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-500">Owner: {business.ownerName}</div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews ({reviews.length})</h2>

        {user && (
          <form onSubmit={submitReview} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">Rating:</span>
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
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
            <button type="submit" className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
              <Send size={16} /> Submit Review
            </button>
          </form>
        )}

        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
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
          {reviews.length === 0 && <p className="text-gray-500 text-center py-8">No reviews yet</p>}
        </div>
      </div>
    </div>
  );
}
