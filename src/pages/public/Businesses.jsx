import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import BusinessCard from '../../components/BusinessCard';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import getErrorMessage from '../../utils/errors';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Businesses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('categoryId') || '';

  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [input, setInput] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = { page, size: 9 };
    if (search) params.search = search;
    if (selectedCategory) params.categoryId = selectedCategory;

    api.get('/businesses/search', { params })
      .then(res => {
        setBusinesses(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      })
      .catch(err => setError(getErrorMessage(err, 'Failed to load businesses')))
      .finally(() => setLoading(false));
  }, [search, selectedCategory, page]);

  const applyFilters = (nextSearch, nextCategory) => {
    setSearch(nextSearch);
    setSelectedCategory(nextCategory);
    setPage(0);
    const qp = {};
    if (nextSearch) qp.search = nextSearch;
    if (nextCategory) qp.categoryId = nextCategory;
    setSearchParams(qp, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover Businesses</h1>
        <p className="text-gray-500 mt-1">Find the best local businesses and services in Zanzibar</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
        <form
          onSubmit={(e) => { e.preventDefault(); applyFilters(input, selectedCategory); }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search businesses..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            value={selectedCategory}
            onChange={(e) => applyFilters(search, e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : businesses.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-200">
          <p className="text-lg font-medium text-gray-700 mb-1">No businesses found</p>
          <p className="text-sm">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map(b => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                aria-label="Previous page"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                aria-label="Next page"
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
