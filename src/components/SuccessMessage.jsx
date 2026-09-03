import { CheckCircle2 } from 'lucide-react';

export default function SuccessMessage({ children, className = '' }) {
  return (
    <div className={`text-sm px-4 py-3 rounded-lg border bg-green-50 text-green-700 border-green-200 flex items-start gap-2 ${className}`}>
      <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}