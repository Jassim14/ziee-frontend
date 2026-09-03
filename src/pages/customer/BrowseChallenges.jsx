import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { challengeApi } from '../../api/services';
import ChallengeCard from '../../components/ChallengeCard';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import getErrorMessage from '../../utils/errors';
import { Trophy, Search, ArrowUpDown, X, Sparkles } from 'lucide-react';

export default function BrowseChallenges() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [challenges, setChallenges] = useState([]);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [openOnly, setOpenOnly] = useState(searchParams.get('openOnly') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'deadline');
  const [sortDir, setSortDir] = useState(searchParams.get('sortDir') || 'asc');

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = {
      page,
      size: 9,
      sortBy,
      sortDir,
    };
    if (search.trim()) params.search = search.trim();
    if (openOnly) params.openOnly = true;

    try {
      const data = await challengeApi.list(params);
      setChallenges(data.items);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load innovation challenges'));
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, openOnly, sortBy, sortDir]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Sync to URL
  useEffect(() => {
    const p = new URLSearchParams();
    if (page > 0) p.set('page', String(page));
    if (search) p.set('search', search);
    if (openOnly) p.set('openOnly', 'true');
    if (sortBy !== 'deadline') p.set('sortBy', sortBy);
    if (sortDir !== 'asc') p.set('sortDir', sortDir);
    setSearchParams(p, { replace: true });
  }, [page, search, openOnly, sortBy, sortDir, setSearchParams]);

  const handleReset = () => {
    setSearch('');
    setOpenOnly(false);
    setSortBy('deadline');
    setSortDir('asc');
    setPage(0);
  };

  const hasActiveFilters = Boolean(search || openOnly);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-3 border border-amber-200">
          <Sparkles size={13} />
          Innovation & Entrepreneurship Competitions
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Innovation Challenges & Hackathons
        </h1>
        <p className="text-gray-500 mt-2 max-w-3xl leading-relaxed">
          Pitch innovative solutions, solve real community and industry problems across Zanzibar, and compete for incubation grants, prizes, and mentorship.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 sm:p-5 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search challenges by keyword, topic, or prizes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-48 relative">
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
              <option value="deadline:asc">Deadline: Soonest First</option>
              <option value="deadline:desc">Deadline: Latest First</option>
              <option value="title:asc">Title: A-Z</option>
              <option value="createdAt:desc">Newly Added</option>
            </select>
            <ArrowUpDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Open Only Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none whitespace-nowrap px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl hover:bg-gray-100 transition w-full sm:w-auto">
            <input
              type="checkbox"
              checked={openOnly}
              onChange={(e) => {
                setOpenOnly(e.target.checked);
                setPage(0);
              }}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span>Open Challenges Only</span>
          </label>
        </div>

        {/* Active filters */}
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
              {openOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold">
                  Open Challenges Only
                  <button onClick={() => setOpenOnly(false)} className="hover:text-blue-900"><X size={12} /></button>
                </span>
              )}
            </div>

            <button
              onClick={handleReset}
              className="text-blue-600 hover:text-blue-700 font-semibold underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-24">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : challenges.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={hasActiveFilters ? 'No matching challenges found' : 'No challenges open'}
          message={
            hasActiveFilters
              ? 'No challenges matched your search filters. Try clearing your filters.'
              : 'New innovation challenges will appear here as soon as partner organizations publish them.'
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
            {challenges.map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
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