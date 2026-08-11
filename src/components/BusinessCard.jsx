import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, User as UserIcon } from 'lucide-react';

const statusStyles = {
  APPROVED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  REJECTED: 'bg-red-100 text-red-700',
};

function CardImage({ business }) {
  const [failed, setFailed] = useState(false);
  if (!business.logoUrl || failed) {
    return (
      <span className="text-white text-4xl font-bold">
        {business.name?.charAt(0)?.toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={business.logoUrl}
      alt={business.name}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function BusinessCard({ business, showStatus = false }) {
  return (
    <Link
      to={`/businesses/${business.id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col"
    >
      <div className="h-36 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
        <CardImage business={business} />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{business.name}</h3>
          {business.categoryName && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full shrink-0">
              {business.categoryName}
            </span>
          )}
        </div>
        {showStatus && business.status && (
          <span className={`text-xs px-2 py-0.5 rounded-full mt-2 self-start ${statusStyles[business.status] || 'bg-gray-100 text-gray-700'}`}>
            {business.status}
          </span>
        )}
        {business.description && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{business.description}</p>
        )}
        <div className="mt-auto pt-3 space-y-1 text-sm text-gray-500">
          {business.location && (
            <p className="flex items-center gap-1.5">
              <MapPin size={14} className="shrink-0" /> {business.location}
            </p>
          )}
          {business.ownerName && (
            <p className="flex items-center gap-1.5">
              <UserIcon size={14} className="shrink-0" /> {business.ownerName}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
