import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Search, MapPin, ArrowRight, Building2, Users, Briefcase } from 'lucide-react';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/businesses/search', { params: { page: 0, size: 6 } })
      .then(res => setFeatured(res.data.data.content))
      .catch(() => setFeatured([]));
  }, []);

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data.data))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: Briefcase, label: 'Local Businesses', value: 'Discover' },
    { icon: Users, label: 'Ecosystem', value: 'Entrepreneurs' },
    { icon: Building2, label: 'Organizations', value: 'Support' },
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Grow your business with the Zanzibar Entrepreneur Ecosystem
            </h1>
            <p className="mt-4 text-lg text-blue-100">
              ZIEE connects entrepreneurs, customers, and organizations across Zanzibar.
              Discover businesses, share experiences, and be part of a thriving community.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/businesses?search=${encodeURIComponent(search)}`;
              }}
              className="mt-8 flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur rounded-2xl p-3"
            >
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search businesses, services, and more..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-gray-900"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition"
              >
                Search
              </button>
            </form>

            <div className="mt-8 flex flex-wrap gap-3">
              {stats.map(s => (
                <div key={s.label} className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5">
                  <s.icon size={18} className="text-blue-200" />
                  <div>
                    <p className="text-xs text-blue-200">{s.label}</p>
                    <p className="text-sm font-semibold">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Briefcase size={20} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Register your business</h3>
            <p className="text-sm text-gray-500 mt-1">Create a business profile and reach customers across Zanzibar.</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <MapPin size={20} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Get discovered</h3>
            <p className="text-sm text-gray-500 mt-1">Customers search, review, and favorite businesses they love.</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Users size={20} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Join the ecosystem</h3>
            <p className="text-sm text-gray-500 mt-1">Connect with organizations offering training, challenges, and support.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured businesses</h2>
            <p className="text-gray-500 text-sm mt-1">Handpicked businesses from the ZIEE community</p>
          </div>
          <Link to="/businesses" className="flex items-center gap-1 text-blue-600 font-medium text-sm hover:text-blue-700">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-200">No businesses yet â€” be the first to join!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(b => (
              <Link key={b.id} to={`/businesses/${b.id}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                <div className="h-36 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">{b.name.charAt(0)}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 text-lg">{b.name}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{b.categoryName}</span>
                  </div>
                  {b.location && <p className="text-gray-500 text-sm mt-2 flex items-center gap-1"><MapPin size={14} /> {b.location}</p>}
                  {b.description && <p className="text-gray-600 text-sm mt-2 line-clamp-2">{b.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(c => (
              <Link key={c.id} to={`/businesses?categoryId=${c.id}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition">
                <h3 className="font-semibold text-gray-900">{c.name}</h3>
                {c.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
