import React from 'react';
import { Educator } from '../types';
import { formatUGX } from '../utils/formatters';
import { ShieldCheck, Star, MapPin, Clock, Award, ArrowRight } from 'lucide-react';

interface EducatorCardProps {
  educator: Educator;
  onViewProfile: (educator: Educator) => void;
  onRequestBooking: (educator: Educator) => void;
}

export const EducatorCard: React.FC<EducatorCardProps> = ({
  educator,
  onViewProfile,
  onRequestBooking
}) => {
  const avatar = educator.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const name = educator.user?.name || 'Practitioner';

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Header with Photo, Name & Badges */}
        <div className="p-5 pb-4">
          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0">
              <img
                src={avatar}
                alt={name}
                className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm"
              />
              {educator.status === 'active' && (
                <span
                  title="Verified Practitioner"
                  className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full ring-2 ring-white shadow"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-semibold text-gray-900 text-base truncate group-hover:text-emerald-800 transition">
                  {name}
                </h3>
                {educator.rating > 0 && (
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{educator.rating.toFixed(1)}</span>
                    <span className="text-gray-600 font-normal">({educator.total_reviews})</span>
                  </div>
                )}
              </div>

              <p className="text-xs font-medium text-emerald-800 mt-0.5 truncate">
                {educator.title}
              </p>

              <div className="flex items-center gap-3 text-xs text-gray-700 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-600" />
                  <span className="truncate max-w-[140px]">{educator.location.split(',')[0]}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-600" />
                  <span>{educator.years_experience} yrs exp</span>
                </span>
              </div>
            </div>
          </div>

          {/* Short Bio */}
          <p className="mt-3 text-xs text-gray-800 line-clamp-2 leading-relaxed">
            {educator.bio}
          </p>

          {/* Formats & Skills Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {educator.teaching_formats.map(f => (
              <span
                key={f}
                className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700 capitalize border border-gray-200"
              >
                {f === 'in-person' ? 'In-Person Workshop' : f === 'online' ? 'Online Live' : 'Hybrid'}
              </span>
            ))}
            {educator.skills && educator.skills.slice(0, 2).map(s => (
              <span
                key={s.id}
                className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 truncate max-w-[150px]"
              >
                {s.skill_name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer with Rate & Action */}
      <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-gray-700 uppercase font-semibold block">Rate</span>
          <span className="text-sm font-bold text-gray-900">
            {formatUGX(educator.hourly_rate_ugx)}
            <span className="text-xs text-gray-600 font-normal"> / hr</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewProfile(educator)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 transition"
          >
            View Profile
          </button>
          <button
            onClick={() => onRequestBooking(educator)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition flex items-center gap-1"
          >
            <span>Learn</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
