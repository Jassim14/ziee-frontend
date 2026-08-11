export default function Spinner({ size = 'h-10 w-10', label }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${size}`}></div>
      {label && <p className="mt-3 text-sm">{label}</p>}
    </div>
  );
}
