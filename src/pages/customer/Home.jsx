import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Search, MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, size: 9 };
    if (search) params.search = search;
    if (selectedCategory) params.categoryId = selectedCategory;

    api.get('/businesses/search', { params })
      .then(res => {
        setBusinesses(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [search, selectedCategory, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover Businesses in Zanzibar</h1>
        <p className="text-gray-500 mt-2">Find the best local businesses and services</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search businesses..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </div>
          <select
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(0); }}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No businesses found</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map(b => (
              <Link key={b.id} to={`/business/${b.id}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">{b.name.charAt(0)}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 text-lg">{b.name}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{b.categoryName}</span>
                  </div>
                  {b.location && (
                    <p className="text-gray-500 text-sm mt-2 flex items-center gap-1">
                      <MapPin size={14} /> {b.location}
                    </p>
                  )}
                  {b.description && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{b.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
