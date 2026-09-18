import React, { useState } from 'react';
import { Navigation, MapPin, Search, Check, Globe, Crosshair, X, Loader2 } from 'lucide-react';
import { LocationCoords } from '../types';
import { POPULAR_LOCATIONS } from '../lib/geo';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation?: LocationCoords;
  currentLocation?: LocationCoords;
  onSelectLocation: (location: LocationCoords) => void;
  onUseDeviceGPS?: () => void;
  isGpsLocating?: boolean;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  currentLocation,
  onSelectLocation,
  onUseDeviceGPS,
  isGpsLocating: externalGpsLocating = false
}) => {
  const activeLocation = currentLocation || userLocation || {
    lat: 35.0844,
    lng: -106.6504,
    city: 'Albuquerque',
    region: 'New Mexico, USA'
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [customLat, setCustomLat] = useState(activeLocation.lat.toString());
  const [customLng, setCustomLng] = useState(activeLocation.lng.toString());
  const [searchError, setSearchError] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDeviceGPS = () => {
    setIsLocating(true);
    setGpsStatus('Requesting device GPS fix...');
    setSearchError(null);

    if (onUseDeviceGPS) {
      onUseDeviceGPS();
    }

    if (!navigator.geolocation) {
      setIsLocating(false);
      setGpsStatus(null);
      setSearchError('Geolocation sensor is not supported by your browser.');
      return;
    }

    const onCoordsSuccess = async (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setGpsStatus('Coordinates acquired. Resolving sector...');

      let city = `Sector (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`;
      let region = 'Live Device GPS Fix';

      try {
        const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data.city) city = data.city;
          if (data.region) region = data.region;
        }
      } catch {
        // fallback
      }

      const newLoc: LocationCoords = { lat, lng, city, region };
      setGpsStatus(`Locked: ${city}`);
      setIsLocating(false);
      onSelectLocation(newLoc);
      setTimeout(() => {
        onClose();
      }, 500);
    };

    const onCoordsError = (err: GeolocationPositionError) => {
      console.warn('High-accuracy GPS attempt failed, trying low accuracy fallback:', err);
      navigator.geolocation.getCurrentPosition(
        onCoordsSuccess,
        (fallbackErr) => {
          setIsLocating(false);
          setGpsStatus(null);
          let msg = 'Unable to acquire device GPS position.';
          if (fallbackErr.code === 1) {
            msg = 'GPS permission denied. Please allow location in browser settings, or use IP Auto-Detect or Albuquerque below.';
          } else if (fallbackErr.code === 2) {
            msg = 'GPS fix unavailable. Try IP Auto-Detect or select Albuquerque or another sector below.';
          } else if (fallbackErr.code === 3) {
            msg = 'GPS request timed out. Try IP Auto-Detect or select a sector below.';
          }
          setSearchError(msg);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    };

    navigator.geolocation.getCurrentPosition(onCoordsSuccess, onCoordsError, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0
    });
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.lat && data.lng) {
          onSelectLocation({
            lat: data.lat,
            lng: data.lng,
            city: data.city || searchQuery,
            region: data.region || 'Sector Lock'
          });
          onClose();
          return;
        }
      }
      setSearchError('Location not found. Try searching for "Albuquerque", "Roswell", or another city.');
    } catch {
      setSearchError('Network error searching location. You can select a hotspot preset below.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleApplyCoordinates = async () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setSearchError('Please enter valid latitude (-90 to 90) and longitude (-180 to 180).');
      return;
    }

    let city = `Custom Grid (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
    let region = 'User Target Sector';

    try {
      const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.city) city = data.city;
        if (data.region) region = data.region;
      }
    } catch {
      // fallback
    }

    onSelectLocation({ lat, lng, city, region });
    onClose();
  };

  const busyLocating = isLocating || externalGpsLocating;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel border border-white/15 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative space-y-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base sm:text-lg">Select Radar Base Station</h3>
              <p className="text-xs sm:text-sm text-slate-400">Current Base: <span className="text-cyan-300 font-bold">{activeLocation.city}</span> ({activeLocation.lat.toFixed(4)}°, {activeLocation.lng.toFixed(4)}°)</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live GPS & IP Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={handleDeviceGPS}
            disabled={busyLocating}
            className="py-3 px-3.5 rounded-2xl glass-panel-subtle hover:bg-white/[0.08] border border-teal-500/40 hover:border-teal-400/80 text-teal-300 text-xs sm:text-sm font-semibold transition flex items-center space-x-3 shadow-lg cursor-pointer min-h-[52px]"
          >
            <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-300 shrink-0">
              {busyLocating ? (
                <Loader2 className="w-4 h-4 animate-spin text-teal-300" />
              ) : (
                <Crosshair className="w-4 h-4" />
              )}
            </div>
            <div className="text-left truncate">
              <div className="text-teal-200 text-xs sm:text-sm font-bold truncate">
                {busyLocating ? 'Locating Device...' : 'Live Device GPS'}
              </div>
              <div className="text-xs text-teal-400/80 truncate">
                {gpsStatus || 'Phone / browser sensor'}
              </div>
            </div>
          </button>

          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/ip-location');
                if (res.ok) {
                  const data = await res.json();
                  if (data.lat && data.lng) {
                    onSelectLocation({
                      lat: data.lat,
                      lng: data.lng,
                      city: data.city || 'Albuquerque',
                      region: data.region || 'New Mexico, USA'
                    });
                    onClose();
                  }
                }
              } catch {
                // ignore
              }
            }}
            className="py-3 px-3.5 rounded-2xl glass-panel-subtle hover:bg-white/[0.08] border border-cyan-500/40 hover:border-cyan-400/80 text-cyan-300 text-xs sm:text-sm font-semibold transition flex items-center space-x-3 shadow-lg cursor-pointer min-h-[52px]"
          >
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div className="text-left truncate">
              <div className="text-cyan-200 text-xs sm:text-sm font-bold truncate">IP Auto-Detect</div>
              <div className="text-xs text-cyan-400/80 truncate">Network IP location</div>
            </div>
          </button>
        </div>

        {gpsStatus && (
          <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-800 text-teal-300 text-xs flex items-center space-x-2">
            <Crosshair className="w-3.5 h-3.5 shrink-0 animate-pulse" />
            <span className="font-mono">{gpsStatus}</span>
          </div>
        )}

        {searchError && (
          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-medium">
            {searchError}
          </div>
        )}

        <form onSubmit={handleSearchSubmit} className="space-y-2">
          <label className="text-xs sm:text-sm text-slate-300 font-bold block">
            Search Global City or Region:
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Albuquerque, NM or Roswell, NM..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 min-h-[44px]"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs sm:text-sm transition shrink-0 cursor-pointer min-h-[44px]"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm text-slate-300 font-bold block">
              Featured UAP Hotspot Sectors:
            </label>
            <span className="text-[11px] text-cyan-400 font-mono">Default: Albuquerque, NM</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {POPULAR_LOCATIONS.map((loc) => {
              const isSelected = activeLocation.city === loc.city;
              return (
                <button
                  key={loc.city}
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                      : 'glass-panel-subtle border-white/10 text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="truncate pr-1">
                    <div className="font-bold truncate text-slate-100 text-xs sm:text-sm flex items-center space-x-1">
                      <span>{loc.city}</span>
                      {loc.city === 'Albuquerque' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/30 text-cyan-200 border border-cyan-400/40">Default</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{loc.region}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 space-y-2.5">
          <span className="text-xs sm:text-sm text-slate-300 block font-bold">
            Manual Lat / Lng Coordinates:
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="number"
              step="any"
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
              placeholder="Latitude (e.g. 35.0844)"
              className="bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 min-h-[40px]"
            />
            <input
              type="number"
              step="any"
              value={customLng}
              onChange={(e) => setCustomLng(e.target.value)}
              placeholder="Longitude (e.g. -106.6504)"
              className="bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 min-h-[40px]"
            />
          </div>
          <button
            onClick={handleApplyCoordinates}
            className="w-full py-2.5 rounded-xl glass-pill text-slate-200 hover:text-white text-xs sm:text-sm font-bold transition cursor-pointer min-h-[42px]"
          >
            Apply Exact Coordinates
          </button>
        </div>
      </div>
    </div>
  );
};
