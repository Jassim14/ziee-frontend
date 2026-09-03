import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, loading = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
