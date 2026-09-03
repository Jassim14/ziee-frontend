import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { organizationApi } from '../../api/services';
import OrganizationCard from '../../components/OrganizationCard';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import getErrorMessage from '../../utils/errors';
import { Building2, Search, SlidersHorizontal, ArrowUpDown, MapPin } from 'lucide-react';

export default function Organizations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [organizations, setOrganizations] = useState([]);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'name');
  const [sortDir, setSortDir] = useState(searchParams.get('sortDir') || 'asc');

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = {
      page,
      size: 9,
      sortBy,
      sortDir,
    };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (location.trim()) params.location = location.trim();

    try {
      const data = await organizationApi.list(params);
      setOrganizations(data.items);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load ecosystem organizations'));
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, location, sortBy, sortDir]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Sync to URL
  useEffect(() => {
    const p = new URLSearchParams();
    if (page > 0) p.set('page', String(page));
    if (searchQuery) p.set('search', searchQuery);
    if (location) p.set('location', location);
    if (sortBy !== 'name') p.set('sortBy', sortBy);
    if (sortDir !== 'asc') p.set('sortDir', sortDir);
    setSearchParams(p, { replace: true });
  }, [page, searchQuery, location, sortBy, sortDir, setSearchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setLocation('');
    setSortBy('name');
    setSortDir('asc');
    setPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Partner Organizations
        </h1>
        <p className="text-gray-500 mt-2 max-w-3xl leading-relaxed">
          Discover institutions, accelerators, government agencies, and non-profits empowering entrepreneurship across Zanzibar through mentorship, trainings, and innovation challenges.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search organizations by name, mission, or lead..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative flex-1 sm:flex-initial sm:w-44">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Location..."
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs transition"
              />
            </div>

            <div className="relative">
              <select
                value={`${sortBy}:${sortDir}`}
                onChange={(e) => {
                  const [sb, sd] = e.target.value.split(':');
                  setSortBy(sb);
                  setSortDir(sd);
                  setPage(0);
                }}
                className="pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition appearance-none cursor-pointer"
              >
                <option value="name:asc">Name (A-Z)</option>
                <option value="name:desc">Name (Z-A)</option>
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
              </select>
              <ArrowUpDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              Search
            </button>
          </div>
        </form>

        {searchQuery && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs">
            <span className="text-gray-500">
              Showing results for: <strong className="text-gray-800">"{searchQuery}"</strong> ({totalElements} total)
            </span>
            <button
              onClick={handleResetFilters}
              className="text-blue-600 hover:text-blue-700 font-semibold underline"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-24">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : organizations.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={searchQuery ? 'No organizations match your search' : 'No organizations listed yet'}
          message={
            searchQuery
              ? `No partner organization found matching "${searchQuery}". Try a different search term.`
              : 'Registered partner organizations will appear here as they join the ecosystem.'
          }
          action={
            searchQuery && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
              >
                Reset Filters
              </button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
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