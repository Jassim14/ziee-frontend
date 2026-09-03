import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function FileUpload({
  onUploaded,
  currentUrl,
  label = 'Upload file',
  accept = 'image/*',
  endpoint = '/files/upload',
  deleteEndpoint = null,
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || null);
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const body = res.data.data;
      const url = typeof body === 'string' ? body : body?.filePath;
      onUploaded(url);
      toast.success('File uploaded');
    } catch {
      toast.error('Upload failed');
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const clear = async () => {
    setPreview(null);
    onUploaded(null);
    if (inputRef.current) inputRef.current.value = '';
    if (deleteEndpoint) {
      try {
        await api.delete(deleteEndpoint);
      } catch {
        // server state may differ; keep the local clear
      }
    }
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}

      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="h-24 w-24 rounded-lg object-cover border border-gray-200" />
          <button
            type="button"
            onClick={clear}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={18} />
              Click to upload
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFile}
        className="hidden"
      />
      <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
        <ImageIcon size={12} /> JPG, PNG or WEBP up to 5 MB
      </p>
    </div>
  );
}