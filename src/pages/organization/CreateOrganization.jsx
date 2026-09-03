import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { organizationApi } from '../../api/services';
import getErrorMessage from '../../utils/errors';
import { validateForm, required, email, maxLen } from '../../utils/validation';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';
import FileUpload from '../../components/FileUpload';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Building2 } from 'lucide-react';

const inputClass =
  'w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition';
const fieldError = 'text-xs text-red-600 mt-1 font-medium';

export default function CreateOrganization() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    logoUrl: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    organizationApi
      .get(id)
      .then((o) => {
        if (!active) return;
        setForm({
          name: o.name || '',
          description: o.description || '',
          email: o.email || '',
          phone: o.phone || '',
          logoUrl: o.logoUrl || '',
        });
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Failed to load organization'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm(
      {
        name: [
          required('Organization name is required'),
          maxLen(100, 'Name must not exceed 100 characters'),
        ],
        description: [maxLen(1000, 'Description must not exceed 1000 characters')],
        email: [email('Please enter a valid email address')],
        phone: [maxLen(20, 'Phone must not exceed 20 characters')],
      },
      form
    );

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setError('');
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
      };

      if (isEdit) {
        if (form.logoUrl) payload.logoUrl = form.logoUrl;
        await organizationApi.update(id, payload);
        toast.success('Organization updated successfully');
      } else {
        await organizationApi.create(payload);
        toast.success('Organization registered successfully');
      }
      navigate('/my-organizations');
    } catch (err) {
      setError(getErrorMessage(err, isEdit ? 'Failed to update organization' : 'Failed to create organization'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/my-organizations"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} /> Back to My Organizations
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="text-blue-600" size={28} />
            {isEdit ? 'Edit Organization Profile' : 'Register New Organization'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEdit
              ? 'Update your organization details, branding, and contact channels.'
              : 'Register an organization to publish workshops, challenges, and support Zanzibari entrepreneurs.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert type="error" message={error} />}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Organization Name *
            </label>
            <input
              type="text"
              maxLength={100}
              placeholder="e.g. Zanzibar Tech & Innovation Hub"
              className={`${inputClass} ${errors.name ? 'border-red-400 bg-red-50/20' : ''}`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className={fieldError}>{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Mission & Description
            </label>
            <textarea
              maxLength={1000}
              rows={4}
              placeholder="Describe your organization's mission, training tracks, and support areas..."
              className={`${inputClass} resize-none ${errors.description ? 'border-red-400 bg-red-50/20' : ''}`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description ? (
                <p className={fieldError}>{errors.description}</p>
              ) : <div />}
              <span className="text-[11px] text-gray-400">
                {form.description.length} / 1000 characters
              </span>
            </div>
          </div>

          {/* Contact details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Official Email
              </label>
              <input
                type="email"
                placeholder="e.g. info@zantec.org"
                className={`${inputClass} ${errors.email ? 'border-red-400 bg-red-50/20' : ''}`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <p className={fieldError}>{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Official Phone
              </label>
              <input
                type="text"
                maxLength={20}
                placeholder="e.g. +255 777 000 111"
                className={`${inputClass} ${errors.phone ? 'border-red-400 bg-red-50/20' : ''}`}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              {errors.phone && <p className={fieldError}>{errors.phone}</p>}
            </div>
          </div>

          {/* Logo Upload in Edit Mode */}
          {isEdit && (
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                Organization Logo
              </label>
              <FileUpload
                label="Upload Logo (Square / Icon)"
                onUploaded={(url) => setForm({ ...form, logoUrl: url || '' })}
                currentUrl={form.logoUrl}
                endpoint={`/organizations/${id}/logo`}
                deleteEndpoint={`/organizations/${id}/logo`}
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/my-organizations')}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xs transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Register Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}