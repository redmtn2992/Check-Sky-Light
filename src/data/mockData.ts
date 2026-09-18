import { SightingReport, ChatChannel, ChatMessage, AlertNotification } from '../types';

export const INITIAL_SIGHTINGS: SightingReport[] = [
  {
    id: 'sgt-100',
    title: 'Glowing Metallic Sphere Maneuvering near Sandia Crest',
    observerName: 'Sarah Jenkins',
    observerBadge: 'Verified Spotter',
    timestamp: '2026-07-29T21:15:00Z',
    location: { lat: 35.0844, lng: -106.6504, city: 'Albuquerque', region: 'New Mexico, USA' },
    locationName: 'Sandia Crest / Kirtland Corridor, Albuquerque, NM',
    description: 'High-altitude silent metallic sphere performing slow zig-zag pattern over Albuquerque metro area before accelerating eastward towards Sandia Mountains with no visible engine exhaust.',
    probabilityScore: 92,
    status: 'AI_ANOMALY_CONFIRMED',
    mediaUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop',
    mediaType: 'image',
    upvotes: 256,
    upvotedByMe: true,
    commentsCount: 58,
    tags: ['Albuquerque', 'Sandia Crest', 'Metallic Sphere', 'Non-Ballistic'],
    matchedTelemetryNote: 'ADS-B transponder cross-check clear; no matching civilian flights within 30 miles.'
  },
  {
    id: 'sgt-101',
    title: 'Luminous Orb Executing Sharp Multi-Mach Vector Shift',
    observerName: 'Capt. Marcus Vance (Ret. USAF)',
    observerBadge: 'Verified Pilot',
    timestamp: '2026-07-28T22:41:00Z',
    location: { lat: 32.7157, lng: -117.1611, city: 'San Diego', region: 'California, USA' },
    locationName: 'San Diego Offshore Sector, CA',
    description: 'Self-luminous white orb descended rapidly from FL450 to surface level in under 1.2 seconds with no sonic shockwave or thermal jet plume. No transponder signal registered on ADS-B.',
    probabilityScore: 94,
    status: 'AI_ANOMALY_CONFIRMED',
    mediaUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop',
    mediaType: 'image',
    upvotes: 218,
    upvotedByMe: false,
    commentsCount: 42,
    tags: ['San Diego', 'High Speed', 'Non-Ballistic', 'No Thermal Plume'],
    matchedTelemetryNote: 'Zero transponder correlation across 18 active commercial flights within 50km radius.'
  },
  {
    id: 'sgt-102',
    title: 'Triangular Metallic Array with Pulsing Amber Peripheral Nodes',
    observerName: 'Dr. Elena Rostova',
    observerBadge: 'Astrophysicist',
    timestamp: '2026-07-27T04:15:00Z',
    location: { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', region: 'California, USA' },
    locationName: 'Angeles National Forest Ridge, CA',
    description: 'Observed silent equilateral triangular airframe spanning ~40m hovering statically above ridge line. Peripheral lights pulsed in non-standard sequence. Departed vertically at extreme velocity.',
    probabilityScore: 89,
    status: 'AI_ANOMALY_CONFIRMED',
    mediaUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    mediaType: 'image',
    upvotes: 184,
    upvotedByMe: true,
    commentsCount: 31,
    tags: ['Triangular UAP', 'Silent Hover', 'Anomalous Acceleration'],
    matchedTelemetryNote: 'Starlink orbital train checked; pass altitude mismatch (12,000 ft observed vs 550 km orbit).'
  },
  {
    id: 'sgt-103',
    title: 'High-Altitude Starlink Satellite Train Pass',
    observerName: 'SkyLightObserver99',
    observerBadge: 'Community Observer',
    timestamp: '2026-07-26T21:30:00Z',
    location: { lat: 41.8781, lng: -87.6298, city: 'Chicago', region: 'Illinois, USA' },
    locationName: 'Lake Michigan Shoreline, IL',
    description: 'Linear formation of 24 illuminated points moving in rigid line across northern horizon at constant angular velocity.',
    probabilityScore: 12,
    status: 'EXPLAINED_FLIGHT',
    mediaUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    mediaType: 'image',
    upvotes: 65,
    upvotedByMe: false,
    commentsCount: 14,
    tags: ['Starlink', 'Linear Satellite Train', 'Identified Orbit'],
    matchedTelemetryNote: 'Confirmed match with Starlink Group 7-12 satellite constellation orbital pass.'
  },
  {
    id: 'sgt-104',
    title: 'Cylindrical Tic-Tac Anomaly Recorded over Mojave Test Range',
    observerName: 'David K. Miller',
    observerBadge: 'Radar Analyst',
    timestamp: '2026-07-25T18:02:00Z',
    location: { lat: 35.011, lng: -115.4734, city: 'Mojave', region: 'California, USA' },
    locationName: 'Mojave Desert Basin, CA',
    description: 'Smooth white cylindrical object without flight control surfaces, wings, or exhaust plume. Object maintained static position against 45 knot high-altitude winds.',
    probabilityScore: 97,
    status: 'AI_ANOMALY_CONFIRMED',
    mediaUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    mediaType: 'image',
    upvotes: 312,
    upvotedByMe: false,
    commentsCount: 88,
    tags: ['Tic-Tac UAP', 'No Flight Surfaces', 'Radar Telemetry'],
    matchedTelemetryNote: 'Military airspace transponder sweep yielded zero active transponder records.'
  },
  {
    id: 'sgt-105',
    title: 'Commercial Flight Delta 418 Glint Reflection',
    observerName: 'AviationFanatic',
    observerBadge: 'AvGeek',
    timestamp: '2026-07-24T15:10:00Z',
    location: { lat: 33.9425, lng: -118.4081, city: 'El Segundo', region: 'California, USA' },
    locationName: 'LAX Departure Corridor',
    description: 'Bright flash near sun position at FL310. Camera captured contrail and wing reflection.',
    probabilityScore: 4,
    status: 'EXPLAINED_FLIGHT',
    mediaUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop',
    mediaType: 'image',
    upvotes: 42,
    upvotedByMe: false,
    commentsCount: 8,
    tags: ['Commercial Jet', 'Wing Glint', 'LAX ADS-B Match'],
    matchedTelemetryNote: 'Matched Boeing 737-800 DL418 outbound LAX to JFK.'
  }
];

export const CHAT_CHANNELS: ChatChannel[] = [
  {
    id: 'global-skylight',
    name: 'Global Sky Light Grid',
    description: '256-Bit Encrypted regional detection logs & worldwide sensor broadcasts.',
    iconName: 'Globe',
    activeWatchers: 1420,
    channelKeyHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'pacific-coast-sector',
    name: 'Pacific Sector & Offshore Radar',
    description: 'Monitoring Catalina Channel, San Diego offshore anomalies & West Coast corridors.',
    iconName: 'Compass',
    activeWatchers: 618,
    channelKeyHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4'
  },
  {
    id: 'tic-tac-research',
    name: 'Aero-Dynamics & Physics Lab',
    description: 'E2EE analysis on non-ballistic kinematics, radar cross-sections & optical anomalies.',
    iconName: 'Cpu',
    activeWatchers: 389,
    channelKeyHash: 'ecc8732db92a09e330896f4b08703f001719a99723528b88c42289c8942b103e'
  },
  {
    id: 'deep-space-anomalies',
    name: 'Orbital & Deep Space Trackers',
    description: 'Satellite flare triage, Starlink train filtering & fast optical flashes.',
    iconName: 'Satellite',
    activeWatchers: 512,
    channelKeyHash: '2b3620958d52362b2d075677dd5006d09121a7ea937243aa8a76059d64a66a1a'
  }
];

export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'global-skylight': [
    {
      id: 'msg-1',
      channelId: 'global-skylight',
      sender: 'LightNode-Alpha-09',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
      badge: 'Node Operator',
      timestamp: '2026-07-29T18:40:10Z',
      encryptedText: 'U2FsdGVkX18v9z22kXmQ3Z8Qx88Y4Q+M1a7K39pA1Z==',
      decryptedText: 'Check Sky Light Automated Sensor Grid #04 detected un-correlated target moving at 3,200 kts at FL520 near Sector 32.',
      encryptionKey: 'AES-256-GCM::KEY-GLOBAL-01',
      sightingAttachment: {
        id: 'sgt-101',
        title: 'Luminous Orb Executing Sharp Multi-Mach Vector Shift',
        probabilityScore: 94,
        locationName: 'San Diego Offshore Sector, CA'
      }
    },
    {
      id: 'msg-2',
      channelId: 'global-skylight',
      sender: 'Dr. Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
      badge: 'Astrophysicist',
      timestamp: '2026-07-29T18:42:15Z',
      encryptedText: 'U2FsdGVkX19A9xLK1s99XpLmN90KmV819aP3X2aL8k==',
      decryptedText: 'Confirmed no satellite pass overlap in NORAD TLE database for that timestamp. Photometric curve shows monochromatic emit at 540nm.',
      encryptionKey: 'AES-256-GCM::KEY-GLOBAL-01'
    },
    {
      id: 'msg-3',
      channelId: 'global-skylight',
      sender: 'RadarAnalyst_Max',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
      badge: 'ADS-B Analyst',
      timestamp: '2026-07-29T18:45:00Z',
      encryptedText: 'U2FsdGVkX1+mK9x9210P29aKmsL193KaPmL81Xk92Q==',
      decryptedText: 'Cross-checked FAA primary and secondary radar logs. Transponder squawk was missing. Probability calculation locked at 94%.',
      encryptionKey: 'AES-256-GCM::KEY-GLOBAL-01'
    }
  ],
  'pacific-coast-sector': [
    {
      id: 'msg-4',
      channelId: 'pacific-coast-sector',
      sender: 'CatalinaObserver',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
      badge: 'Coast Observer',
      timestamp: '2026-07-29T17:15:00Z',
      encryptedText: 'U2FsdGVkX19pK110aXmK918XaLK92a19Mkp18XaQ0P==',
      decryptedText: 'Dual infrared camera array running live sweep off San Clemente Island. Multiple amber plasma points recorded.',
      encryptionKey: 'AES-256-GCM::KEY-PACIFIC-02'
    }
  ]
};

