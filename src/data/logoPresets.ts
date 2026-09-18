import { LogoConfig, LogoVariantId, LogoColorTheme, DtcFaultCode } from '../types';

export interface LogoVariantMetadata {
  id: LogoVariantId;
  name: string;
  tagline: string;
  humorLore: string;
  recommendedTheme: LogoColorTheme;
  recommendedAnimation: 'solid' | 'pulse' | 'strobe' | 'beam_scan';
  iconConcept: string;
  dtcCode: string;
  supportsCowLift: boolean;
}

export const LOGO_VARIANTS: LogoVariantMetadata[] = [
  {
    id: 'piston_saucer',
    name: 'The Saucer Manifold (Classic Dash)',
    tagline: 'The iconic amber Check Engine light, rebuilt for interstellar airspaces.',
    humorLore: 'When your car says "Check Engine", you need an oil change. When the sky says "Check Engine", the intake manifold is an alien mothership pulling 40,000 RPM in hyperspace.',
    recommendedTheme: 'amber',
    recommendedAnimation: 'pulse',
    iconConcept: 'Classic engine block silhouette with a glowing UFO cockpit dome on top, dual alien eyes in the intake, and a pulsating tractor beam from the oil pan.',
    dtcCode: 'P1947',
    supportsCowLift: true,
  },
  {
    id: 'bovine_abduction',
    name: 'Service Cow Soon (Bovine Abduction)',
    tagline: 'Warning: Active Livestock Extraction in Progress.',
    humorLore: 'Replacing the standard "Service Engine Soon" dash light with a cone-shaped amber tractor beam levitating a silhouette Holstein cow into orbit. Rated 5 stars by local dairy farmers.',
    recommendedTheme: 'amber',
    recommendedAnimation: 'beam_scan',
    iconConcept: 'Minimalist automotive dash engine block projecting a glowing yellow tractor cone with a floating miniature cow silhouette.',
    dtcCode: 'P0042',
    supportsCowLift: true,
  },
  {
    id: 'spark_incursion',
    name: 'The Alien Spark Plug (Roswell Glow)',
    tagline: 'Anti-gravity propulsion detected in Cylinder #4.',
    humorLore: 'Your internal combustion engine has been secretly retrofitted with zero-point alien technology. Side effects include right-angle turns at Mach 12 and glowing radioactive exhaust.',
    recommendedTheme: 'roswell',
    recommendedAnimation: 'pulse',
    iconConcept: 'Engine block with dual high-voltage lightning spark plugs, an alien head in the combustion chamber, and glowing neon green Roswell accents.',
    dtcCode: 'P0555',
    supportsCowLift: false,
  },
  {
    id: 'annunciator_dash',
    name: 'Cockpit Annunciator (Top-Gun UAP)',
    tagline: 'Master Caution: Unidentified Sky Intrusion.',
    humorLore: 'Styled after military jet Master Caution lights with stacked annunciator blocks: [CHECK SKY] [ANOMALY DETECTED] [RADAR LOCK]. Guaranteed to make your desktop look like an F-22 cockpit.',
    recommendedTheme: 'amber',
    recommendedAnimation: 'strobe',
    iconConcept: 'Dual-tile amber and red tactical cockpit annunciator badge with glowing neon HUD lines and UAP crosshair brackets.',
    dtcCode: 'P2004',
    supportsCowLift: false,
  },
  {
    id: 'retro_obd2_pixel',
    name: 'Retro 80s OBD-II Diagnostic Cluster',
    tagline: '1980s Vacuum Fluorescent Display with Fault Code Readout.',
    humorLore: 'Vintage 8-bit digital instrument cluster warning light. The check engine bulb is loose, but if you hit the dashboard with your fist, the UFO signal becomes clearer.',
    recommendedTheme: 'cyan',
    recommendedAnimation: 'pulse',
    iconConcept: 'Pixelated segment engine outline with 80s scanlines, digital glitch sparks, and a retro cyan HUD grid.',
    dtcCode: 'P0404',
    supportsCowLift: true,
  },
  {
    id: 'minimal_saucer_core',
    name: 'Cyber Saucer Monoline (Tech Minimal)',
    tagline: 'Clean geometric vector blending engine pistons and saucer orbits.',
    humorLore: 'For the refined sky observer who wants a subtle nod to automotive absurdity without alarming coworkers. Looks like a luxury tech company logo until you look closer.',
    recommendedTheme: 'cyan',
    recommendedAnimation: 'solid',
    iconConcept: 'Precise 2px geometric monoline vector with concentric orbital rings and engine cam profiles.',
    dtcCode: 'P0777',
    supportsCowLift: false,
  },
  {
    id: 'ai_concept_render',
    name: 'Photorealistic Amber Dash Render',
    tagline: 'High-definition 3D instrument cluster concept artwork.',
    humorLore: 'A studio-rendered automotive instrument cluster badge featuring glowing textured glass, micro-amber LEDs, and a photorealistic miniature saucer tractor beam.',
    recommendedTheme: 'amber',
    recommendedAnimation: 'pulse',
    iconConcept: 'Rich photorealistic AI-generated concept artwork embedded with vector glow overlay.',
    dtcCode: 'P1947',
    supportsCowLift: true,
  },
];

