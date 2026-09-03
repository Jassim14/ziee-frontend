import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { favoriteApi } from '../../api/services';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import { Heart, MapPin, Trash2, ArrowRight, Building2, Calendar } from 'lucide-react';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await favoriteApi.list({
        page,
        size: 8,
        sortBy: 'createdAt',
        sortDir: 'desc',
      });
      setFavorites(data.items);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load your favorite businesses'));
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const removeFavorite = async (businessId, businessName) => {
    try {
      await favoriteApi.toggle(businessId);
      setFavorites((prev) => prev.filter((f) => f.businessId !== businessId));
      setTotalElements((prev) => Math.max(0, prev - 1));
      toast.success(businessName ? `Removed "${businessName}" from favorites` : 'Removed from favorites');
      if (favorites.length === 1 && page > 0) {
        setPage(page - 1);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not remove favorite'));
      fetchFavorites();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          <Heart className="text-red-500 fill-red-500" size={28} />
          My Favorite Businesses
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Quickly access and stay updated with businesses you have bookmarked
        </p>
      </div>

      {loading ? (
        <div className="py-20">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorite businesses saved"
          message="When browsing businesses across Zanzibar, click the heart icon to save them here for quick access."
          action={
            <Link
              to="/businesses"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              <Building2 size={16} /> Explore Businesses
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favorites.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 flex flex-col justify-between hover:shadow-sm hover:border-blue-200 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/businesses/${f.businessId}`}
                      className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1"
                    >
                      {f.businessName}
                    </Link>

                    <button
                      onClick={() => removeFavorite(f.businessId, f.businessName)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                      title="Remove from favorites"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {f.categoryName && (
                      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md">
                        {f.categoryName}
                      </span>
                    )}
                    {f.businessLocation && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" /> {f.businessLocation}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  {f.createdAt ? (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> Saved {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                  ) : <span />}

                  <Link
                    to={`/businesses/${f.businessId}`}
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform"
                  >
                    View Details <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}
    </div>
  );
}
