export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
      {Icon && <Icon size={48} className="mx-auto text-gray-300 mb-4" />}
      <p className="text-gray-500 text-lg font-medium">{title}</p>
      {message && <p className="text-gray-400 text-sm mt-1">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
