import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { businessApi, categoryApi } from '../../api/services';
import BusinessCard from '../../components/BusinessCard';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import { Search, ArrowRight, Building2, Users, Briefcase, Sparkles, FolderOpen } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      businessApi.search({ page: 0, size: 6, sortBy: 'createdAt', sortDir: 'desc' }),
      categoryApi.list({ page: 0, size: 8, sortBy: 'name', sortDir: 'asc' }),
    ])
      .then(([bizData, catData]) => {
        if (!active) return;
        setFeatured(bizData.items || []);
        setCategories(catData.items || []);
      })
      .catch((err) => {
        if (active) setError('Unable to load content. Please try again later.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const stats = [
    { icon: Briefcase, label: 'Local Businesses', value: 'Discover' },
    { icon: Users, label: 'Ecosystem', value: 'Entrepreneurs' },
    { icon: Building2, label: 'Support & Growth', value: 'Programs' },
  ];

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/businesses?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/businesses');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        <div></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold mb-6 border border-white/15 text-blue-100">
              <Sparkles size={14} className="text-yellow-300" />
              Zanzibar Entrepreneur Ecosystem
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Empowering Zanzibar's Thriving Business Community
            </h1>
            <p className="mt-4 text-base sm:text-lg text-blue-100 leading-relaxed">
              Connect with certified local businesses, discover authentic services, support entrepreneurs, and explore ecosystem development programs across Zanzibar.
            </p>

            <form
              onSubmit={handleHeroSearch}
              className="mt-8 flex flex-col sm:flex-row gap-2.5 bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/20 shadow-2xl"
            >
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search businesses, services, spices, crafts..."
                  className="w-full pl-10 pr-4 py-3 bg-white rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-gray-900 text-sm placeholder-gray-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="px-7 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition shadow-md text-sm whitespace-nowrap"
              >
                Search Marketplace
              </button>
            </form>

            <div className="mt-10 flex flex-wrap gap-3">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl px-4 py-2.5">
                  <s.icon size={18} className="text-blue-200" />
                  <div>
                    <p className="text-[11px] text-blue-200 uppercase tracking-wider">{s.label}</p>
                    <p className="text-sm font-bold text-white">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
              <Briefcase size={22} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Register Your Business</h3>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              Create an official profile, upload photo galleries, and gain public credibility across Zanzibar.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6">
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center mb-4 text-green-600">
              <Users size={22} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Customer Reviews & Ratings</h3>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              Discover top-rated services, save your favorites, and leave genuine reviews for businesses.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-purple-600">
              <Building2 size={22} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Ecosystem Opportunities</h3>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              Participate in specialized training programs and entrepreneurship challenges to accelerate growth.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Featured Businesses
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Explore recently registered and approved enterprises in Zanzibar
            </p>
          </div>
          <Link
            to="/businesses"
            className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-sm hover:text-blue-700 transition"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="py-16">
            <Spinner />
          </div>
        ) : error ? (
          <div className="py-16">
            <Alert type="error">{error}</Alert>
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-white rounded-2xl border border-gray-200">
            <Building2 size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="font-medium text-gray-700">No businesses listed yet</p>
            <p className="text-xs text-gray-400 mt-1">Be the first entrepreneur to register your business on ZIEE!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        )}
      </section>

      {/* Browse by Category */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Browse by Category
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Find exactly what you are looking for by industry sector
              </p>
            </div>
            <Link
              to="/categories"
              className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-sm hover:text-blue-700 transition"
            >
              All Categories <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/businesses?categoryId=${c.id}`}
                className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                    <FolderOpen size={18} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors line-clamp-1">
                    {c.name}
                  </h3>
                </div>
                {c.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
