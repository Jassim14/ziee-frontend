import { LogIn, X, Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginPromptModal({ open, onClose, title = 'Sign in required', message = 'Please sign in to continue.' }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!open) return null;

  const handleSignIn = () => {
    onClose();
    navigate('/login', { state: { from: location.pathname + location.search } });
  };

  const handleRegister = () => {
    onClose();
    navigate('/register', { state: { from: location.pathname + location.search } });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
            <Lock size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">Access full ecosystem features</p>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSignIn}
            className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <LogIn size={18} /> Sign In
          </button>
          <button
            onClick={handleRegister}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
