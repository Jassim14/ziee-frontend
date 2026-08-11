export default function Alert({ type = 'info', children, className = '' }) {
  const styles = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };
  return (
    <div className={`text-sm px-4 py-3 rounded-lg border ${styles[type]} ${className}`}>
      {children}
    </div>
  );
}
