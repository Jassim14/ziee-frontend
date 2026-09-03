import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, User as UserIcon } from 'lucide-react';
import RatingStars from './RatingStars';

const statusStyles = {
  APPROVED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  REJECTED: 'bg-red-100 text-red-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
};

function CardLogo({ business }) {
  const [failed, setFailed] = useState(false);
  const initial = business.name?.charAt(0)?.toUpperCase() || 'B';

  if (!business.logoUrl || failed) {
    return (
      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-white">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={business.logoUrl}
      alt={business.name}
      className="w-12 h-12 rounded-xl object-cover shadow-md border-2 border-white bg-white"
      onError={() => setFailed(true)}
    />
  );
}

function CardCover({ business }) {
  const [failed, setFailed] = useState(false);

  if (business.coverImageUrl && !failed) {
    return (
      <img
        src={business.coverImageUrl}
        alt={business.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-400 flex items-center justify-center">
      <span className="text-white/20 font-black text-6xl select-none">
        {business.name?.charAt(0)?.toUpperCase()}
      </span>
    </div>
  );
}

export default function BusinessCard({ business, showStatus = false }) {
  const ratingValue = business.averageRating || business.rating || 0;
  const reviewCount = business.reviewCount || 0;

  return (
    <Link
      to={`/businesses/${business.id}`}
      className="group bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all flex flex-col"
    >
      <div className="h-36 relative overflow-hidden bg-gray-100">
        <CardCover business={business} />
        <div className="absolute -bottom-3 left-4">
          <CardLogo business={business} />
        </div>
        {business.categoryName && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-semibold bg-white/90 backdrop-blur-xs text-blue-700 px-2.5 py-1 rounded-full shadow-xs">
              {business.categoryName}
            </span>
          </div>
        )}
      </div>

      <div className="pt-5 p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
            {business.name}
          </h3>
        </div>

        {showStatus && business.status && (
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full mt-2 self-start ${statusStyles[business.status] || 'bg-gray-100 text-gray-700'}`}>
            {business.status}
          </span>
        )}

        {ratingValue > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <RatingStars value={ratingValue} size={14} />
            <span className="text-xs font-semibold text-gray-700">{Number(ratingValue).toFixed(1)}</span>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-400">({reviewCount})</span>
            )}
          </div>
        )}

        {business.description && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-2 leading-relaxed">
            {business.description}
          </p>
        )}

        <div className="mt-auto pt-4 space-y-1.5 text-xs text-gray-500 border-t border-gray-100">
          {business.location && (
            <p className="flex items-center gap-1.5 truncate">
              <MapPin size={14} className="shrink-0 text-gray-400" /> {business.location}
            </p>
          )}
          {business.ownerName && (
            <p className="flex items-center gap-1.5 truncate">
              <UserIcon size={14} className="shrink-0 text-gray-400" /> {business.ownerName}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