export const DTC_FAULT_CODES: DtcFaultCode[] = [
  {
    code: 'DTC P0404',
    title: 'Sky Anomaly Not Found in Civilian ADS-B Radar',
    severity: 'WARNING',
    description: 'Object tracked at FL450 has no ICAO 24-bit transponder or flight plan on file.',
    suggestedAction: 'Point optical binoculars at azimuth 284°, calibrate camera shutter to 1/2000s.',
  },
  {
    code: 'DTC P1947',
    title: 'Roswell Intake Manifold Pressure Exceeded',
    severity: 'CRITICAL',
    description: 'Propulsion unit exhibiting zero combustion exhaust while maintaining Mach 6 cruise velocity.',
    suggestedAction: 'Do not attempt to pull over. Ensure tinfoil hat is securely grounded to chassis.',
  },
  {
    code: 'DTC P2004',
    title: 'Tic-Tac Instantaneous 500G Right-Angle Acceleration',
    severity: 'CRITICAL',
    description: 'Vehicle executed 90-degree vector change with no deceleration or sonic boom signature.',
    suggestedAction: 'Notify NORAD and check dashcam memory card storage.',
  },
  {
    code: 'DTC P0042',
    title: 'Bovine Extraction Voltage Drop (Pasture Levitation)',
    severity: 'WARNING',
    description: 'Tractor beam power draw exceeds 1.21 Gigawatts; Holstein dairy cow elevated 45 feet.',
    suggestedAction: 'Offer cow grass pellets and photograph with high-speed CMOS sensor.',
  },
  {
    code: 'DTC P0000',
    title: 'Swamp Gas & Atmospheric Inversion Self-Test',
    severity: 'INFO',
    description: 'Civilian explanation generator operating at 100% efficiency. All anomalies dismissed as Venus.',
    suggestedAction: 'Ignore government press conference, keep scanning the zenith.',
  },
  {
    code: 'DTC P0555',
    title: 'Hyper-Dimensional Spark Plug In Cylinder #4',
    severity: 'WARNING',
    description: 'Zero-point energy coil arcing across quantum vacuum boundary layer.',
    suggestedAction: 'Check flux capacitor oil level and avoid touching the alien antenna.',
  },
  {
    code: 'DTC P0777',
    title: 'Zero Thermal Exhaust Signature Detected',
    severity: 'CRITICAL',
    description: 'FLIR infrared camera registers target temperature identical to ambient night sky (-40°C).',
    suggestedAction: 'Switch radar from Doppler to Pulse-Compressed mode.',
  },
  {
    code: 'DTC P0001',
    title: 'Check Sky Light Bulb Self-Test Nominal',
    severity: 'INFO',
    description: 'Instrument cluster LED check complete. No electrical tape detected covering the light.',
    suggestedAction: 'Drive safely and keep your eyes on the road and sky simultaneously.',
  },
];

export const COLOR_THEMES = [
  {
    id: 'amber' as LogoColorTheme,
    name: 'Classic Amber Dash',
    subtext: 'Authentic 1990s Check Engine Yellow (#F59E0B)',
    hex: '#F59E0B',
    accentHex: '#FBBF24',
    bgClass: 'bg-amber-500/20',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-400',
    glowClass: 'shadow-amber-500/50',
  },
  {
    id: 'roswell' as LogoColorTheme,
    name: 'Roswell Neon Green',
    subtext: 'Bioluminescent Alien Green (#10B981)',
    hex: '#10B981',
    accentHex: '#34D399',
    bgClass: 'bg-emerald-500/20',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-400',
    glowClass: 'shadow-emerald-500/50',
  },
  {
    id: 'cyan' as LogoColorTheme,
    name: 'Cyber HUD Cyan',
    subtext: 'Tactical Avionics Radar Blue (#06B6D4)',
    hex: '#06B6D4',
    accentHex: '#22D3EE',
    bgClass: 'bg-cyan-500/20',
    borderClass: 'border-cyan-500',
    textClass: 'text-cyan-400',
    glowClass: 'shadow-cyan-500/50',
  },
  {
    id: 'crimson' as LogoColorTheme,
    name: 'Critical Red Alert',
    subtext: 'Imminent Incursion Warning (#EF4444)',
    hex: '#EF4444',
    accentHex: '#F87171',
    bgClass: 'bg-rose-500/20',
    borderClass: 'border-rose-500',
    textClass: 'text-rose-400',
    glowClass: 'shadow-rose-500/50',
  },
  {
    id: 'stealth' as LogoColorTheme,
    name: 'Tactical Stealth Slate',
    subtext: 'Classified Chrome & Night Sky (#94A3B8)',
    hex: '#E2E8F0',
    accentHex: '#94A3B8',
    bgClass: 'bg-slate-500/20',
    borderClass: 'border-slate-400',
    textClass: 'text-slate-200',
    glowClass: 'shadow-slate-500/30',
  },
];

export const DEFAULT_LOGO_CONFIG: LogoConfig = {
  variantId: 'piston_saucer',
  colorTheme: 'amber',
  animationMode: 'pulse',
  showCowLift: true,
  showFaultCodeBadge: false,
  glowIntensity: 'high',
  customFaultCode: 'P1947',
};
