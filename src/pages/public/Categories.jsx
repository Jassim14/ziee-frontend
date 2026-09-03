import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryApi } from '../../api/services';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import EmptyState from '../../components/EmptyState';
import getErrorMessage from '../../utils/errors';
import { FolderOpen, ArrowRight, Search, Layers } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    categoryApi.list({ page: 0, size: 100 })
      .then(({ items }) => {
        if (active) setCategories(items);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Failed to load categories'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const filteredCategories = categories.filter((c) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Business Categories</h1>
          <p className="text-gray-500 mt-1">
            Browse and discover local businesses categorized across diverse industry sectors in Zanzibar
          </p>
        </div>

        {/* Search Filter */}
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={search ? 'No matching categories' : 'No categories available'}
          message={
            search
              ? `No category found matching "${search}". Try another search keyword.`
              : 'Categories have not been added yet.'
          }
          action={
            search && (
              <button
                onClick={() => setSearch('')}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                Clear Search
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((c) => (
            <Link
              key={c.id}
              to={`/businesses?categoryId=${c.id}`}
              className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <FolderOpen size={22} className="text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                  {c.name}
                </h3>
                {c.description ? (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-2 italic">No description provided</p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Explore businesses</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
