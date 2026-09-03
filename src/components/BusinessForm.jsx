import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryApi, businessApi } from '../api/services';
import getErrorMessage from '../utils/errors';
import { validateForm, required, email, maxLen } from '../utils/validation';
import Alert from './Alert';
import Spinner from './Spinner';
import FileUpload from './FileUpload';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Upload, Trash2, Image as ImageIcon } from 'lucide-react';

const inputClass =
  'w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition';
const fieldError = 'text-xs text-red-600 mt-1 font-medium';

export default function BusinessForm({ mode, businessId, initial, onSaved }) {
  const isEdit = mode === 'edit';
  const navigate = useNavigate();
  const galleryInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    phone: '',
    email: '',
    categoryId: '',
    logoUrl: '',
    coverImageUrl: '',
  });
  const [gallery, setGallery] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit && !initial);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load categories and initial values
  useEffect(() => {
    let active = true;
    categoryApi
      .list({ page: 0, size: 100 })
      .then(({ items }) => {
        if (!active) return;
        setCategories(items);

        if (isEdit && initial) {
          const matched = items.find((c) => c.name === initial.categoryName || c.id === initial.categoryId);
          setForm({
            name: initial.name || '',
            description: initial.description || '',
            location: initial.location || '',
            phone: initial.phone || '',
            email: initial.email || '',
            categoryId: matched ? String(matched.id) : initial.categoryId ? String(initial.categoryId) : '',
            logoUrl: initial.logoUrl || '',
            coverImageUrl: initial.coverImageUrl || '',
          });
        }
      })
      .catch(() => {
        if (active) toast.error('Could not load categories');
      })
      .finally(() => {
        if (active) setLoadingCategories(false);
      });

    if (isEdit && businessId) {
      businessApi.gallery(businessId)
        .then((items) => {
          if (active) setGallery(items);
        })
        .catch(() => {});
    }

    return () => { active = false; };
  }, [isEdit, initial, businessId]);

  const handleGalleryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !businessId) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Gallery image must be under 5 MB');
      return;
    }

    setUploadingGallery(true);
    try {
      await businessApi.uploadGallery(businessId, file);
      const updatedGallery = await businessApi.gallery(businessId);
      setGallery(updatedGallery);
      toast.success('Gallery photo added');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to upload gallery image'));
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleDeleteGalleryImage = async (imageId) => {
    if (!businessId || !imageId) return;
    try {
      await businessApi.deleteGallery(businessId, imageId);
      setGallery((prev) => prev.filter((img) => img.id !== imageId));
      toast.success('Gallery photo removed');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to remove gallery photo'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm(
      {
        name: [
          required('Business name is required'),
          maxLen(100, 'Name must not exceed 100 characters'),
        ],
        description: [maxLen(1000, 'Description must not exceed 1000 characters')],
        location: [
          required('Location is required'),
          maxLen(200, 'Location must not exceed 200 characters'),
        ],
        phone: [
          required('Phone number is required'),
          maxLen(20, 'Phone must not exceed 20 characters'),
        ],
        email: [
          required('Email is required'),
          email('Enter a valid email address'),
        ],
        categoryId: [required('Please select a category')],
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
        location: form.location.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        categoryId: parseInt(form.categoryId, 10),
      };

      if (isEdit) {
        if (form.logoUrl) payload.logoUrl = form.logoUrl;
        if (form.coverImageUrl) payload.coverImageUrl = form.coverImageUrl;
        await businessApi.update(businessId, payload);
        toast.success('Business profile updated successfully!');
        if (onSaved) onSaved(true);
      } else {
        const created = await businessApi.create(payload);
        toast.success('Business registered successfully!');
        if (onSaved) onSaved(created);
      }
    } catch (err) {
      setError(getErrorMessage(err, isEdit ? 'Failed to update business' : 'Failed to create business'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/my-businesses')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} /> Back to My Businesses
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {isEdit ? 'Edit Business Profile' : 'Register New Business'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEdit
              ? 'Update your business information, contact details, branding, and gallery.'
              : 'Fill in your business details to register your enterprise with the ZIEE ecosystem.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert type="error" message={error} />}

          {/* Business Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Business Name *
            </label>
            <input
              type="text"
              maxLength={100}
              placeholder="e.g. Zanzibar Spice & Coffee Lounge"
              className={`${inputClass} ${errors.name ? 'border-red-400 bg-red-50/20' : ''}`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className={fieldError}>{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              disabled={loadingCategories}
              className={`${inputClass} bg-white disabled:bg-gray-50 ${
                errors.categoryId ? 'border-red-400 bg-red-50/20' : ''
              }`}
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">
                {loadingCategories ? 'Loading categories...' : 'Select a category'}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className={fieldError}>{errors.categoryId}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Description & Services / Products
            </label>
            <textarea
              maxLength={1000}
              rows={4}
              placeholder="Tell customers about your business, products, services, opening hours, and values..."
              className={`${inputClass} resize-none ${
                errors.description ? 'border-red-400 bg-red-50/20' : ''
              }`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description ? (
                <p className={fieldError}>{errors.description}</p>
              ) : <div />}
              <span className="text-[11px] text-gray-400 font-medium">
                {form.description.length} / 1000 characters
              </span>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Location / Address *
            </label>
            <input
              type="text"
              maxLength={200}
              placeholder="e.g. Hurumzi Street, Stone Town, Zanzibar"
              className={`${inputClass} ${errors.location ? 'border-red-400 bg-red-50/20' : ''}`}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            {errors.location && <p className={fieldError}>{errors.location}</p>}
          </div>

          {/* Contact Details (Phone & Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Official Phone *
              </label>
              <input
                type="text"
                maxLength={20}
                placeholder="e.g. +255 777 123 456"
                className={`${inputClass} ${errors.phone ? 'border-red-400 bg-red-50/20' : ''}`}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              {errors.phone && <p className={fieldError}>{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Official Email *
              </label>
              <input
                type="email"
                placeholder="e.g. info@spicecoffee.tz"
                className={`${inputClass} ${errors.email ? 'border-red-400 bg-red-50/20' : ''}`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <p className={fieldError}>{errors.email}</p>}
            </div>
          </div>

          {/* Branding Images (Logo and Cover) in Edit Mode */}
          {isEdit && (
            <div className="pt-6 border-t border-gray-100 space-y-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Branding & Imagery
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FileUpload
                  label="Business Logo (Icon / Square)"
                  onUploaded={(url) => setForm({ ...form, logoUrl: url || '' })}
                  currentUrl={form.logoUrl}
                  endpoint={`/businesses/${businessId}/logo`}
                  deleteEndpoint={`/businesses/${businessId}/logo`}
                />

                <FileUpload
                  label="Cover Banner Image (Header)"
                  onUploaded={(url) => setForm({ ...form, coverImageUrl: url || '' })}
                  currentUrl={form.coverImageUrl}
                  endpoint={`/businesses/${businessId}/cover`}
                  deleteEndpoint={`/businesses/${businessId}/cover`}
                />
              </div>

              {/* Photo Gallery Manager */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Photo Gallery ({gallery.length})
                    </label>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Add photos of your storefront, products, and services
                    </p>
                  </div>

                  <div>
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingGallery}
                      onClick={() => galleryInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Upload size={14} />
                      {uploadingGallery ? 'Uploading...' : 'Add Gallery Photo'}
                    </button>
                  </div>
                </div>

                {gallery.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {gallery.map((img) => {
                      const url = typeof img === 'string' ? img : img?.filePath;
                      return (
                        <div
                          key={img.id}
                          className="group relative h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
                        >
                          <img
                            src={url}
                            alt="Gallery photo"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryImage(img.id)}
                            className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-700"
                            title="Delete photo"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl text-center">
                    <ImageIcon size={28} className="mx-auto text-gray-300 mb-1" />
                    <p className="text-xs text-gray-400">No gallery photos added yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/my-businesses')}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white py-2.5 px-6 rounded-xl font-semibold hover:bg-blue-700 shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {saving
                ? isEdit
                  ? 'Saving changes...'
                  : 'Registering...'
                : isEdit
                ? 'Save Changes'
                : 'Register Business'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}