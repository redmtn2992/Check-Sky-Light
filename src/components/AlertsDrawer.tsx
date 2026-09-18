import React, { useState } from 'react';
import { Bell, ShieldAlert, X, Volume2, Radio, MapPin, CheckCircle2, BatteryCharging } from 'lucide-react';
import { AlertNotification, LocationCoords } from '../types';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertNotification[];
  userLocation?: LocationCoords;
  pushEnabled?: boolean;
  radiusMiles?: number;
  onTogglePush?: (enabled: boolean, radius: number) => void;
  onMarkAllRead?: () => void;
  onMarkAllAsRead?: () => void;
  onOpenLocationPicker?: () => void;
  batterySaver?: boolean;
  onToggleBatterySaver?: (enabled: boolean) => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  userLocation = { lat: 35.0844, lng: -106.6504, city: 'Albuquerque', region: 'New Mexico, USA' },
  pushEnabled = true,
  radiusMiles = 50,
  onTogglePush = () => {},
  onMarkAllRead,
  onMarkAllAsRead,
  onOpenLocationPicker,
  batterySaver = false,
  onToggleBatterySaver
}) => {
  const handleMarkAll = () => {
    if (onMarkAllRead) onMarkAllRead();
    if (onMarkAllAsRead) onMarkAllAsRead();
  };
  const [localRadius, setLocalRadius] = useState(radiusMiles);
  const [testSuccessMsg, setTestSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          new Notification('AETHER-SCAN UAP Radar Alert', {
            body: 'HIGH ANOMALY DETECTED: 94% Probability UAP reported within 14 miles of your sector.',
            icon: '/icon.png'
          });
        }
      });
    }
    setTestSuccessMsg('Test notification broadcast to browser push manager!');
    setTimeout(() => setTestSuccessMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end animate-fade-in">
      <div className="bg-slate-900 border-l border-cyan-800/60 w-full max-w-md h-full flex flex-col justify-between p-4 sm:p-6 shadow-2xl relative overflow-y-auto">
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-100 text-base">Proximity Anomaly Alerts</h3>
                <p className="text-xs text-slate-400">Push alerts for unverified aerial anomalies</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close Alerts"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-800/80 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[11px] text-teal-400 block uppercase font-bold tracking-wider">RADAR BASE NODE:</span>
                  <span className="text-teal-200 font-extrabold text-sm truncate">{userLocation.city || 'San Diego'}, {userLocation.region || 'CA'}</span>
                </div>
              </div>
              {onOpenLocationPicker && (
                <button
                  onClick={onOpenLocationPicker}
                  className="px-3 py-1.5 rounded-xl bg-teal-900 hover:bg-teal-800 border border-teal-700 text-xs font-mono text-teal-200 font-bold transition shrink-0 cursor-pointer min-h-[36px]"
                >
                  Change GPS
                </button>
              )}
            </div>

            <div className={`p-3.5 rounded-xl border space-y-2 font-mono transition-colors ${
              batterySaver
                ? 'bg-amber-950/60 border-amber-700 text-amber-200'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <BatteryCharging className={`w-5 h-5 ${batterySaver ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-sm font-extrabold block">Battery Saver Mode</span>
                    <span className="text-xs text-slate-300 font-sans block">
                      {batterySaver
                        ? '15 FPS AR Camera & 60s Sky Refresh'
                        : '60 FPS AR Camera & 15s Sky Refresh'}
                    </span>
                  </div>
                </div>
                {onToggleBatterySaver && (
                  <button
                    onClick={() => onToggleBatterySaver(!batterySaver)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                      batterySaver ? 'bg-amber-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-slate-950 transition-transform ${
                        batterySaver ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                )}
              </div>
              <div className="text-xs font-sans leading-relaxed text-slate-300 pt-2 border-t border-slate-800/80">
                {batterySaver
                  ? 'Energy Saver Active: Preserves battery by running optical AR sensors at 15 FPS and 60s background GPS updates.'
                  : 'High Precision Active: Full 60 FPS camera tracking and real-time 15s ADS-B flight & satellite polling.'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono text-slate-200 font-extrabold flex items-center">
                <Radio className="w-4 h-4 mr-2 text-cyan-400" />
                Push Notification Alerts
              </span>
              <button
                onClick={() => onTogglePush(!pushEnabled, localRadius)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                  pushEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-slate-950 transition-transform ${
                    pushEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>Detection Radius</span>
                <span className="text-cyan-300 font-bold text-sm">{localRadius} miles</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={localRadius}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLocalRadius(val);
                  onTogglePush(pushEnabled, val);
                }}
                className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleTestNotification}
                className="py-2.5 px-3 rounded-xl bg-slate-900 border border-cyan-800/80 hover:bg-cyan-950 text-cyan-300 font-sans text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
              >
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Test Push Sound</span>
              </button>
              <button
                onClick={() => {
                  if ('Notification' in window) {
                    Notification.requestPermission().then((perm) => {
                      if (perm === 'granted') {
                        new Notification(`AETHER-SCAN Sector Alarm: ${userLocation.city || 'Albuquerque'}`, {
                          body: `CRITICAL UAP ANOMALY (94% Score) reported ${Math.floor(Math.random() * 12 + 3)} miles from your sector!`,
                          icon: '/icon.png'
                        });
                      }
                    });
                  }
                  setTestSuccessMsg(`SECTOR ALARM FIRED: Emergency push sent for ${userLocation.city || 'Albuquerque'} sector!`);
                  setTimeout(() => setTestSuccessMsg(null), 4000);
                }}
                className="py-2.5 px-3 rounded-xl bg-rose-950/80 border border-rose-800 hover:bg-rose-900 text-rose-200 font-sans text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Simulate Alarm</span>
              </button>
            </div>

            {testSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs font-mono flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{testSuccessMsg}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="font-bold">ALERT LOG HISTORY ({alerts.length})</span>
              <button onClick={handleMarkAll} className="text-cyan-400 hover:underline cursor-pointer">
                Mark all read
              </button>
            </div>
            <div className="space-y-2.5">
              {alerts.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-mono text-slate-300 font-bold">No Anomaly Alerts in Selected Radius</p>
                  <p className="text-xs text-slate-400">No UAP anomalies detected within {localRadius} miles of {userLocation.city || 'your position'}. Try expanding the radius slider above.</p>
                </div>
              ) : (
                alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                      alt.severity === 'critical'
                        ? 'bg-rose-950/40 border-rose-800/80'
                        : alt.severity === 'warning'
                        ? 'bg-amber-950/30 border-amber-800/60'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-extrabold text-slate-100">
                      <span className="flex items-center text-rose-300 text-sm">
                        <ShieldAlert className="w-4 h-4 mr-1.5 text-rose-400" />
                        {alt.title}
                      </span>
                      <span className="font-mono text-xs text-slate-400">{alt.timestamp}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed text-xs">{alt.message}</p>
                    <div className="flex items-center justify-between font-mono text-xs text-slate-400 pt-1.5 border-t border-slate-800/60">
                      <span>📍 {alt.locationName}</span>
                      <span className="text-cyan-400 font-bold">{alt.distanceMiles} mi from node</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-100 text-xs font-bold transition min-h-[44px] cursor-pointer"
          >
            Close Alerts Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
