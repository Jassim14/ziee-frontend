import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import toast from 'react-hot-toast';
import { Star, Edit2, Trash2 } from 'lucide-react';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ comment: '', rating: 5 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/reviews/user')
      .then(res => setReviews(res.data.data))
      .catch(err => setError(getErrorMessage(err, 'Failed to load reviews')))
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (r) => {
    setEditingId(r.id);
    setForm({ comment: r.comment, rating: r.rating });
  };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      await api.put(`/reviews/${id}`, form);
      setReviews(reviews.map(r => r.id === id ? { ...r, ...form } : r));
      setEditingId(null);
      toast.success('Review updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update review'));
    } finally {
      setSaving(false);
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(reviews.filter(r => r.id !== id));
      toast.success('Review deleted');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete review'));
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-8"><Alert type="error">{error}</Alert></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Reviews</h1>

      {reviews.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-200">
          <Star size={48} className="mx-auto text-gray-300 mb-4" />
          <p>No reviews yet</p>
          <Link to="/businesses" className="text-blue-600 text-sm mt-2 inline-block hover:text-blue-700">Browse businesses to review</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link to={`/businesses/${r.businessId}`} className="font-semibold text-gray-900 hover:text-blue-600">
                    {r.businessName}
                  </Link>
                  {editingId === r.id ? (
                    <div className="mt-2">
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })} aria-label={`${s} stars`}>
                            <Star size={18} className={s <= form.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                        rows={2}
                        value={form.comment}
                        onChange={(e) => setForm({ ...form, comment: e.target.value })}
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => saveEdit(r.id)} disabled={saving} className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={14} className={s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                        ))}
                      </div>
                      {r.comment && <p className="text-gray-600 text-sm mt-2">{r.comment}</p>}
                    </>
                  )}
                </div>
                {editingId !== r.id && (
                  <div className="flex gap-1 ml-4">
                    <button onClick={() => startEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-600 transition"><Edit2 size={16} /></button>
                    <button onClick={() => deleteReview(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
