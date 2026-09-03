import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import getErrorMessage from '../../utils/errors';
import { validateForm, required, minLen, matches } from '../../utils/validation';
import Alert from '../../components/Alert';
import SuccessMessage from '../../components/SuccessMessage';
import { KeyRound } from 'lucide-react';

const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    const nextErrors = validateForm({
      newPassword: [required('New password is required'), minLen(6)],
      confirmPassword: [required('Please confirm your password'), matches('newPassword', 'Passwords do not match')],
    }, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: form.newPassword });
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to reset password'));
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
          <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
          <p className="text-gray-500 mt-1">Choose a strong password you haven't used before</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {done ? (
            <SuccessMessage className="mb-4">
              Your password has been reset successfully.{' '}
              <Link to="/login" className="font-medium text-blue-700 hover:underline">Sign in</Link>.
            </SuccessMessage>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <Alert type="error">{error}</Alert>}
              {!token && <Alert type="warning">This link is missing a reset token. Please use the link from your email.</Alert>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  className={`${inputClass} ${errors.newPassword ? 'border-red-400' : ''}`}
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                />
                {errors.newPassword && <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  className={`${inputClass} ${errors.confirmPassword ? 'border-red-400' : ''}`}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
                {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <KeyRound size={18} />
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}