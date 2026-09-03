import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import getErrorMessage from '../../utils/errors';
import { validateForm, required, email } from '../../utils/validation';
import Alert from '../../components/Alert';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';

const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('session_expired')) {
      sessionStorage.removeItem('session_expired');
      toast.error('Your session has expired. Please sign in again.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm({
      email: [required('Email is required'), email()],
      password: [required('Password is required')],
    }, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setError('');
    setLoading(true);
    try {
      const result = await login(form.email.trim(), form.password);
      if (result.success) {
        toast.success(`Welcome back, ${result.user.fullName || 'user'}!`);
        const redirectTo = location.state?.from || searchParams.get('from') || '/dashboard';
        navigate(redirectTo);
      } else if (result.message === 'EMAIL_NOT_VERIFIED') {
        sessionStorage.setItem('verifyEmail', form.email.trim());
        toast.error('Please verify your email before signing in.');
        navigate('/verify-email');
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your ZIEE account</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert type="error">{error}</Alert>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                className={`${inputClass} ${errors.email ? 'border-red-400' : ''}`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                className={`${inputClass} ${errors.password ? 'border-red-400' : ''}`}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm text-blue-600 font-medium hover:text-blue-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn size={18} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:text-blue-700">Register</Link>
        </p>
      </div>
    </div>
  );
}