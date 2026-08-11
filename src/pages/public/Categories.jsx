import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import getErrorMessage from '../../utils/errors';
import { FolderOpen, ArrowRight } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data.data))
      .catch(err => setError(getErrorMessage(err, 'Failed to load categories')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-500 mt-1">Browse businesses by category</p>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-200">
          <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p>No categories available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map(c => (
            <Link
              key={c.id}
              to={`/businesses?categoryId=${c.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition group"
            >
              <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FolderOpen size={22} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">{c.name}</h3>
              {c.description && <p className="text-sm text-gray-500 mt-1">{c.description}</p>}
              <span className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium mt-3 group-hover:gap-2 transition-all">
                Browse businesses <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
