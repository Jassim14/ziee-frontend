import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { businessApi, categoryApi } from '../../api/services';
import BusinessCard from '../../components/BusinessCard';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import EmptyState from '../../components/EmptyState';
import getErrorMessage from '../../utils/errors';
import { Search, MapPin, SlidersHorizontal, RotateCcw, Building2 } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Newest First', sortBy: 'createdAt', sortDir: 'desc' },
  { label: 'Name (A to Z)', sortBy: 'name', sortDir: 'asc' },
  { label: 'Name (Z to A)', sortBy: 'name', sortDir: 'desc' },
  { label: 'Location (A to Z)', sortBy: 'location', sortDir: 'asc' },
];

export default function Businesses() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('categoryId') || '';
  const currentLocation = searchParams.get('location') || '';
  const currentSortIndex = Number(searchParams.get('sort')) || 0;
  const currentPage = Number(searchParams.get('page')) || 0;

  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [locationInput, setLocationInput] = useState(currentLocation);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [sortIndex, setSortIndex] = useState(currentSortIndex);
  const [page, setPage] = useState(currentPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState('');

  // Load categories
  useEffect(() => {
    let active = true;
    categoryApi.list({ page: 0, size: 100 })
      .then(({ items }) => {
        if (active) setCategories(items);
      })
      .catch(() => {
        if (active) setCategories([]);
      })
      .finally(() => {
        if (active) setLoadingCategories(false);
      });
    return () => { active = false; };
  }, []);

  // Fetch businesses based on URL search params
  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError('');

    const sortOpt = SORT_OPTIONS[sortIndex] || SORT_OPTIONS[0];
    const params = {
      page,
      size: 9,
      sortBy: sortOpt.sortBy,
      sortDir: sortOpt.sortDir,
    };

    if (currentSearch.trim()) params.search = currentSearch.trim();
    if (selectedCategory) params.categoryId = selectedCategory;
    if (currentLocation.trim()) params.location = currentLocation.trim();

    try {
      const data = await businessApi.search(params);
      setBusinesses(data.items);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load businesses'));
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, [currentSearch, selectedCategory, currentLocation, sortIndex, page]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const updateFilters = (newParams) => {
    const qp = {};
    if (newParams.search) qp.search = newParams.search;
    if (newParams.categoryId) qp.categoryId = newParams.categoryId;
    if (newParams.location) qp.location = newParams.location;
    if (newParams.sort && Number(newParams.sort) !== 0) qp.sort = newParams.sort;
    if (newParams.page && Number(newParams.page) > 0) qp.page = newParams.page;
    setSearchParams(qp);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    updateFilters({
      search: searchInput.trim(),
      categoryId: selectedCategory,
      location: locationInput.trim(),
      sort: sortIndex,
      page: 0,
    });
  };

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setPage(0);
    updateFilters({
      search: searchInput.trim(),
      categoryId: catId,
      location: locationInput.trim(),
      sort: sortIndex,
      page: 0,
    });
  };

  const handleSortChange = (idx) => {
    setSortIndex(idx);
    setPage(0);
    updateFilters({
      search: searchInput.trim(),
      categoryId: selectedCategory,
      location: locationInput.trim(),
      sort: idx,
      page: 0,
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateFilters({
      search: currentSearch,
      categoryId: selectedCategory,
      location: currentLocation,
      sort: sortIndex,
      page: newPage,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setLocationInput('');
    setSelectedCategory('');
    setSortIndex(0);
    setPage(0);
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(currentSearch || selectedCategory || currentLocation || sortIndex !== 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Discover Businesses</h1>
        <p className="text-gray-500 mt-1">
          Explore registered businesses, services, and innovative ventures across Zanzibar
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 sm:p-5 mb-8">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Keyword Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or keyword..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <select
                aria-label="Filter by category"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition text-gray-700"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={loadingCategories}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Search */}
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by location (e.g. Stone Town)..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
              />
            </div>

            {/* Sort Options */}
            <div className="relative">
              <select
                aria-label="Sort businesses"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition text-gray-700"
                value={sortIndex}
                onChange={(e) => handleSortChange(Number(e.target.value))}
              >
                {SORT_OPTIONS.map((opt, idx) => (
                  <option key={idx} value={idx}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <SlidersHorizontal size={14} />
              <span>
                {totalElements > 0
                  ? `Showing ${businesses.length} of ${totalElements} ${totalElements === 1 ? 'business' : 'businesses'}`
                  : 'No businesses to display'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1.5"
                >
                  <RotateCcw size={13} /> Reset Filters
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-xs transition"
              >
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-20">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : businesses.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No businesses found"
          message="Try adjusting your keyword search, location, or selected category to find matching businesses."
          action={
            hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
              >
                <RotateCcw size={16} /> Clear All Filters
              </button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
