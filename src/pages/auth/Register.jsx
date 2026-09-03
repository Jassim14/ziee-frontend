import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import getErrorMessage from '../../utils/errors';
import { validateForm, required, email, phone, minLen, matches } from '../../utils/validation';
import Alert from '../../components/Alert';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";
const fieldError = "text-sm text-red-600 mt-1";

const INITIAL = { fullName: '', email: '', password: '', confirmPassword: '', phone: '', role: 'CUSTOMER' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm({
      fullName: [required('Full name is required')],
      email: [required('Email is required'), email()],
      password: [required('Password is required'), minLen(6)],
      confirmPassword: [required('Please confirm your password'), matches('password', 'Passwords do not match')],
      phone: [required('Phone number is required'), phone()],
    }, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setError('');
    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        role: form.role,
      };
      const res = await register(payload);
      if (res.success) {
        sessionStorage.setItem('verifyEmail', form.email.trim());
        toast.success('Account created! Please verify your email.');
        navigate('/verify-email');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'));
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
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-1">Join the ZIEE ecosystem</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert type="error">{error}</Alert>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" className={`${inputClass} ${errors.fullName ? 'border-red-400' : ''}`}
                value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              {errors.fullName && <p className={fieldError}>{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" className={`${inputClass} ${errors.email ? 'border-red-400' : ''}`}
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p className={fieldError}>{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" className={`${inputClass} ${errors.password ? 'border-red-400' : ''}`}
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              {errors.password && <p className={fieldError}>{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input type="password" className={`${inputClass} ${errors.confirmPassword ? 'border-red-400' : ''}`}
                value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
              {errors.confirmPassword && <p className={fieldError}>{errors.confirmPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input type="text" className={`${inputClass} ${errors.phone ? 'border-red-400' : ''}`}
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              {errors.phone && <p className={fieldError}>{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">I am a</label>
              <select
                className={`${inputClass} bg-white`}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="ENTREPRENEUR">Entrepreneur</option>
                <option value="ORGANIZATION">Organization</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus size={18} />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}