import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, ArrowRight, User } from 'lucide-react';

export default function OrganizationCard({ organization }) {
  const { id, name, description, email, phone, logoUrl, ownerName } = organization;

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Header with Logo */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-blue-300 transition">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.innerHTML = '<span class="text-blue-600 font-bold text-xl">' + (name?.charAt(0) || 'O') + '</span>';
                }}
              />
            ) : (
              <span className="text-blue-600 font-bold text-xl">{name?.charAt(0) || 'O'}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link
              to={`/organizations/${id}`}
              className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition truncate block"
            >
              {name}
            </Link>
            {ownerName && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <User size={12} /> Lead: {ownerName}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {description ? (
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
            {description}
          </p>
        ) : (
          <p className="text-xs text-gray-400 italic mb-4">No description provided</p>
        )}

        {/* Contact info */}
        <div className="space-y-1.5 text-xs text-gray-500 pt-3 border-t border-gray-100">
          {email && (
            <div className="flex items-center gap-2 truncate">
              <Mail size={13} className="text-gray-400 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2">
              <Phone size={13} className="text-gray-400 shrink-0" />
              <span>{phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer link */}
      <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">Ecosystem Partner</span>
        <Link
          to={`/organizations/${id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-transform"
        >
          View Profile <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}