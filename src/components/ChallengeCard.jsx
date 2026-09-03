import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Trophy, Calendar, Users, Building, ArrowRight, Clock, Award, AlertTriangle } from 'lucide-react';

export default function ChallengeCard({ challenge }) {
  const {
    id,
    title,
    description,
    imageUrl,
    deadline,
    status,
    publicationStatus,
    prizes,
    requirements,
    maxParticipants,
    organizationName,
  } = challenge;

  const isDeadlinePassed = deadline && new Date(deadline) < new Date();
  const isOpen = (status === 'OPEN' || !status) && !isDeadlinePassed;

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Banner Image */}
        <div className="h-44 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 relative overflow-hidden flex items-center justify-center">
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
            <Trophy size={64} className="text-white/30" />
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <StatusBadge status={status || 'OPEN'} className="bg-white/90 shadow-xs" />
          </div>

          {/* Prizes pill */}
          {prizes && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-400/30">
              <Award size={13} />
              <span className="truncate max-w-[200px]">{prizes}</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5">
          {/* Organization */}
          <p className="text-xs font-semibold text-blue-600 flex items-center gap-1 mb-1 truncate">
            <Building size={12} className="shrink-0" />
            <span className="truncate">{organizationName || 'ZIEE Innovation Hub'}</span>
          </p>

          {/* Title */}
          <Link
            to={`/challenges/${id}`}
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

          {/* Metadata */}
          <div className="space-y-1.5 text-xs text-gray-500 pt-3 border-t border-gray-100">
            {deadline && (
              <div className={`flex items-center gap-2 ${isDeadlinePassed ? 'text-red-500 font-semibold' : ''}`}>
                <Clock size={13} className={isDeadlinePassed ? 'text-red-500 shrink-0' : 'text-gray-400 shrink-0'} />
                <span>
                  {isDeadlinePassed ? 'Application closed' : `Deadline: ${new Date(deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                </span>
              </div>
            )}

            {maxParticipants && (
              <div className="flex items-center gap-2">
                <Users size={13} className="text-gray-400 shrink-0" />
                <span>Max teams / applicants: {maxParticipants}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="px-5 py-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold">
          {isOpen ? (
            <span className="text-emerald-600 font-medium">Accepting Applications</span>
          ) : (
            <span className="text-rose-600 font-medium flex items-center gap-1">
              <AlertTriangle size={12} /> Closed
            </span>
          )}
        </span>

        <Link
          to={`/challenges/${id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-transform"
        >
          View & Apply <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}