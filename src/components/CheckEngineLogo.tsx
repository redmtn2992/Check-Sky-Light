import React from 'react';
import { LogoVariantId, LogoColorTheme } from '../types';
import { COLOR_THEMES } from '../data/logoPresets';

interface CheckEngineLogoProps {
  variantId?: LogoVariantId;
  colorTheme?: LogoColorTheme;
  animationMode?: 'solid' | 'pulse' | 'strobe' | 'beam_scan';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  showCowLift?: boolean;
  showFaultCodeBadge?: boolean;
  glowIntensity?: 'subtle' | 'high' | 'off';
  customFaultCode?: string;
  className?: string;
  onClick?: () => void;
  interactiveHover?: boolean;
  animated?: boolean;
  glow?: boolean;
}

export const CheckEngineLogo: React.FC<CheckEngineLogoProps> = ({
  variantId = 'piston_saucer',
  colorTheme = 'amber',
  animationMode: explicitAnimationMode,
  size = 'md',
  showCowLift = true,
  showFaultCodeBadge = false,
  glowIntensity: explicitGlow,
  customFaultCode = 'P1947',
  className = '',
  onClick,
  interactiveHover = false,
  animated,
  glow
}) => {
  const animationMode = explicitAnimationMode || (animated ? 'pulse' : 'solid');
  const glowIntensity = explicitGlow || (glow === false ? 'off' : 'high');
  const theme = COLOR_THEMES.find((t) => t.id === colorTheme) || COLOR_THEMES[0];
  const primaryColor = theme.hex;
  const accentColor = theme.accentHex;

  const sizeConfig = {
    xs: { px: 24, badgeText: 'text-[7px]', viewBox: '0 0 100 100' },
    sm: { px: 32, badgeText: 'text-[8px]', viewBox: '0 0 100 100' },
    md: { px: 44, badgeText: 'text-[9px]', viewBox: '0 0 100 100' },
    lg: { px: 64, badgeText: 'text-[10px]', viewBox: '0 0 100 100' },
    xl: { px: 96, badgeText: 'text-xs', viewBox: '0 0 100 100' },
    '2xl': { px: 140, badgeText: 'text-sm', viewBox: '0 0 100 100' },
    hero: { px: 220, badgeText: 'text-base', viewBox: '0 0 100 100' },
  };

  const { px, viewBox } = sizeConfig[size] || sizeConfig.md;

  const getAnimationClass = () => {
    switch (animationMode) {
      case 'pulse':
        return 'animate-pulse';
      case 'strobe':
        return 'animate-ping duration-1000';
      case 'beam_scan':
        return 'animate-bounce duration-1000';
      case 'solid':
      default:
        return '';
    }
  };

  const getGlowFilter = () => {
    if (glowIntensity === 'off') return 'none';
    if (glowIntensity === 'subtle') return `drop-shadow(0 0 4px ${primaryColor}66)`;
    return `drop-shadow(0 0 8px ${primaryColor}99) drop-shadow(0 0 18px ${primaryColor}44)`;
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center select-none ${
        interactiveHover ? 'group cursor-pointer transition-transform hover:scale-105 active:scale-95' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: px, height: px }}
    >
      <svg
        viewBox={viewBox}
        width={px}
        height={px}
        className="overflow-visible"
        style={{ filter: getGlowFilter() }}
      >
        <defs>
          <linearGradient id={`beamGrad-${colorTheme}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.85" />
            <stop offset="60%" stopColor={primaryColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id={`engineGrad-${colorTheme}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor={primaryColor} />
          </linearGradient>
          <filter id={`neonGlow-${colorTheme}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {variantId === 'piston_saucer' && (
          <g className={getAnimationClass()}>
            {showCowLift && (
              <g className="opacity-90">
                <polygon
                  points="38,62 62,62 82,96 18,96"
                  fill={`url(#beamGrad-${colorTheme})`}
                  className="animate-pulse"
                />
                <g transform="translate(43, 76) scale(0.65)">
                  <ellipse cx="10" cy="8" rx="7" ry="5" fill="#FFFFFF" />
                  <circle cx="8" cy="7" r="2" fill="#0F172A" />
                  <circle cx="12" cy="9" r="1.5" fill="#0F172A" />
                  <circle cx="17" cy="6" r="3.5" fill="#FFFFFF" />
                  <ellipse cx="19" cy="7" rx="1.5" ry="1" fill="#FDA4AF" />
                  <circle cx="15.5" cy="3.5" r="1" fill="#FFFFFF" />
                  <circle cx="18" cy="3.5" r="1" fill="#FFFFFF" />
                  <rect x="5" y="12" width="1.5" height="5" fill="#FFFFFF" />
                  <rect x="8.5" y="12" width="1.5" height="5" fill="#FFFFFF" />
                  <rect x="12" y="12" width="1.5" height="5" fill="#FFFFFF" />
                  <rect x="14.5" y="12" width="1.5" height="5" fill="#FFFFFF" />
                  <circle cx="7" cy="12" r="1" fill="#FDA4AF" />
                </g>
              </g>
            )}
            <path
              d="M 12,38 L 22,38 L 22,46 L 12,46 Z"
              fill={primaryColor}
              stroke={accentColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M 12,38 C 7,38 7,46 12,46"
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
            />
            <path
              d="M 22,32 L 32,32 L 32,24 L 38,24 L 38,18 L 62,18 L 62,24 L 68,24 L 68,32 L 80,32 L 80,42 L 86,42 L 86,52 L 80,52 L 80,62 L 64,62 L 64,66 L 36,66 L 36,62 L 22,62 Z"
              fill={primaryColor}
              fillOpacity="0.9"
              stroke={accentColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <ellipse
              cx="50"
              cy="18"
              rx="18"
              ry="7"
              fill="#0F172A"
              stroke={accentColor}
              strokeWidth="2.5"
            />
            <ellipse
              cx="50"
              cy="14"
              rx="10"
              ry="5.5"
              fill={accentColor}
              fillOpacity="0.4"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <ellipse cx="50" cy="13.5" rx="3.5" ry="3" fill="#0F172A" />
            <circle cx="48.5" cy="13" r="0.8" fill={primaryColor} />
            <circle cx="51.5" cy="13" r="0.8" fill={primaryColor} />
            <circle cx="38" cy="19" r="1.5" fill="#FFFFFF" />
            <circle cx="44" cy="20.5" r="1.5" fill="#FFFFFF" />
            <circle cx="50" cy="21" r="1.5" fill="#FFFFFF" />
            <circle cx="56" cy="20.5" r="1.5" fill="#FFFFFF" />
            <circle cx="62" cy="19" r="1.5" fill="#FFFFFF" />
            <g transform="translate(42, 36) scale(0.9)">
              <polygon
                points="8,0 2,12 8,12 6,22 16,9 10,9 14,0"
                fill="#0F172A"
                stroke="#FFFFFF"
                strokeWidth="1.2"
              />
            </g>
            <line x1="50" y1="8.5" x2="50" y2="4" stroke={accentColor} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="50" cy="3" r="1.5" fill="#FFFFFF" />
            <path
              d="M 80,36 L 88,36 M 80,48 L 88,48"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}

        {variantId === 'bovine_abduction' && (
          <g className={getAnimationClass()}>
            <polygon
              points="36,54 64,54 88,96 12,96"
              fill={`url(#beamGrad-${colorTheme})`}
            />
            <ellipse cx="50" cy="64" rx="14" ry="4" fill="none" stroke={accentColor} strokeWidth="1.2" strokeDasharray="3 2" />
            <ellipse cx="50" cy="76" rx="22" ry="5.5" fill="none" stroke={accentColor} strokeWidth="1.2" strokeDasharray="4 2" />
            <ellipse cx="50" cy="88" rx="30" ry="7" fill="none" stroke={accentColor} strokeWidth="1.2" strokeDasharray="5 3" />
            <g transform="translate(38, 68) scale(0.85)">
              <ellipse cx="14" cy="18" rx="15" ry="3" fill={primaryColor} fillOpacity="0.3" />
              <rect x="4" y="4" width="16" height="10" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
              <path d="M 6,5 C 8,7 9,5 11,8 C 10,11 6,10 6,5 Z" fill="#0F172A" />
              <circle cx="16" cy="10" r="2.5" fill="#0F172A" />
              <circle cx="21" cy="6" r="4.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
              <ellipse cx="23.5" cy="7.5" rx="2" ry="1.5" fill="#FDA4AF" />
              <circle cx="22" cy="4.5" r="0.8" fill="#0F172A" />
              <ellipse cx="19" cy="3" rx="1.5" ry="2.5" fill="#FFFFFF" transform="rotate(-20 19 3)" />
              <line x1="6" y1="14" x2="4" y2="20" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="10" y1="14" x2="9" y2="20" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="14" y1="14" x2="15" y2="20" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="18" y1="14" x2="20" y2="20" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 4,6 C 1,7 2,12 0,14" fill="none" stroke="#0F172A" strokeWidth="1.2" />
            </g>
            <path
              d="M 16,34 L 26,34 L 26,24 L 34,24 L 34,16 L 66,16 L 66,24 L 74,24 L 74,34 L 84,34 L 84,46 L 76,46 L 76,54 L 64,54 L 64,50 L 36,50 L 36,54 L 24,54 L 24,46 L 16,46 Z"
              fill={primaryColor}
              stroke={accentColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <ellipse cx="50" cy="16" rx="20" ry="6" fill="#0F172A" stroke={accentColor} strokeWidth="2" />
            <circle cx="50" cy="11" r="5" fill={accentColor} fillOpacity="0.6" stroke="#FFFFFF" strokeWidth="1.2" />
            <rect x="28" y="32" width="44" height="12" rx="2" fill="#0F172A" stroke={accentColor} strokeWidth="1" />
            <text
              x="50"
              y="41"
              textAnchor="middle"
              fill={primaryColor}
              fontSize="6.5"
              fontWeight="900"
              fontFamily="monospace"
              letterSpacing="0.5"
            >
              COW EXTRACT
            </text>
          </g>
        )}

        {variantId === 'spark_incursion' && (
          <g className={getAnimationClass()}>
            <g>
              <line x1="38" y1="20" x2="32" y2="8" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="31" cy="6" r="2.5" fill="#FFFFFF" stroke={primaryColor} strokeWidth="1.5" />
              <path d="M 31,6 L 25,12 L 28,15 L 22,22" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
              <line x1="62" y1="20" x2="68" y2="8" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="69" cy="6" r="2.5" fill="#FFFFFF" stroke={primaryColor} strokeWidth="1.5" />
              <path d="M 69,6 L 75,12 L 72,15 L 78,22" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
            </g>
            <path
              d="M 18,36 L 28,36 L 28,26 L 36,26 L 36,20 L 64,20 L 64,26 L 72,26 L 72,36 L 82,36 L 82,48 L 76,48 L 76,68 L 62,68 L 62,74 L 38,74 L 38,68 L 24,68 L 24,48 L 18,48 Z"
              fill={primaryColor}
              stroke={accentColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <g transform="translate(50, 48)">
              <path
                d="M 0,-14 C 9,-14 13,-9 11,2 C 9,10 4,14 0,15 C -4,14 -9,10 -11,2 C -13,-9 -9,-14 0,-14 Z"
                fill="#0F172A"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              <ellipse
                cx="-5"
                cy="-2"
                rx="3.5"
                ry="5.5"
                fill={primaryColor}
                transform="rotate(-25 -5 -2)"
              />
              <ellipse
                cx="5"
                cy="-2"
                rx="3.5"
                ry="5.5"
                fill={primaryColor}
                transform="rotate(25 5 -2)"
              />
              <circle cx="-4" cy="-4" r="1" fill="#FFFFFF" />
              <circle cx="4" cy="-4" r="1" fill="#FFFFFF" />
              <circle cx="-1.2" cy="7" r="0.5" fill="#FFFFFF" />
              <circle cx="1.2" cy="7" r="0.5" fill="#FFFFFF" />
            </g>
            <line x1="14" y1="42" x2="20" y2="42" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <line x1="15" y1="39" x2="19" y2="45" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {variantId === 'annunciator_dash' && (
          <g className={getAnimationClass()}>
            <rect
              x="8"
              y="14"
              width="84"
              height="72"
              rx="8"
              fill="#0F172A"
              stroke={accentColor}
              strokeWidth="3"
            />
            <path
              d="M 12,18 L 18,14 M 22,22 L 30,14 M 34,22 L 42,14 M 46,22 L 54,14 M 58,22 L 66,14 M 70,22 L 78,14 M 82,22 L 88,16"
              stroke={primaryColor}
              strokeWidth="2"
              strokeOpacity="0.4"
            />
            <rect
              x="14"
              y="22"
              width="72"
              height="28"
              rx="4"
              fill={primaryColor}
              fillOpacity="0.2"
              stroke={primaryColor}
              strokeWidth="1.5"
            />
            <text
              x="50"
              y="35"
              textAnchor="middle"
              fill={accentColor}
              fontSize="9"
              fontWeight="900"
              fontFamily="sans-serif"
              letterSpacing="1"
            >
              MASTER CAUTION
            </text>
            <text
              x="50"
              y="46"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="8"
              fontWeight="800"
              fontFamily="monospace"
              letterSpacing="1.5"
            >
              CHECK SKY
            </text>
            <rect
              x="14"
              y="54"
              width="34"
              height="26"
              rx="3"
              fill="#EF4444"
              fillOpacity="0.25"
              stroke="#EF4444"
              strokeWidth="1.5"
            />
            <text
              x="31"
              y="66"
              textAnchor="middle"
              fill="#F87171"
              fontSize="7"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              ANOMALY
            </text>
            <text
              x="31"
              y="75"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="6.5"
              fontWeight="bold"
              fontFamily="monospace"
            >
              ACTIVE
            </text>
            <rect
              x="52"
              y="54"
              width="34"
              height="26"
              rx="3"
              fill="#10B981"
              fillOpacity="0.25"
              stroke="#10B981"
              strokeWidth="1.5"
            />
            <text
              x="69"
              y="66"
              textAnchor="middle"
              fill="#34D399"
              fontSize="7"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              RADAR
            </text>
            <text
              x="69"
              y="75"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="6.5"
              fontWeight="bold"
              fontFamily="monospace"
            >
              LOCK 500G
            </text>
          </g>
        )}

        {variantId === 'retro_obd2_pixel' && (
          <g className={getAnimationClass()}>
            <rect x="10" y="10" width="80" height="80" rx="6" fill="#030712" stroke={accentColor} strokeWidth="2" />
            <line x1="10" y1="26" x2="90" y2="26" stroke={primaryColor} strokeWidth="0.5" strokeOpacity="0.3" />
            <line x1="10" y1="42" x2="90" y2="42" stroke={primaryColor} strokeWidth="0.5" strokeOpacity="0.3" />
            <line x1="10" y1="58" x2="90" y2="58" stroke={primaryColor} strokeWidth="0.5" strokeOpacity="0.3" />
            <line x1="10" y1="74" x2="90" y2="74" stroke={primaryColor} strokeWidth="0.5" strokeOpacity="0.3" />
            <path
              d="M 18,40 H 26 V 32 H 34 V 24 H 42 V 16 H 58 V 24 H 66 V 32 H 74 V 40 H 82 V 56 H 74 V 68 H 62 V 76 H 38 V 68 H 26 V 56 H 18 Z"
              fill="none"
              stroke={primaryColor}
              strokeWidth="3"
              strokeLinejoin="miter"
            />
            <rect x="42" y="34" width="16" height="6" fill={accentColor} />
            <rect x="36" y="40" width="28" height="6" fill={primaryColor} />
            <rect x="46" y="46" width="8" height="8" fill="#FFFFFF" />
            <text
              x="50"
              y="68"
              textAnchor="middle"
              fill={accentColor}
              fontSize="7"
              fontWeight="900"
              fontFamily="monospace"
            >
              DTC: {customFaultCode || 'P0404'}
            </text>
            <text
              x="50"
              y="85"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="5.5"
              fontWeight="bold"
              fontFamily="monospace"
              letterSpacing="0.5"
            >
              [UAP_RADAR_OK]
            </text>
          </g>
        )}

        {variantId === 'minimal_saucer_core' && (
          <g className={getAnimationClass()}>
            <circle cx="50" cy="50" r="42" fill="none" stroke={primaryColor} strokeWidth="1.5" strokeDasharray="8 4" />
            <circle cx="50" cy="50" r="32" fill="none" stroke={accentColor} strokeWidth="1" opacity="0.6" />
            <path
              d="M 22,46 C 22,32 78,32 78,46 C 78,54 22,54 22,46 Z"
              fill="#0F172A"
              stroke={primaryColor}
              strokeWidth="2.5"
            />
            <path
              d="M 36,44 C 36,28 64,28 64,44"
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
            />
            <path
              d="M 32,52 L 32,70 L 44,70 L 44,78 L 56,78 L 56,70 L 68,70 L 68,52"
              fill="none"
              stroke={primaryColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="40" r="4" fill={accentColor} />
            <line x1="50" y1="20" x2="50" y2="26" stroke={accentColor} strokeWidth="2" />
            <line x1="50" y1="54" x2="50" y2="60" stroke={accentColor} strokeWidth="2" />
            <line x1="16" y1="46" x2="22" y2="46" stroke={accentColor} strokeWidth="2" />
            <line x1="78" y1="46" x2="84" y2="46" stroke={accentColor} strokeWidth="2" />
          </g>
        )}

        {variantId === 'ai_concept_render' && (
          <g>
            <circle cx="50" cy="50" r="46" fill="#090D16" stroke={accentColor} strokeWidth="2.5" />
            <circle cx="50" cy="50" r="42" fill="#0F172A" />
            <ellipse cx="50" cy="45" rx="24" ry="10" fill={primaryColor} fillOpacity="0.8" />
            <polygon points="38,55 62,55 78,85 22,85" fill={`url(#beamGrad-${colorTheme})`} />
            <circle cx="50" cy="44" r="14" fill="#0F172A" stroke={accentColor} strokeWidth="1.5" />
            <circle cx="50" cy="44" r="6" fill={accentColor} />
            <circle cx="50" cy="50" r="44" fill="none" stroke={primaryColor} strokeWidth="1.5" strokeDasharray="12 6" />
          </g>
        )}
      </svg>

      {showFaultCodeBadge && (
        <div
          className={`absolute -bottom-2 font-mono font-black uppercase px-1.5 py-0.5 rounded-md border shadow-md whitespace-nowrap leading-none ${sizeConfig[size].badgeText} ${theme.bgClass} ${theme.borderClass} ${theme.textClass} bg-slate-950/95`}
        >
          {customFaultCode || 'P1947'}
        </div>
      )}
    </div>
  );
};
