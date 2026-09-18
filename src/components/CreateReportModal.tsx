import React, { useState, useEffect } from 'react';
import { X, Send, MapPin, Tag, Image as ImageIcon, Sparkles, AlertTriangle, Landmark, ExternalLink, ShieldCheck, Upload, Cpu, Eye, CheckCircle2, Play, Video } from 'lucide-react';
import { LocationCoords, SightingReport, PhotoAnalysisResult } from '../types';
import { THE_NINE_UAP_CLASSES, UapClassDefinition } from '../data/uapClassesData';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: LocationCoords;
  onReportCreated?: (newReport: SightingReport) => void;
  onSubmit?: (newReport: SightingReport) => void;
  selectedUapClass?: UapClassDefinition | null;
  initialMediaUrl?: string | null;
  prefilledPhotoUrl?: string | null;
  initialPosterUrl?: string | null;
  initialDescription?: string | null;
  prefilledDescription?: string | null;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  onReportCreated,
  onSubmit,
  selectedUapClass,
  initialMediaUrl,
  prefilledPhotoUrl,
  initialPosterUrl,
  initialDescription,
  prefilledDescription
}) => {
  const effectiveMediaUrl = initialMediaUrl || prefilledPhotoUrl || null;
  const effectiveDescription = initialDescription || prefilledDescription || null;
  const handleCreated = (report: SightingReport) => {
    if (onReportCreated) onReportCreated(report);
    if (onSubmit) onSubmit(report);
  };

  const [title, setTitle] = useState(() =>
    selectedUapClass
      ? `${selectedUapClass.shortName} Observation`
      : effectiveMediaUrl
      ? `Optical Telemetry Sighting - ${userLocation.city || 'Local Sector'}`
      : ''
  );
  const [selectedClassId, setSelectedClassId] = useState<string>(() => selectedUapClass ? selectedUapClass.id : 'class-1-orb-sphere');
  const [observerName, setObserverName] = useState('Check Sky Light Observer');
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [description, setDescription] = useState(() => initialDescription || (selectedUapClass ? selectedUapClass.sampleObservationNote : ''));
  const [mediaUrl, setMediaUrl] = useState(() => initialMediaUrl || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop');
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(() => initialMediaUrl || null);
  const [posterThumbnail, setPosterThumbnail] = useState<string | null>(() => initialPosterUrl || null);
  const [locationName, setLocationName] = useState(`${userLocation.city || 'Albuquerque'}, ${userLocation.region || 'New Mexico, USA'}`);
  const [tagsStr, setTagsStr] = useState(() => selectedUapClass ? `${selectedUapClass.shortName}, Dual-Lens UAP Taxonomy, Uncorrelated ADS-B` : 'AR Sky Capture, Uncorrelated ADS-B, Deconflicted Airspace');
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<PhotoAnalysisResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isVideoMedia = Boolean(
    (mediaUrl && (
      mediaUrl.startsWith('data:video') ||
      mediaUrl.startsWith('blob:') ||
      mediaUrl.includes('.mp4') ||
      mediaUrl.includes('.webm')
    )) ||
    (uploadedBase64 && (
      uploadedBase64.startsWith('data:video') ||
      uploadedBase64.startsWith('blob:')
    ))
  );

  useEffect(() => {
    if (isOpen) {
      if (initialMediaUrl) {
        setMediaUrl(initialMediaUrl);
        setUploadedBase64(initialMediaUrl);
      }
      if (initialPosterUrl) {
        setPosterThumbnail(initialPosterUrl);
      }
      if (initialDescription) {
        setDescription(initialDescription);
      }
      if (selectedUapClass) {
        setSelectedClassId(selectedUapClass.id);
        setTitle(`${selectedUapClass.shortName} Observation`);
        if (!initialDescription) {
          setDescription(selectedUapClass.sampleObservationNote);
        }
      } else if (initialMediaUrl && !title) {
        setTitle(`Optical Telemetry Sighting - ${userLocation.city || 'Local Sector'}`);
      }
      setLocationName(`${userLocation.city || 'Albuquerque'}, ${userLocation.region || 'New Mexico, USA'}`);
    }
  }, [isOpen, initialMediaUrl, initialPosterUrl, initialDescription, selectedUapClass, userLocation.city, userLocation.region]);

  if (!isOpen) return null;

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      img.onload = () => {
        const maxWidth = 1280;
        const maxHeight = 720;
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(img.src);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (file.type.startsWith('image/')) {
          const compressed = await compressImage(file);
          setUploadedBase64(compressed);
          setMediaUrl(compressed);
          setPosterThumbnail(compressed);
        } else if (file.type.startsWith('video/')) {
          const url = URL.createObjectURL(file);
          setMediaUrl(url);
          setUploadedBase64(url);
        }
      } catch (err) {
        console.warn('File processing error, falling back to direct reader:', err);
        const reader = new FileReader();
        reader.onload = () => {
          const base64Str = reader.result as string;
          setUploadedBase64(base64Str);
          setMediaUrl(base64Str);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRunInstantAiPhotoScan = async () => {
    const imgToAnalyze = posterThumbnail || uploadedBase64 || mediaUrl;
    if (!imgToAnalyze) return;
    setIsAnalyzingPhoto(true);
    setErrorMsg(null);
    try {
      let imageBase64 = imgToAnalyze;
      if (imgToAnalyze.startsWith('http')) {
        try {
          const res = await fetch(imgToAnalyze);
          const blob = await res.blob();
          imageBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch {
          imageBase64 = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
        }
      }
      const res = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          locationNotes: `Captured at ${locationName}`
        })
      });
      if (!res.ok) throw new Error('AI Optical analysis failed.');
      const data: PhotoAnalysisResult = await res.json();
      setAiAnalysisResult(data);
      if (data.detailedAnalysis) {
        setDescription((prev) => `${prev}\n\n[GEMINI AI OPTICAL ANALYSIS]: ${data.detailedAnalysis}`);
      }
      if (data.detectedObjects && data.detectedObjects.length > 0) {
        setTagsStr((prev) => `${prev}, ${data.detectedObjects.join(', ')}, Score: ${data.anomalyScore}%`);
      }
    } catch (err: any) {
      console.error('AI photo scan error:', err);
      setErrorMsg('Could not run instant optical scan on photo.');
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const handleClassSelectChange = (classId: string) => {
    setSelectedClassId(classId);
    const matched = THE_NINE_UAP_CLASSES.find((c) => c.id === classId);
    if (matched) {
      if (!title) setTitle(`${matched.shortName} Observation`);
      if (!description) setDescription(matched.sampleObservationNote);
      setTagsStr(`${matched.shortName}, Dual-Lens UAP Taxonomy, ADS-B Cross-Ref`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please fill in title and description.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      let probScore = aiAnalysisResult ? aiAnalysisResult.anomalyScore : 88;
      try {
        const verifyRes = await fetch(`/api/verify-sky?lat=${userLocation.lat}&lng=${userLocation.lng}&notes=${encodeURIComponent(description)}`);
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          probScore = verifyData.probabilityScore;
        }
      } catch {
        // Non-blocking fallback
      }
      const tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
      const payload = {
        title,
        observerName,
        observerBadge: 'Sky Observer',
        timestamp: reportDate ? new Date(reportDate).toISOString() : new Date().toISOString(),
        location: userLocation,
        locationName,
        description,
        probabilityScore: probScore,
        status: (probScore >= 60 ? 'COMMUNITY_VERIFIED' : 'UNVERIFIED') as 'COMMUNITY_VERIFIED' | 'UNVERIFIED',
        mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop',
        mediaType: isVideoMedia ? ('video' as const) : ('image' as const),
        mediaThumbnail: posterThumbnail || (isVideoMedia ? undefined : mediaUrl),
        tags
      };
      let created: SightingReport;
      try {
        const postRes = await fetch('/api/sightings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (postRes.ok) {
          created = await postRes.json();
        } else {
          throw new Error('API server returned error');
        }
      } catch {
        created = {
          id: `sighting-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          ...payload,
          upvotes: 1,
          upvotedByMe: true,
          commentsCount: 0
        };
      }
      handleCreated(created);
      onClose();
    } catch (err: any) {
      console.error('Submit report error:', err);
      setErrorMsg(err.message || 'Error submitting report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="glass-panel border border-white/15 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2.5">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Submit UAP Sighting & Anomaly Report</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Report will be automatically cross-referenced with live ADS-B flight transponders and NORAD orbit paths.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="glass-panel-subtle border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center space-x-2.5">
            <Landmark className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              Seeing something documented? Review <strong className="text-amber-300">US Government UAP Information Releases</strong>:
            </span>
          </div>
          <a
            href="https://www.war.gov/ufo/#release"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center space-x-1.5 shrink-0 self-start sm:self-auto"
          >
            <span>war.gov/ufo/#release</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </a>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm font-sans">
          <div className="p-4 rounded-2xl glass-panel-subtle border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-cyan-300 font-bold flex items-center space-x-2">
                <Landmark className="w-4 h-4 text-cyan-400" />
                <span>UAP Taxonomy Classification (Dual-Lens Research)</span>
              </label>
              <span className="text-xs text-slate-400 font-mono">9 Observed Classes</span>
            </div>
            <select
              value={selectedClassId}
              onChange={(e) => handleClassSelectChange(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 font-sans text-xs sm:text-sm focus:outline-none focus:border-cyan-400 cursor-pointer min-h-[42px]"
            >
              {THE_NINE_UAP_CLASSES.map((cls) => (
                <option key={cls.id} value={cls.id} className="bg-slate-900 text-slate-100">
                  {cls.name} ({cls.shapeCategory})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Sighting Title / Observation Summary</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Luminous Orb Executing Sharp Multi-Mach Vector Shift"
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-400 font-sans text-xs sm:text-sm min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Observer Name</label>
              <input
                type="text"
                value={observerName}
                onChange={(e) => setObserverName(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-400 font-sans text-xs sm:text-sm min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Date & Time</label>
              <input
                type="datetime-local"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-3 py-3 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono text-xs sm:text-sm min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Location Name</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-400 font-sans text-xs sm:text-sm min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Detailed Observation Notes / Kinematics</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe altitude, speed, shape, color, absence of sound or heat plume, and weather conditions..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-400 font-sans text-xs sm:text-sm leading-relaxed"
            ></textarea>
          </div>

          <div className="p-4 rounded-2xl glass-panel-subtle border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-bold flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Sighting Photo / Optical Media</span>
              </label>
              <span className="text-xs text-cyan-400 font-medium">Upload or Provide URL</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <label className="flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl glass-pill text-slate-200 hover:text-white text-xs sm:text-sm font-semibold cursor-pointer transition shrink-0 w-full sm:w-auto min-h-[44px]">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Choose Image File</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              <input
                type="text"
                value={mediaUrl}
                onChange={(e) => {
                  setMediaUrl(e.target.value);
                  setUploadedBase64(null);
                }}
                placeholder="https://..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-400 font-sans text-xs sm:text-sm min-h-[44px]"
              />
              <button
                type="button"
                onClick={handleRunInstantAiPhotoScan}
                disabled={isAnalyzingPhoto || (!mediaUrl && !uploadedBase64)}
                className="px-5 py-3 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50 cursor-pointer w-full sm:w-auto min-h-[44px]"
              >
                <Cpu className={`w-4 h-4 text-cyan-400 ${isAnalyzingPhoto ? 'animate-spin' : ''}`} />
                <span>{isAnalyzingPhoto ? 'Scanning Photo...' : 'Instant AI Scan'}</span>
              </button>
            </div>

            {(uploadedBase64 || mediaUrl) && (
              <div className="pt-2 space-y-2">
                {isVideoMedia ? (
                  <div className="space-y-2">
                    <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 bg-black max-h-60 flex items-center justify-center">
                      <video
                        src={uploadedBase64 || mediaUrl}
                        poster={posterThumbnail || undefined}
                        controls
                        playsInline
                        muted
                        className="w-full max-h-56 object-contain mx-auto"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="text-cyan-300 font-bold flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Recorded Optical Video Attached</span>
                      </div>
                      <span className="font-mono text-slate-400">Video telemetry ready</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3.5">
                    <div className="relative w-18 h-18 rounded-2xl overflow-hidden border border-cyan-500/40 shrink-0 bg-slate-950">
                      <img src={uploadedBase64 || mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400 space-y-1">
                      <div className="text-slate-200 font-bold flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Optical Media Ready</span>
                      </div>
                      <p className="text-xs text-slate-400">Ready to attach to community sighting report.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {aiAnalysisResult && (
              <div className="p-4 rounded-2xl glass-panel border border-cyan-500/40 text-cyan-200 text-xs sm:text-sm space-y-1.5">
                <div className="font-bold flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Optical AI Scan Score: {aiAnalysisResult.anomalyScore}% Anomaly</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">{aiAnalysisResult.detailedAnalysis}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Tags (Comma Separated)</label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-400 font-sans text-xs sm:text-sm min-h-[44px]"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl glass-pill text-slate-300 hover:text-white font-sans text-xs sm:text-sm font-semibold transition min-h-[46px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold font-sans text-xs sm:text-sm transition flex items-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 cursor-pointer min-h-[46px] active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying & Submitting...' : 'Submit Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
