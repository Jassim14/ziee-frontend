import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(0, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible);
  if (end - start < maxVisible) start = Math.max(0, end - maxVisible);

  for (let i = start; i < end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {start > 0 && (
        <>
          <button onClick={() => onPageChange(0)} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition">1</button>
          {start > 1 && <span className="text-gray-400 text-sm">...</span>}
        </>
      )}

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
            p === page
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-200 hover:bg-gray-50 text-gray-700'
          }`}
        >
          {p + 1}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-gray-400 text-sm">...</span>}
          <button onClick={() => onPageChange(totalPages - 1)} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition">{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
