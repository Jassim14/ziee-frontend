import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">Z</span>
            </div>
            <span className="font-bold text-gray-900">ZIEE</span>
            <span className="text-sm text-gray-500 ml-2">Zanzibar Integrated Entrepreneur Ecosystem</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <Link to="/about" className="hover:text-blue-700">About</Link>
            <Link to="/contact" className="hover:text-blue-700">Contact</Link>
            <Link to="/businesses" className="hover:text-blue-700">Businesses</Link>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} ZIEE. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
