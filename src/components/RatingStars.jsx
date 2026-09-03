import { Star } from 'lucide-react';

export default function RatingStars({ value = 0, size = 16, onChange, className = '' }) {
  const interactive = typeof onChange === 'function';

  return (
    <div className={`flex items-center gap-0.5 ${className}`} role={interactive ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= Math.round(value);
        const star = (
          <Star
            key={s}
            size={size}
            className={
              filled
                ? 'fill-yellow-400 text-yellow-400'
                : interactive
                  ? 'text-gray-300 hover:fill-yellow-400 hover:text-yellow-400'
                  : 'text-gray-300'
            }
          />
        );
        if (!interactive) return star;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            aria-label={`${s} star${s > 1 ? 's' : ''}`}
            className="p-0.5 rounded focus:outline-none focus-visible:ring-2 ring-blue-400"
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}