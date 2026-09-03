import { useState, useEffect } from 'react';
import api from '../../api/axios';
import getErrorMessage from '../../utils/errors';
import { validateForm, required, phone, minLen, matches } from '../../utils/validation';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import FileUpload from '../../components/FileUpload';
import toast from 'react-hot-toast';
import { User, Save, Lock } from 'lucide-react';

const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";
const fieldError = "text-sm text-red-600 mt-1";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', profileImageUrl: '' });
  const [errors, setErrors] = useState({});
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdErrors, setPwdErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        const u = res.data.data;
        setUser(u);
        setForm({ fullName: u.fullName || '', email: u.email || '', phone: u.phone || '', profileImageUrl: u.profileImageUrl || '' });
      })
      .catch(err => setError(getErrorMessage(err, 'Failed to load profile')))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm({
      fullName: [required('Full name is required')],
      phone: [required('Phone number is required'), phone()],
    }, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await api.put('/auth/profile', { fullName: form.fullName.trim(), phone: form.phone.trim() });
      const updated = { ...user, fullName: form.fullName.trim(), phone: form.phone.trim() };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setSaved(true);
      toast.success('Profile updated successfully');
    } catch (err) {
      setError(getErrorMessage(err, 'Update failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm({
      currentPassword: [required('Current password is required')],
      newPassword: [required('New password is required'), minLen(6, 'New password must be at least 6 characters')],
      confirmPassword: [required('Please confirm your password'), matches('newPassword', 'Passwords do not match')],
    }, pwd);
    setPwdErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setChangingPwd(true);
    setError('');
    setSaved(false);
    try {
      await api.post('/auth/change-password', {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to change password'));
    } finally {
      setChangingPwd(false);
    }
  };

  if (loading) return <Spinner />;
  if (error && !user) return <div className="max-w-2xl mx-auto px-4 py-8"><Alert type="error">{error}</Alert></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          {form.profileImageUrl ? (
            <img src={form.profileImageUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={28} className="text-blue-600" />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{user?.fullName}</p>
            <p className="text-sm text-gray-500">{user?.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert type="error">{error}</Alert>}
          {saved && <div className="mb-4"><Alert type="success">Profile details saved.</Alert></div>}

          <div>
            <FileUpload
              onUploaded={(url) => setForm({ ...form, profileImageUrl: url || '' })}
              currentUrl={form.profileImageUrl}
              accept="image/*"
              endpoint="/auth/profile-image"
              deleteEndpoint="/auth/profile-image"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input type="text" className={`${inputClass} ${errors.fullName ? 'border-red-400' : ''}`}
              value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            {errors.fullName && <p className={fieldError}>{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" value={form.email} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input type="text" className={`${inputClass} ${errors.phone ? 'border-red-400' : ''}`}
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            {errors.phone && <p className={fieldError}>{errors.phone}</p>}
          </div>

          <button type="submit" disabled={saving}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50">
            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2"><Lock size={18} /> Change Password</h2>
        <p className="text-sm text-gray-500 mb-5">Use at least 6 characters for your new password.</p>

        <form onSubmit={handleChangePassword} className="space-y-5">
          {error && <Alert type="error">{error}</Alert>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <input type="password" className={`${inputClass} ${pwdErrors.currentPassword ? 'border-red-400' : ''}`}
              value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} />
            {pwdErrors.currentPassword && <p className={fieldError}>{pwdErrors.currentPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input type="password" className={`${inputClass} ${pwdErrors.newPassword ? 'border-red-400' : ''}`}
              value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} />
            {pwdErrors.newPassword && <p className={fieldError}>{pwdErrors.newPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <input type="password" className={`${inputClass} ${pwdErrors.confirmPassword ? 'border-red-400' : ''}`}
              value={pwd.confirmPassword} onChange={(e) => setPwd({ ...pwd, confirmPassword: e.target.value })} />
            {pwdErrors.confirmPassword && <p className={fieldError}>{pwdErrors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={changingPwd}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50">
            <Lock size={16} /> {changingPwd ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}