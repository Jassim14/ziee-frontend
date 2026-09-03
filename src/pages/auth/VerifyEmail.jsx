import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/services';
import getErrorMessage from '../../utils/errors';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import { ShieldCheck, ArrowLeft, RotateCcw } from 'lucide-react';

const COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 6;

const inputBox =
  'w-12 h-14 text-center text-xl font-bold border-2 rounded-lg outline-none transition-colors ' +
  'focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [email] = useState(() => sessionStorage.getItem('verifyEmail') || '');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);

  // Redirect if no email stored
  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const focusInput = useCallback((index) => {
    if (index >= 0 && index < OTP_LENGTH && inputRefs.current[index]) {
      inputRefs.current[index].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow single digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError('');

    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...otp];
      if (next[index]) {
        next[index] = '';
        setOtp(next);
      } else if (index > 0) {
        next[index - 1] = '';
        setOtp(next);
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtp(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const otpString = otp.join('');
  const isComplete = otpString.length === OTP_LENGTH && /^\d{6}$/.test(otpString);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!isComplete) return;

    setError('');
    setLoading(true);
    try {
      const res = await authApi.verifyEmail(email, otpString);
      if (res.success) {
        setSuccess(true);
        sessionStorage.removeItem('verifyEmail');
        toast.success('Email verified successfully!');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(res.message || 'Verification failed');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Verification failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return;

    setError('');
    setResendLoading(true);
    try {
      const res = await authApi.resendVerification(email);
      if (res.success) {
        toast.success('New verification code sent!');
        setCooldown(COOLDOWN_SECONDS);
        setOtp(Array(OTP_LENGTH).fill(''));
        focusInput(0);
      } else {
        setError(res.message || 'Failed to resend code');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to resend verification code'));
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="h-10 w-10" label="Redirecting..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
          <p className="text-gray-500 mt-1">
            We sent a verification code to
          </p>
          <p className="text-gray-900 font-medium mt-1">{email}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="text-green-600" size={32} />
              </div>
              <h2 className="text-lg font-bold text-green-700">Email verified!</h2>
              <p className="text-sm text-gray-500 mt-2">Redirecting to sign in...</p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              {error && <Alert type="error">{error}</Alert>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Enter the 6-digit code
                </label>
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onFocus={(e) => e.target.select()}
                      className={`${inputBox} ${digit ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                      aria-label={`Digit ${i + 1}`}
                      autoComplete="off"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!isComplete || loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Spinner size="h-5 w-5" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Verify Email
                  </>
                )}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
              <button
                onClick={handleResend}
                disabled={cooldown > 0 || resendLoading}
                className="text-sm text-blue-600 font-medium hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1 mx-auto"
              >
                <RotateCcw size={14} />
                {resendLoading
                  ? 'Sending...'
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Resend Code'}
              </button>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
          <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center gap-1">
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
