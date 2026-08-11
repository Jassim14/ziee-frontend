import { Link } from 'react-router-dom';
import { Users, Briefcase, Building2, Heart } from 'lucide-react';

const pillars = [
  {
    icon: Users,
    title: 'For Entrepreneurs',
    text: 'Register your business, manage your profile, and get approved to reach customers across Zanzibar.',
  },
  {
    icon: Heart,
    title: 'For Customers',
    text: 'Discover local businesses, read reviews, and save your favorites for later.',
  },
  {
    icon: Building2,
    title: 'For Organizations',
    text: 'Participate in the ecosystem with training programs, challenges, and shared growth.',
  },
  {
    icon: Briefcase,
    title: 'For Administrators',
    text: 'Keep the ecosystem healthy by approving businesses and managing categories.',
  },
];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">About ZIEE</h1>
        <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
          The <strong>Zanzibar Integrated Entrepreneur Ecosystem</strong> is a digital platform
          that brings together the people who make Zanzibar's economy grow: entrepreneurs, their
          customers, supporting organizations, and administrators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pillars.map(p => (
          <div key={p.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <p.icon size={22} className="text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900 text-lg">{p.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{p.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to get involved?</h2>
        <p className="mt-2 text-blue-100">Join the ecosystem today — it's free.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link to="/register" className="px-6 py-2.5 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition">
            Join ZIEE
          </Link>
          <Link to="/businesses" className="px-6 py-2.5 border border-white/40 text-white rounded-lg font-semibold hover:bg-white/10 transition">
            Browse businesses
          </Link>
        </div>
      </div>
    </div>
  );
}
