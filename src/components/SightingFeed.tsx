import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, MapPin, Sparkles, Plus, Search, Filter, ShieldCheck, ChevronRight, Share2, Landmark } from 'lucide-react';
import { SightingReport, LocationCoords } from '../types';
import { calculateDistanceMiles } from '../lib/geo';
import { UapClassDefinition } from '../data/uapClassesData';

interface SightingFeedProps {
  sightings: SightingReport[];
  userLocation: LocationCoords;
  onSelectSighting: (sighting: SightingReport) => void;
  onUpvote: (id: string) => void;
  onOpenCreateReport: () => void;
  onOpenUapClassesGuide?: () => void;
}

export const SightingFeed: React.FC<SightingFeedProps> = ({
  sightings,
  userLocation,
  onSelectSighting,
  onUpvote,
  onOpenCreateReport,
  onOpenUapClassesGuide
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(sightings.flatMap((s) => s.tags)));

  const filteredSightings = sightings.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.locationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag ? s.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center space-x-2.5">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span>Community Anomaly Telemetry Stream</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time optical evidence & crowd-verified sightings deconflicted against civilian ADS-B transponders
          </p>
        </div>
        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          {onOpenUapClassesGuide && (
            <button
              onClick={onOpenUapClassesGuide}
              className="px-4 py-2.5 rounded-2xl glass-panel-subtle hover:bg-white/[0.08] border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold transition flex items-center space-x-2 cursor-pointer shadow-lg min-h-[44px]"
            >
              <Landmark className="w-4 h-4 text-cyan-400" />
              <span>9 Observed UAP Classes</span>
            </button>
          )}
          <button
            onClick={onOpenCreateReport}
            className="px-5 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Sighting</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by keywords, city, shape (e.g. Orb, Tic-Tac, San Diego)..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 min-h-[42px]"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1 scrollbar-none">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer min-h-[36px] ${
              selectedTag === null ? 'bg-cyan-400 text-slate-950 font-bold' : 'glass-pill text-slate-300 hover:text-white'
            }`}
          >
            All Logs
          </button>
          {allTags.slice(0, 5).map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer min-h-[36px] ${
                selectedTag === tag ? 'bg-cyan-400 text-slate-950 font-bold' : 'glass-pill text-slate-300 hover:text-white'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSightings.length === 0 ? (
          <div className="col-span-full p-12 rounded-3xl glass-panel text-center space-y-3">
            <p className="text-slate-300 font-semibold">No sightings match your query.</p>
            <button onClick={() => { setSearchTerm(''); setSelectedTag(null); }} className="px-4 py-2 rounded-xl glass-pill text-cyan-300 text-xs font-semibold cursor-pointer">
              Reset Filters
            </button>
          </div>
        ) : (
          filteredSightings.map((sighting) => {
            const dist = calculateDistanceMiles(userLocation.lat, userLocation.lng, sighting.location.lat, sighting.location.lng);
            return (
              <div
                key={sighting.id}
                onClick={() => onSelectSighting(sighting)}
                className="glass-panel border border-white/10 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between group cursor-pointer shadow-xl hover:shadow-cyan-950/20"
              >
                <div>
                  {sighting.mediaUrl && (
                    <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                      <img
                        src={sighting.mediaThumbnail || sighting.mediaUrl}
                        alt={sighting.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-mono font-bold text-cyan-300 border border-cyan-500/30">
                        {dist} mi from you
                      </div>
                      <div className="absolute top-3 right-3 bg-rose-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-mono font-bold text-rose-300 border border-rose-500/30">
                        {sighting.probabilityScore}% ANOMALY
                      </div>
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <span className="text-slate-300 font-medium">{sighting.observerName}</span>
                      <span>•</span>
                      <span className="flex items-center text-cyan-300">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                        {sighting.locationName}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-100 text-base group-hover:text-cyan-300 transition line-clamp-2">
                      {sighting.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                      {sighting.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sighting.tags.map((tag) => (
                        <span key={tag} className="text-xs font-mono bg-white/[0.04] text-slate-300 px-2 py-0.5 rounded-md border border-white/5">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpvote(sighting.id);
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer min-h-[34px] ${
                      sighting.upvotedByMe ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{sighting.upvotes}</span>
                  </button>
                  <div className="flex items-center space-x-1 text-cyan-300 group-hover:translate-x-0.5 transition">
                    <span className="font-medium text-xs">Technical Analysis</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
