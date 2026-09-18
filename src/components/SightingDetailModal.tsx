import React, { useState } from 'react';
import { X, ThumbsUp, MessageSquare, Send, Sparkles, MapPin, Share2, ShieldCheck, Tag, Calendar } from 'lucide-react';
import { SightingReport } from '../types';

interface SightingDetailModalProps {
  sighting: SightingReport | null;
  onClose: () => void;
  onUpvote: (id: string) => void;
  onShareToChat?: (sighting: SightingReport) => void;
  onOpenTriangulation?: () => void;
}

export const SightingDetailModal: React.FC<SightingDetailModalProps> = ({
  sighting,
  onClose,
  onUpvote,
  onShareToChat,
  onOpenTriangulation
}) => {
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState([
    { id: 'c1', author: 'Dr. Elena Rostova', badge: 'Astrophysicist', text: 'NORAD telemetry confirms no Starlink train or ISS pass was active over San Diego at that exact timestamp.', timestamp: '1 hour ago' },
    { id: 'c2', author: 'RadarAnalyst_Max', badge: 'ADS-B Analyst', text: 'Checked FAA 1090MHz primary radar logs. Zero transponder squawk recorded. High probability anomaly confirmed.', timestamp: '35 mins ago' }
  ]);

  if (!sighting) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentsList([
      ...commentsList,
      {
        id: `c-${Date.now()}`,
        author: 'You (SkyLight_Observer)',
        badge: 'Member',
        text: commentText,
        timestamp: 'Just now'
      }
    ]);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="glass-panel border border-white/15 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-6">
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {sighting.status.replace(/_/g, ' ')}
            </span>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-100">{sighting.title}</h2>
            <div className="text-xs sm:text-sm text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
              <span className="flex items-center text-slate-300">
                <MapPin className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                {sighting.locationName}
              </span>
              <span>•</span>
              <span className="text-slate-300">{sighting.observerName} ({sighting.observerBadge})</span>
              <span>•</span>
              <span className="text-cyan-300 font-medium flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                {new Date(sighting.timestamp).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sighting.mediaUrl && (
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950/80 max-h-84 flex items-center justify-center">
            {sighting.mediaType === 'video' || sighting.mediaUrl.startsWith('blob:') || sighting.mediaUrl.includes('.mp4') || sighting.mediaUrl.includes('.webm') ? (
              <video
                src={sighting.mediaUrl}
                poster={sighting.mediaThumbnail}
                controls
                playsInline
                className="w-full max-h-84 object-contain mx-auto bg-black"
              />
            ) : (
              <img src={sighting.mediaThumbnail || sighting.mediaUrl} alt={sighting.title} className="w-full h-full object-cover max-h-84" />
            )}
          </div>
        )}

        <div className="space-y-3.5 text-sm sm:text-base text-slate-200 leading-relaxed">
          <p>{sighting.description}</p>
          {sighting.matchedTelemetryNote && (
            <div className="p-4 rounded-2xl glass-panel-subtle border border-cyan-500/30 text-xs sm:text-sm font-sans text-cyan-200 flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{sighting.matchedTelemetryNote}</span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 rounded-2xl glass-panel-subtle border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Check Sky Light Anomaly Probability Score</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 tracking-tight">{sighting.probabilityScore}% INDEX</div>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => onUpvote(sighting.id)}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 cursor-pointer min-h-[44px] ${
                sighting.upvotedByMe
                  ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'glass-pill text-slate-200 hover:text-white'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Upvote ({sighting.upvotes})</span>
            </button>
            <button
              onClick={() => {
                onShareToChat(sighting);
                onClose();
              }}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl glass-pill hover:bg-white/[0.08] text-slate-200 hover:text-white text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>Share to Encrypted Chat</span>
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/10">
          <h3 className="text-xs sm:text-sm uppercase text-slate-300 font-bold flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-cyan-400" />
            Community Technical Analysis Comments ({commentsList.length})
          </h3>
          <div className="space-y-3">
            {commentsList.map((c) => (
              <div key={c.id} className="p-3.5 sm:p-4 rounded-2xl glass-panel-subtle border border-white/10 text-xs sm:text-sm space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-100">{c.author}</span>
                    <span className="px-2 py-0.5 text-xs font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                      {c.badge}
                    </span>
                  </div>
                  <span className="text-slate-400 text-xs">{c.timestamp}</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">{c.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-2.5">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add your radar or optical analysis note..."
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 min-h-[44px]"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm hover:bg-cyan-300 transition flex items-center space-x-1.5 cursor-pointer shrink-0 min-h-[44px]"
            >
              <Send className="w-4 h-4" />
              <span>Post</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
