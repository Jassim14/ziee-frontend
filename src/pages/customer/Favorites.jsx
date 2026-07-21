import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Heart, MapPin, Trash2 } from 'lucide-react';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/favorites').then(res => {
      setFavorites(res.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const removeFavorite = async (businessId) => {
    await api.post(`/favorites/${businessId}`);
    setFavorites(favorites.filter(f => f.businessId !== businessId));
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Favorites</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No favorites yet</p>
          <Link to="/" className="text-blue-600 text-sm mt-2 inline-block hover:text-blue-700">Browse businesses</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map(f => (
            <div key={f.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
              <Link to={`/business/${f.businessId}`} className="flex-1">
                <h3 className="font-semibold text-gray-900">{f.businessName}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {f.businessLocation}
                </p>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">{f.categoryName}</span>
              </Link>
              <button onClick={() => removeFavorite(f.businessId)} className="p-2 text-gray-400 hover:text-red-500 transition">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