export const INITIAL_ALERTS: AlertNotification[] = [
  {
    id: 'alt-1',
    timestamp: '12 mins ago',
    title: 'High Anomaly Detected Nearby',
    message: 'A 94% probability UAP event was reported 14.2 miles west of your current location.',
    distanceMiles: 14.2,
    anomalyScore: 94,
    locationName: 'San Diego Offshore Sector, CA',
    sightingId: 'sgt-101',
    isRead: false,
    severity: 'critical'
  },
  {
    id: 'alt-2',
    timestamp: '1 hour ago',
    title: 'Uncorrelated Flight Telemetry Alert',
    message: 'Primary radar sensor captured 1 object moving at 1,800 knots without ADS-B transponder broadcast.',
    distanceMiles: 28.5,
    anomalyScore: 89,
    locationName: 'Angeles National Forest Ridge, CA',
    sightingId: 'sgt-102',
    isRead: true,
    severity: 'warning'
  }
];

export const MOCK_SIGHTINGS = INITIAL_SIGHTINGS;
export const MOCK_CHAT_MESSAGES = INITIAL_CHAT_MESSAGES['global-skylight'] || [];
export const MOCK_ALERTS = INITIAL_ALERTS;

export const MOCK_FLIGHTS = [
  {
    id: 'fl-1',
    icao24: 'A49C12',
    callsign: 'UAL1422',
    originCountry: 'United States',
    latitude: 39.8492,
    longitude: -104.7503,
    altitudeFeet: 28400,
    velocityKnots: 440,
    heading: 78,
    verticalRate: 0,
    squawk: '4211',
    lastContact: Math.floor(Date.now() / 1000),
    uncorrelatedUapProximity: true
  },
  {
    id: 'fl-2',
    icao24: 'A881B9',
    callsign: 'SWA892',
    originCountry: 'United States',
    latitude: 39.5592,
    longitude: -105.1203,
    altitudeFeet: 16500,
    velocityKnots: 320,
    heading: 245,
    verticalRate: -800,
    squawk: '1200',
    lastContact: Math.floor(Date.now() / 1000),
    uncorrelatedUapProximity: false
  },
  {
    id: 'fl-3',
    icao24: 'C014EF',
    callsign: 'DAL490',
    originCountry: 'United States',
    latitude: 40.0192,
    longitude: -104.6403,
    altitudeFeet: 34000,
    velocityKnots: 495,
    heading: 110,
    verticalRate: 0,
    squawk: '3152',
    lastContact: Math.floor(Date.now() / 1000),
    uncorrelatedUapProximity: false
  }
];

export const MOCK_CELESTIAL_BODIES = [
  {
    id: 'cel-venus',
    name: 'Venus (Morning/Evening Star)',
    symbol: '♀',
    azimuth: 245,
    elevation: 32,
    magnitude: -4.4,
    color: '#fef08a',
    isAboveHorizon: true,
    description: 'Extremely bright planetary luminaire, common source of civilian static UAP reports.',
    uapConfusionRisk: 'CRITICAL' as const
  },
  {
    id: 'cel-jupiter',
    name: 'Jupiter',
    symbol: '♃',
    azimuth: 140,
    elevation: 58,
    magnitude: -2.6,
    color: '#fed7aa',
    isAboveHorizon: true,
    description: 'Bright high-zenith planet with steady non-twinkling luminance.',
    uapConfusionRisk: 'HIGH' as const
  },
  {
    id: 'cel-sirius',
    name: 'Sirius (Alpha Canis Majoris)',
    symbol: '★',
    azimuth: 195,
    elevation: 24,
    magnitude: -1.46,
    color: '#93c5fd',
    isAboveHorizon: true,
    description: 'High scintillation chromatic twinkling through thermal atmospheric layers.',
    uapConfusionRisk: 'HIGH' as const
  }
];

