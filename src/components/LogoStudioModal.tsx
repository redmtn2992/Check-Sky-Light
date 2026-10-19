import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Zap,
  Palette,
  Crosshair,
  Radio,
  Eye,
  Sliders
} from 'lucide-react';
import { AppArchetypeTheme } from '../types';
import { ARCHETYPE_THEMES, ArchetypeThemeMetadata } from '../data/logoPresets';
import {
  loadActiveArchetype,
  saveActiveArchetype,
  applyArchetypeToDocument,
  getArchetypeIcon,
  getThemeLogoFilter
} from '../lib/themeManager';

interface LogoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeArchetype?: AppArchetypeTheme;
  onSelectArchetype?: (themeId: AppArchetypeTheme) => void;
}

export const LogoStudioModal: React.FC<LogoStudioModalProps> = ({
  isOpen,
  onClose,
  activeArchetype: propActiveArchetype,
  onSelectArchetype,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<AppArchetypeTheme>(() =>
    propActiveArchetype || loadActiveArchetype()
  );
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  useEffect(() => {
    if (propActiveArchetype) {
      setSelectedTheme(propActiveArchetype);
    } else {
      setSelectedTheme(loadActiveArchetype());
    }
  }, [propActiveArchetype, isOpen]);

  if (!isOpen) return null;

  const activeThemeMeta =
    ARCHETYPE_THEMES.find((t) => t.id === selectedTheme) || ARCHETYPE_THEMES[0];

  const handleSelectTheme = (themeId: AppArchetypeTheme) => {
    setSelectedTheme(themeId);
    saveActiveArchetype(themeId);
    applyArchetypeToDocument(themeId);

    if (onSelectArchetype) {
      onSelectArchetype(themeId);
    }

    const meta = ARCHETYPE_THEMES.find((t) => t.id === themeId);
    setAppliedToast(`Theme activated: ${meta?.name || themeId}`);
    setTimeout(() => {
      setAppliedToast(null);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in font-sans">
      <div
        className="border rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto transition-colors duration-300"
        style={{
          backgroundColor: activeThemeMeta.baseBgHex || '#08090C',
          borderColor: activeThemeMeta.accentHex,
          boxShadow: `0 0 35px ${activeThemeMeta.accentHex}33`
        }}
      >
        {/* Sleek Minimalist Header: "Less Ink with less words" */}
        <div
          className="p-4 sm:p-5 border-b flex items-center justify-between shrink-0 transition-colors duration-300"
          style={{
            borderColor: `${activeThemeMeta.accentHex}40`,
            backgroundColor: 'rgba(0,0,0,0.45)'
          }}
        >
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-2xl overflow-hidden border-2 flex items-center justify-center shrink-0 shadow-md transition-all"
              style={{
                borderColor: activeThemeMeta.accentHex,
                backgroundColor: '#0a0d14'
              }}
            >
              <img
                src={getArchetypeIcon(selectedTheme)}
                alt="Theme Icon"
                className={`w-full h-full object-cover transition-all ${getThemeLogoFilter(selectedTheme)}`}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-100 uppercase tracking-tight">
                  Themes
                </h2>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border"
                  style={{
                    backgroundColor: `${activeThemeMeta.accentHex}20`,
                    color: activeThemeMeta.accentHex,
                    borderColor: `${activeThemeMeta.accentHex}60`
                  }}
                >
                  {activeThemeMeta.shortName}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Cockpit visual styles & instrument panel
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer flex items-center space-x-1 border"
              style={{
                backgroundColor: `${activeThemeMeta.accentHex}20`,
                borderColor: `${activeThemeMeta.accentHex}60`,
                color: activeThemeMeta.accentHex
              }}
            >
              <Check className="w-3.5 h-3.5" />
              <span>DONE</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/10 transition cursor-pointer"
              title="Close Themes"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Applied Toast Feedback */}
        {appliedToast && (
          <div
            className="px-4 py-2 text-center text-xs font-mono font-bold flex items-center justify-center space-x-2 border-b animate-fade-in"
            style={{
              backgroundColor: `${activeThemeMeta.accentHex}25`,
              color: activeThemeMeta.accentHex,
              borderColor: `${activeThemeMeta.accentHex}40`
            }}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{appliedToast}</span>
          </div>
        )}

        {/* 4 Cockpit Archetype Themes Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ARCHETYPE_THEMES.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              const iconImg = getArchetypeIcon(theme.id);

              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`rounded-2xl border-2 overflow-hidden flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'shadow-lg scale-[1.01]'
                      : 'border-slate-800/80 hover:border-slate-700 bg-slate-900/60 opacity-85 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isSelected ? theme.baseBgHex : '#0b0f17',
                    borderColor: isSelected ? theme.accentHex : undefined,
                    boxShadow: isSelected ? `0 0 20px ${theme.accentHex}30` : undefined
                  }}
                >
                  {/* Top Bar of Card */}
                  <div className="p-3.5 bg-black/40 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-7 h-7 rounded-lg overflow-hidden border shrink-0 bg-slate-950"
                        style={{ borderColor: theme.accentHex }}
                      >
                        <img
                          src={iconImg}
                          alt={theme.name}
                          className={`w-full h-full object-cover transition-all ${getThemeLogoFilter(theme.id)}`}
                        />
                      </div>
                      <span className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200">
                        {theme.shortName}
                      </span>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border"
                      style={{
                        backgroundColor: `${theme.accentHex}18`,
                        color: theme.accentHex,
                        borderColor: `${theme.accentHex}40`
                      }}
                    >
                      {theme.id === 'black_project'
                        ? 'SAP AVIONICS'
                        : theme.id === 'retro_obd'
                        ? '1984 VFD CLUSTER'
                        : theme.id === 'nvg_flir'
                        ? '530nm PHOSPHOR'
                        : 'RHODOPSIN RED'}
                    </span>
                  </div>

                  {/* Body with Info & Telemetry Miniature */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-100 flex items-center justify-between">
                        <span>{theme.name}</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5 leading-snug">
                        {theme.tagline}
                      </p>
                    </div>

                    {/* Cockpit HUD Miniature Preview */}
                    <div
                      className="p-2.5 rounded-xl border flex flex-col space-y-1.5 font-mono text-[10px]"
                      style={{
                        backgroundColor: theme.baseBgHex,
                        borderColor: isSelected ? `${theme.accentHex}80` : '#232c3d'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span style={{ color: theme.accentHex }} className="font-bold">
                          {theme.id === 'black_project' && '[ + ] AZ 180.0° · EL 35.0°'}
                          {theme.id === 'retro_obd' && ':: 180° AZ · 35° EL [VFD] ::'}
                          {theme.id === 'nvg_flir' && '( · ) 530nm AZ 180° · EL 35°'}
                          {theme.id === 'observatory' && '⊕ 180°00\' AZ · +35°00\' EL'}
                        </span>
                        <span
                          className="px-1.5 py-0.2 rounded border text-[9px]"
                          style={{
                            color: theme.accentSecondaryHex,
                            borderColor: `${theme.accentSecondaryHex}40`,
                            backgroundColor: `${theme.accentSecondaryHex}10`
                          }}
                        >
                          {theme.reticleStyle.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9px]">
                        <span className="text-slate-400">Diagnostic Tribunal:</span>
                        <span style={{ color: theme.accentHex }} className="font-bold">
                          DTC P0312
                        </span>
                      </div>
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                      <span>Palette:</span>
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: theme.accentHex }}
                          title={`Primary: ${theme.accentHex}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: theme.accentSecondaryHex }}
                          title={`Secondary: ${theme.accentSecondaryHex}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: theme.baseBgHex }}
                          title={`Chassis: ${theme.baseBgHex}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Button */}
                  <div className="p-3 bg-black/30 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      {isSelected ? 'Active Cockpit' : 'Tap to activate'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTheme(theme.id);
                      }}
                      className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                      style={
                        isSelected
                          ? {
                              backgroundColor: theme.accentHex,
                              color: theme.id === 'black_project' ? '#08090C' : '#000000',
                              boxShadow: `0 0 12px ${theme.accentHex}50`
                            }
                          : {
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              color: '#cbd5e1'
                            }
                      }
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>ACTIVE THEME</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" style={{ color: theme.accentHex }} />
                          <span>ACTIVATE</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
