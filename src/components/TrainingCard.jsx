import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Calendar, MapPin, Users, Globe, Building, ArrowRight, Clock, AlertTriangle } from 'lucide-react';

export default function TrainingCard({ training }) {
  const {
    id,
    title,
    description,
    imageUrl,
    provider,
    organizationName,
    startDate,
    endDate,
    location,
    type,
    capacity,
    registrationDeadline,
    publicationStatus,
    status,
  } = training;

  const isOnline = type?.toUpperCase() === 'ONLINE';
  const isHybrid = type?.toUpperCase() === 'HYBRID';

  // Deadline check
  const isDeadlinePassed = registrationDeadline && new Date(registrationDeadline) < new Date();

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Banner Image */}
        <div className="h-44 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 relative overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="text-white/30 text-6xl font-black select-none">ZIEE</div>
          )}

          {/* Type Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
            {isOnline ? <Globe size={12} /> : <MapPin size={12} />}
            <span>{type || 'IN_PERSON'}</span>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <StatusBadge status={publicationStatus || status || 'PUBLISHED'} className="bg-white/90 shadow-xs" />
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {/* Organization Name */}
          <p className="text-xs font-semibold text-blue-600 flex items-center gap-1 mb-1 truncate">
            <Building size={12} className="shrink-0" />
            <span className="truncate">{organizationName || provider || 'ZIEE Partner'}</span>
          </p>

          {/* Title */}
          <Link
            to={`/trainings/${id}`}
            className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition line-clamp-2 leading-snug mb-2"
          >
            {title}
          </Link>

          {/* Description */}
          {description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
              {description}
            </p>
          )}

          {/* Metadata Grid */}
          <div className="space-y-1.5 text-xs text-gray-500 pt-3 border-t border-gray-100">
            {startDate && (
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-gray-400 shrink-0" />
                <span>
                  {new Date(startDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {endDate && ` - ${new Date(endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                </span>
              </div>
            )}

            {location && !isOnline && (
              <div className="flex items-center gap-2 truncate">
                <MapPin size={13} className="text-gray-400 shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}

            {capacity && (
              <div className="flex items-center gap-2">
                <Users size={13} className="text-gray-400 shrink-0" />
                <span>Capacity: {capacity} seats</span>
              </div>
            )}

            {registrationDeadline && (
              <div className={`flex items-center gap-2 ${isDeadlinePassed ? 'text-red-500 font-semibold' : ''}`}>
                <Clock size={13} className={isDeadlinePassed ? 'text-red-500 shrink-0' : 'text-gray-400 shrink-0'} />
                <span>
                  {isDeadlinePassed ? 'Deadline passed' : `Deadline: ${new Date(registrationDeadline).toLocaleDateString()}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="px-5 py-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">
          {isDeadlinePassed ? (
            <span className="text-rose-600 flex items-center gap-1 font-medium">
              <AlertTriangle size={12} /> Registration Closed
            </span>
          ) : (
            <span className="text-emerald-600 font-medium">Open for Registration</span>
          )}
        </span>

        <Link
          to={`/trainings/${id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-transform"
        >
          Details & Register <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}