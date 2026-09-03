import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trainingApi } from '../../api/services';
import TrainingCard from '../../components/TrainingCard';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import getErrorMessage from '../../utils/errors';
import { BookOpen, Search, Filter, Globe, MapPin, ArrowUpDown, X, Sparkles } from 'lucide-react';

const TRAINING_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'IN_PERSON', label: 'In Person' },
  { value: 'HYBRID', label: 'Hybrid' },
];

export default function BrowseTrainings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trainings, setTrainings] = useState([]);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [upcomingOnly, setUpcomingOnly] = useState(searchParams.get('upcomingOnly') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'startDate');
  const [sortDir, setSortDir] = useState(searchParams.get('sortDir') || 'asc');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const fetchTrainings = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = {
      page,
      size: 9,
      sortBy,
      sortDir,
    };
    if (search.trim()) params.search = search.trim();
    if (type) params.type = type;
    if (location.trim()) params.location = location.trim();
    if (upcomingOnly) params.upcomingOnly = true;

    try {
      const data = await trainingApi.list(params);
      setTrainings(data.items);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load trainings and workshops'));
      setTrainings([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, type, location, upcomingOnly, sortBy, sortDir]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  // Sync with searchParams
  useEffect(() => {
    const p = new URLSearchParams();
    if (page > 0) p.set('page', String(page));
    if (search) p.set('search', search);
    if (type) p.set('type', type);
    if (location) p.set('location', location);
    if (upcomingOnly) p.set('upcomingOnly', 'true');
    if (sortBy !== 'startDate') p.set('sortBy', sortBy);
    if (sortDir !== 'asc') p.set('sortDir', sortDir);
    setSearchParams(p, { replace: true });
  }, [page, search, type, location, upcomingOnly, sortBy, sortDir, setSearchParams]);

  const handleReset = () => {
    setSearch('');
    setType('');
    setLocation('');
    setUpcomingOnly(false);
    setSortBy('startDate');
    setSortDir('asc');
    setPage(0);
  };

  const hasActiveFilters = Boolean(search || type || location || upcomingOnly);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-200">
          <Sparkles size={13} />
          Capacity Building & Skills Development
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Trainings & Workshops
        </h1>
        <p className="text-gray-500 mt-2 max-w-3xl leading-relaxed">
          Enhance your entrepreneurship skills, business management, digital literacy, and tourism hospitality through certified programs hosted across Zanzibar.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 sm:p-5 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by training topic, skills, or provider..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
            />
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-44">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
            >
              {TRAINING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="w-full md:w-48 relative">
            <select
              value={`${sortBy}:${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split(':');
                setSortBy(sb);
                setSortDir(sd);
                setPage(0);
              }}
              className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition appearance-none cursor-pointer"
            >
              <option value="startDate:asc">Date: Upcoming First</option>
              <option value="startDate:desc">Date: Latest First</option>
              <option value="title:asc">Title: A-Z</option>
              <option value="createdAt:desc">Newly Added</option>
            </select>
            <ArrowUpDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Upcoming Only Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none whitespace-nowrap px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl hover:bg-gray-100 transition w-full md:w-auto">
            <input
              type="checkbox"
              checked={upcomingOnly}
              onChange={(e) => {
                setUpcomingOnly(e.target.checked);
                setPage(0);
              }}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span>Upcoming Only</span>
          </label>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-500 font-medium">Active Filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold">
                  "{search}"
                  <button onClick={() => setSearch('')} className="hover:text-blue-900"><X size={12} /></button>
                </span>
              )}
              {type && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold">
                  Type: {type}
                  <button onClick={() => setType('')} className="hover:text-blue-900"><X size={12} /></button>
                </span>
              )}
              {upcomingOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold">
                  Upcoming Only
                  <button onClick={() => setUpcomingOnly(false)} className="hover:text-blue-900"><X size={12} /></button>
                </span>
              )}
            </div>

            <button
              onClick={handleReset}
              className="text-blue-600 hover:text-blue-700 font-semibold underline"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="py-24">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : trainings.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={hasActiveFilters ? 'No matching trainings found' : 'No published trainings available'}
          message={
            hasActiveFilters
              ? 'No trainings match your active search filters. Try clearing or adjusting your criteria.'
              : 'New workshops and trainings are published regularly by our partner organizations.'
          }
          action={
            hasActiveFilters && (
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
              >
                Reset Filters
              </button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainings.map((t) => (
              <TrainingCard key={t.id} training={t} />
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