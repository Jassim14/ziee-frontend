import { CheckCircle2, Clock, XCircle, AlertCircle, Sparkles, Check, Ban } from 'lucide-react';

const statusMap = {
  // Common / General
  ACTIVE: { style: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2, label: 'Active' },
  INACTIVE: { style: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertCircle, label: 'Inactive' },
  PENDING: { style: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pending' },
  APPROVED: { style: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2, label: 'Approved' },
  REJECTED: { style: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Rejected' },
  CANCELLED: { style: 'bg-gray-100 text-gray-600 border-gray-200', icon: Ban, label: 'Cancelled' },

  // Training / Challenge publication status
  PUBLISHED: { style: 'bg-blue-50 text-blue-700 border-blue-200', icon: Sparkles, label: 'Published' },
  DRAFT: { style: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'Draft' },
  UNPUBLISHED: { style: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertCircle, label: 'Unpublished' },

  // Challenges status
  OPEN: { style: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Open' },
  CLOSED: { style: 'bg-rose-50 text-rose-700 border-rose-200', icon: Ban, label: 'Closed' },

  // Participation / Applications status
  REGISTERED: { style: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2, label: 'Registered' },
  ACCEPTED: { style: 'bg-green-50 text-green-700 border-green-200', icon: Check, label: 'Accepted' },
  ATTENDED: { style: 'bg-purple-50 text-purple-700 border-purple-200', icon: CheckCircle2, label: 'Attended' },
  COMPLETED: { style: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: CheckCircle2, label: 'Completed' },
};

export default function StatusBadge({ status, className = '' }) {
  if (!status) return null;
  const key = String(status).toUpperCase();
  const config = statusMap[key] || {
    style: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: AlertCircle,
    label: status,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.style} ${className}`}
    >
      <Icon size={12} className="shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}