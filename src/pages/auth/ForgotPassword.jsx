import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import getErrorMessage from '../../utils/errors';
import { validateForm, required, email } from '../../utils/validation';
import Alert from '../../components/Alert';
import SuccessMessage from '../../components/SuccessMessage';
import { KeyRound } from 'lucide-react';

const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";

export default function ForgotPassword() {
  const [emailValue, setEmailValue] = useState('');
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm({
      email: [required('Email is required'), email()],
    }, { email: emailValue });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setNotice('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: emailValue.trim() });
      setSent(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setNotice('Password reset is not enabled yet. Please contact support.');
      } else {
        setNotice(getErrorMessage(err, 'Could not send reset link'));
      }
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
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-gray-500 mt-1">Enter your email and we'll send you a reset link</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {sent ? (
            <SuccessMessage className="mb-4">
              If an account exists for <strong>{emailValue}</strong>, a password reset link has been sent. Check your inbox.
            </SuccessMessage>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {notice && <Alert type="warning">{notice}</Alert>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  className={`${inputClass} ${errors.email ? 'border-red-400' : ''}`}
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <KeyRound size={18} />
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
          <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}