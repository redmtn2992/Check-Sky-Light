export interface AaroCaseRecord {
  caseId: string;
  title: string;
  url: string;
  status: 'RESOLVED_CONVENTIONAL' | 'UNRESOLVED_UAP';
  isUnresolved: boolean;
  incidentYear: string;
  geographicRegion: string;
  reportingAgency: string;
  sensorSystem: string;
  resolutionCategory: 
    | 'BIOLOGICAL_BIRDS' 
    | 'BALLOONS' 
    | 'AIRCRAFT_STARLINK' 
    | 'SENSOR_ARTIFACT' 
    | 'SKY_LANTERNS' 
    | 'COMMERCIAL_AIRCRAFT'
    | 'METALLURGICAL_SPECIMEN'
    | 'UNRESOLVED_ANOMALOUS_UAP';
  officialVerdict: string;
  officialSummary: string;
  physicsDeconfliction: {
    mechanism: string;
    apparentIllusion: string;
    groundTruth: string;
    sensorPlatformSpeed?: string;
  };
  dtcCode: string;
  confidence: 'HIGH' | 'MODERATE';
  dvidsId?: string;
  tags: string[];
}

export interface AaroInformationPaper {
  id: string;
  title: string;
  publicationDate: string;
  authoringBody: string;
  keyPrinciple: string;
  summary: string;
  methodology: string;
  applicationToUap: string;
  resolutionMetric: string;
  url: string;
}

/**
 * Authoritative Digest of the All-domain Anomaly Resolution Office (AARO)
 * Official Records Collection & Scientific Information Papers: https://www.aaro.mil/UAP-Records/
 */
export const AARO_CASE_RECORDS: AaroCaseRecord[] = [
  // =========================================================================
  // UNRESOLVED UAP REPORTS (POSITIVE CONTROLS / ACTIVE ANOMALY BASELINE)
  // =========================================================================
  {
    caseId: 'PR-013',
    title: 'PR-013: Unresolved UAP Report (Europe, 2022)',
    url: 'https://www.dvidshub.net/video/992262/pr-013-unresolved-uap-report-europe-2022',
    dvidsId: '992262',
    status: 'UNRESOLVED_UAP',
    isUnresolved: true,
    incidentYear: '2022',
    geographicRegion: 'Europe (USEUCOM Airspace)',
    reportingAgency: 'United States European Command (USEUCOM) / DoD AARO',
    sensorSystem: 'Airborne Military Forward-Looking Infrared (FLIR / MWIR)',
    resolutionCategory: 'UNRESOLVED_ANOMALOUS_UAP',
    officialVerdict: 'Assessed with HIGH confidence to be a physical object; officially UNRESOLVED pending conclusive attribution.',
    officialSummary: 'Twenty seconds of unclassified military infrared video recorded in 2022 depicting an airborne physical object in European airspace. AARO assessed with high confidence that the footage depicts a physical object. The object exhibits continuous level horizontal kinematics without observable aerodynamic wings, control surfaces, rotor downwash, or visible exhaust plumes. Maintained by AARO in the active historical and locational trend analysis repository as an Unresolved UAP Report.',
    physicsDeconfliction: {
      mechanism: 'Multi-Spectral Physical Target / Unresolved Aerial Anomaly',
      apparentIllusion: 'Target is NOT deconflicted as birds or balloons. AARO determined with high confidence that this is an authentic physical object in flight.',
      groundTruth: 'Authentic unclassified military sensor capture of an unresolved airborne target. Under Classical Aerospace Lens A, the object lacks conventional aerodynamic lifting surfaces, engine combustion, or transponder emissions. Evaluates under Theoretical Metric Manipulation Lens B as a candidate localized metric propulsion anomaly.'
    },
    dtcCode: 'P0001: Genuine Aerial Anomaly / Official Unresolved UAP Report (AARO PR-013)',
    confidence: 'HIGH',
    tags: [
      'pr-013',
      '992262',
      'unresolved-uap-report',
      'unresolved uap europe 2022',
      'pr013',
      'pr-013-unresolved-uap-report-europe-2022',
      'unresolved-uap',
      'unresolved_uap',
      'unresolved uap report',
      'dvidshub.net/video/992262',
      'dvidshub_992262'
    ]
  },
  {
    caseId: 'PR-012',
    title: 'PR-012: Unresolved UAP Report (Europe, 2022)',
    url: 'https://www.aaro.mil/UAP-Records/',
    status: 'UNRESOLVED_UAP',
    isUnresolved: true,
    incidentYear: '2022',
    geographicRegion: 'Europe (USEUCOM Airspace)',
    reportingAgency: 'United States European Command (USEUCOM) / DoD AARO',
    sensorSystem: 'Airborne Military Infrared Sensor (FLIR / MWIR)',
    resolutionCategory: 'UNRESOLVED_ANOMALOUS_UAP',
    officialVerdict: 'Assessed with HIGH confidence to be a physical object; officially UNRESOLVED pending further data.',
    officialSummary: '55 seconds of infrared video footage collected by a U.S. military airborne platform in European airspace. AARO assessed with high confidence that the footage depicts a physical object. The object demonstrated steady kinematics without identifiable propulsion plumes or aerodynamic control structures. Retained in AARO active baseline.',
    physicsDeconfliction: {
      mechanism: 'Airborne Physical Target / Unresolved Multi-Mission Profile',
      apparentIllusion: 'Confirmed physical target in military sensor feed.',
      groundTruth: 'Physical object verified in unclassified military infrared sensor line. Unresolved under conventional aerospace deconfliction.'
    },
    dtcCode: 'P0001: Genuine Aerial Anomaly / Official Unresolved UAP Report (AARO PR-012)',
    confidence: 'HIGH',
    tags: ['pr-012', 'unresolved uap europe 2022', 'pr012']
  },
  {
    caseId: 'PR-018',
    title: 'PR-018: Unresolved UAP Report (Europe, 2024)',
    url: 'https://www.aaro.mil/UAP-Records/',
    status: 'UNRESOLVED_UAP',
    isUnresolved: true,
    incidentYear: '2024',
    geographicRegion: 'Europe (USEUCOM Airspace)',
    reportingAgency: 'United States European Command (USEUCOM) / DoD AARO',
    sensorSystem: 'Airborne Long-Duration Infrared Sensor (FLIR / MWIR)',
    resolutionCategory: 'UNRESOLVED_ANOMALOUS_UAP',
    officialVerdict: 'Assessed with HIGH confidence to be a physical object; officially UNRESOLVED.',
    officialSummary: 'Ten minutes and thirty seconds of infrared video footage from a U.S. military airborne platform tracking an unidentified object. AARO confirmed with high confidence that the footage depicts a physical object. Retained in historical and locational trend analysis.',
    physicsDeconfliction: {
      mechanism: 'Extended Military Infrared Tracking / Unresolved Attribution',
      apparentIllusion: 'Persistent physical object observed across long-duration sensor line.',
      groundTruth: 'Sensor tracking of physical target without conventional aerospace identification or civilian airframe correlation.'
    },
    dtcCode: 'P0001: Genuine Aerial Anomaly / Official Unresolved UAP Report (AARO PR-018)',
    confidence: 'HIGH',
    tags: ['pr-018', 'unresolved uap europe 2024', 'pr018']
  },
  {
    caseId: 'PR-003',
    title: 'PR-003: Unresolved UAP Report (Africa, 2023)',
    url: 'https://www.aaro.mil/UAP-Records/',
    status: 'UNRESOLVED_UAP',
    isUnresolved: true,
    incidentYear: '2023',
    geographicRegion: 'Africa (USAFRICOM Airspace)',
    reportingAgency: 'United States Africa Command (USAFRICOM) / DoD AARO',
    sensorSystem: 'Airborne Infrared Sensor (MWIR)',
    resolutionCategory: 'UNRESOLVED_ANOMALOUS_UAP',
    officialVerdict: 'Thermal signature consistent with physical object; officially UNRESOLVED.',
    officialSummary: 'Nearly five minutes of military infrared video footage showing an apparent heat signature consistent with a physical object. AARO maintains case in active archive pending corroborating multi-sensor telemetry.',
    physicsDeconfliction: {
      mechanism: 'Thermal Infrared Signature / Physical Object Profile',
      apparentIllusion: 'Thermal target verified in unclassified military sensor capture.',
      groundTruth: 'Maintained by AARO in the historical and locational trend analysis repository as an Unresolved UAP Report.'
    },
    dtcCode: 'P0001: Genuine Aerial Anomaly / Official Unresolved UAP Report (AARO PR-003)',
    confidence: 'HIGH',
    tags: ['pr-003', 'unresolved uap africa 2023', 'pr003']
  },
  {
    caseId: 'AARO-ME-ORB',
    title: 'Middle East MQ-9 Reaper Spherical UAP (2022)',
    url: 'https://www.aaro.mil/UAP-Records/',
    status: 'UNRESOLVED_UAP',
    isUnresolved: true,
    incidentYear: '2022',
    geographicRegion: 'Middle East (CENTCOM Airspace)',
    reportingAgency: 'United States Central Command (USCENTCOM) / DoD AARO',
    sensorSystem: 'MQ-9 Reaper Airborne Electro-Optical / Infrared (EO/IR) Sensor',
    resolutionCategory: 'UNRESOLVED_ANOMALOUS_UAP',
    officialVerdict: 'Officially UNRESOLVED: High-speed metallic orb exhibiting non-conventional flight without propulsion wash.',
    officialSummary: 'Declassified footage presented by AARO Director Dr. Sean Kirkpatrick to the Senate Armed Services Committee. Depicts a spherical silver/metallic orb flying at high velocity through the sensor field of view over an active combat theater without apparent wings, engines, or exhaust trails.',
    physicsDeconfliction: {
      mechanism: 'Spherical Metallic Geometry / Absence of Aerodynamic Lift Surfaces',
      apparentIllusion: 'High-speed transit through military airspace without aerodynamic wings or control surfaces.',
      groundTruth: 'Unresolved metallic sphere exhibiting zero propulsion signatures, exhaust plumes, or fluid cavitation.'
    },
    dtcCode: 'P0001: Genuine Aerial Anomaly / Declassified Spherical UAP (Middle East)',
    confidence: 'HIGH',
    tags: ['middle east orb', 'me orb', 'reaper metallic orb', 'spherical uap', 'senate hearing', 'kirkpatrick']
  },
  {
    caseId: 'AARO-WESTERN-US-P3',
    title: 'Western US P-3 Orion Crew Sighting (Active Archive)',
    url: 'https://www.aaro.mil/UAP-Records/',
    status: 'UNRESOLVED_UAP',
    isUnresolved: true,
    incidentYear: '2023',
    geographicRegion: 'Western United States (Military Operations Area)',
    reportingAgency: 'United States Navy (P-3 Orion Flight Crew) / DoD AARO',
    sensorSystem: 'Cockpit Pilot Visual & Airborne Search Radar',
    resolutionCategory: 'UNRESOLVED_ANOMALOUS_UAP',
    officialVerdict: 'Held in AARO Active Archive pending additional multi-sensor radar data.',
    officialSummary: 'Flight crew of a Navy P-3 Orion on a training mission reported observing three unidentified objects in formation flight. Comprehensive sensor review confirmed zero matching civilian transponders. Case is actively maintained in AARO Active Archive.',
    physicsDeconfliction: {
      mechanism: 'Multi-Vehicle Formation Flight / Unresolved Transponder Correlation',
      apparentIllusion: 'Formation geometry observed by experienced naval flight crew.',
      groundTruth: 'Uncorrelated aerial targets in restricted airspace without ADS-B or primary radar flight plan matches.'
    },
    dtcCode: 'P0001: Genuine Aerial Anomaly / P-3 Orion Formation Report (Active Archive)',
    confidence: 'MODERATE',
    tags: ['western us p3', 'p-3 orion', 'formation sighting', 'active archive']
  },

  // =========================================================================
  // RESOLVED CASE RESOLUTIONS (NEGATIVE CONTROLS / CONVENTIONAL AIRSPACE)
  // =========================================================================
  {
    caseId: 'PR-016',
    title: 'PR-016: Resolved as Birds (Europe, 2023)',
    url: 'https://www.dvidshub.net/video/988673/pr-016-resolved-birds-europe-2023',
    dvidsId: '988673',
    status: 'RESOLVED_CONVENTIONAL',
    isUnresolved: false,
    incidentYear: '2023',
    geographicRegion: 'Europe (USEUCOM Airspace)',
    reportingAgency: 'United States European Command (USEUCOM)',
    sensorSystem: 'MQ-9 Reaper Airborne Forward-Looking Infrared (FLIR / MWIR)',
    resolutionCategory: 'BIOLOGICAL_BIRDS',
    officialVerdict: 'Assessed with HIGH confidence to be avian biology (birds in flight).',
    officialSummary: 'Airborne infrared recording submitted by USEUCOM depicting multiple warm objects traversing across terrain at apparent high speeds. Comprehensive photometric and kinematic analysis definitively confirmed objects are feathered avian wildlife drifting with wind under sensor platform parallax.',
    physicsDeconfliction: {
      mechanism: 'Sensor Platform Motion & Geometric Optical Parallax',
      apparentIllusion: 'Because the MQ-9 Reaper aircraft is cruising at 150–200 knots at altitude while tracking distant low-altitude targets, angular camera traverse against background terrain creates severe geometric parallax, making slow-moving or wind-drifting birds appear to streak across the ground at impossible multi-Mach speeds.',
      groundTruth: 'True airspeed of the targets resolves to standard biological avian cruising velocities (18 to 35 knots). Warm animal core temperature (~40°C) blooms in thermal infrared, obscuring wing flapping and giving the false appearance of rigid metallic or thermal orbs.',
      sensorPlatformSpeed: '150–200 kts (MQ-9 Reaper cruise)'
    },
    dtcCode: 'P0006: Biological Avian Fauna / Wind-Drift Kinematics (Birds)',
    confidence: 'HIGH',
    tags: ['pr-016', '988673', 'resolved-birds', 'birds europe 2023', 'pr016']
  },
  {
    caseId: 'PR-002',
    title: 'PR-002: Resolved as Migratory Birds (Africa, 2024)',
    url: 'https://www.aaro.mil/UAP-Records/',
    status: 'RESOLVED_CONVENTIONAL',
    isUnresolved: false,
    incidentYear: '2024',
    geographicRegion: 'Africa (USAFRICOM Airspace)',
    reportingAgency: 'United States Africa Command (USAFRICOM)',
    sensorSystem: 'Airborne Long-Range Thermal Infrared (LWIR)',
    resolutionCategory: 'BIOLOGICAL_BIRDS',
    officialVerdict: 'Assessed with HIGH confidence to be migratory avian flock.',
    officialSummary: 'Infrared sensor capture of clustered thermal signatures in formation flight. Kinematic track correlated with regional migratory flyways and atmospheric thermals.',
    physicsDeconfliction: {
      mechanism: 'Avian Thermal Dissipation & V-Formation Flight Aerodynamics',
      apparentIllusion: 'Thermal dissipation from flock formation appears as coordinated multi-vehicle anomalous formation.',
      groundTruth: 'Inter-target spacing, wing-beat frequency, and airspeed of 24–38 knots match migratory waterfowl.'
    },
    dtcCode: 'P0006: Biological Avian Fauna / Migratory Flock Kinematics',
    confidence: 'HIGH',
    tags: ['pr-002', 'migratory birds africa 2024', 'pr002']
  },
  {
    caseId: 'PR-005',
    title: 'PR-005 & PR-006: Resolved as Commercial Balloons (Europe, 2022)',
    url: 'https://www.aaro.mil/UAP-Records/',
    status: 'RESOLVED_CONVENTIONAL',
    isUnresolved: false,
    incidentYear: '2022',
    geographicRegion: 'Europe (USEUCOM Airspace)',
    reportingAgency: 'United States European Command (USEUCOM)',
    sensorSystem: 'Airborne Military Electro-Optical / Infrared Sensor',
    resolutionCategory: 'BALLOONS',
    officialVerdict: 'Assessed with HIGH confidence to be commercial aerostats (balloons).',
    officialSummary: 'Sensors recorded floating objects exhibiting steady wind-drift. Kinematic and radiometric analysis definitively confirmed objects are commercial lighter-than-air aerostats.',
    physicsDeconfliction: {
      mechanism: 'Lighter-Than-Air Buoyancy & Passive Wind Drift',
      apparentIllusion: 'Floating profile in infrared simulated anomalous hovering craft.',
      groundTruth: 'Target drift vector precisely matched regional atmospheric barometric wind speed (~12 knots).'
    },
    dtcCode: 'P0007: Meteorological Aerostat / Commercial Balloon Assembly',
    confidence: 'HIGH',
    tags: ['pr-005', 'pr-006', 'balloons europe 2022', 'pr005', 'pr006']
  },
  {
    caseId: 'AARO-GOFAST',
    title: 'Case Resolution: Go Fast Event (Florida Coast, 2015)',
    url: 'https://www.aaro.mil/UAP-Records/',
    status: 'RESOLVED_CONVENTIONAL',
    isUnresolved: false,
    incidentYear: '2015',
    geographicRegion: 'Atlantic Coast off Jacksonville / Florida',
    reportingAgency: 'United States Navy (Carrier Air Wing 11 / USS Theodore Roosevelt)',
    sensorSystem: 'Raytheon AN/ASQ-228 ATFLIR (F/A-18F Super Hornet)',
    resolutionCategory: 'BALLOONS',
    officialVerdict: 'Assessed with HIGH confidence to be a floating object (balloon/dropsonde) moving at wind speed (~40 knots).',
    officialSummary: 'The viral 2015 "Go Fast" ATFLIR video was widely reported as a high-speed sea-skimming craft. AARO rigorous trigonometric analysis resolved the object altitude to ~13,000 ft (not skimming water) moving at ambient wind speed (~40 knots).',
    physicsDeconfliction: {
      mechanism: 'Trigonometric Parallax & ATFLIR Sensor Pitch Geometry',
      apparentIllusion: 'The F/A-18 was banking at 25,000 ft at ~250 knots. Looking down at a 22° depression angle, the sensor line-of-sight swept rapidly across the cold ocean surface below, creating a forced-perspective illusion that the object was skimming water at blistering hypersonic speed.',
      groundTruth: 'Vector trigonometry reveals slant range of 4.2 nm, true altitude ~13,000 ft, true speed 40 knots matching meteorological wind shear. Target temperature is cold relative to ocean background.',
      sensorPlatformSpeed: '250+ kts (F/A-18F banking turn)'
    },
    dtcCode: 'P0007: Meteorological Aerostat / Sensor Parallax Vector (GoFast)',
    confidence: 'HIGH',
    tags: ['gofast', 'go fast', 'atflir 2015', 'navy go fast']
  },
  {
    caseId: 'AARO-AGUADILLA',
    title: 'Puerto Rico UAP Case Resolution (Aguadilla, April 26, 2013)',
    url: 'https://www.aaro.mil/UAP-Records/',
    status: 'RESOLVED_CONVENTIONAL',
    isUnresolved: false,
    incidentYear: '2013',
    geographicRegion: 'Aguadilla, Puerto Rico (Rafael Hernandez Airport)',
    reportingAgency: 'U.S. Customs and Border Protection (CBP)',
    sensorSystem: 'DHC-8 Aircraft with L3 Wescam MX-15 Infrared Turret',
    resolutionCategory: 'SKY_LANTERNS',
    officialVerdict: 'Assessed with HIGH confidence that the object did not demonstrate anomalous behaviors, and MODERATE confidence to be a pair of commercial sky lanterns.',
    officialSummary: 'Infrared video of an object drifting over runway and shoreline before seemingly dividing and dipping into the ocean. AARO and SCU analyses confirmed wind-drift trajectory and thermal reflections.',
    physicsDeconfliction: {
      mechanism: 'Wind Drift & Water Surface Thermal Mirroring',
      apparentIllusion: 'Apparent transmedium ocean entry and target splitting were optical artifacts caused by thermal reflection against calm water surface and infrared sensor blooming.',
      groundTruth: 'Objects drifted precisely at 10–13 knots matching the local wind shear vector recorded at Rafael Hernandez Airport. Thermal energy consistent with open kerosene fuel candle.'
    },
    dtcCode: 'P0008: Pyrotechnic Sky Lantern Assembly / Ambient Wind Drift',
    confidence: 'HIGH',
    tags: ['aguadilla', 'puerto rico 2013', 'cbp mx-15', 'sky lanterns aguadilla']
  },
  {
    caseId: 'AARO-AL-TAQADDUM',
    title: 'Al Taqaddum Case Resolution (Iraq, October 23, 2017)',
    url: 'https://www.aaro.mil/UAP-Records/',
    status: 'RESOLVED_CONVENTIONAL',
    isUnresolved: false,
    incidentYear: '2017',
    geographicRegion: 'Al Taqaddum Air Base, Iraq (CENTCOM Airspace)',
    reportingAgency: 'United States Central Command (USCENTCOM)',
    sensorSystem: 'Base Defense Surveillance Airborne & Ground Thermal Infrared',
    resolutionCategory: 'BALLOONS',
    officialVerdict: 'Assessed with HIGH confidence to be a cluster of fully and partially inflated balloons.',
    officialSummary: 'Sensors recorded an unidentified object drifting over military airbase. AARO kinematic evaluation confirmed zero anomalous propulsion; trajectory strictly aligned with low-level atmospheric winds.',
    physicsDeconfliction: {
      mechanism: 'Atmospheric Buoyancy & Cluster Balloon Aerodynamics',
      apparentIllusion: 'Irregular cluster shape in thermal IR simulated geometric anomalous structure.',
      groundTruth: 'Object climbed and drifted strictly within barometric wind layers with zero independent vector changes.'
    },
    dtcCode: 'P0007: Aerostat Balloon Cluster Assembly',
    confidence: 'HIGH',
    tags: ['al taqaddum', 'iraq balloons 2017', 'centcom balloon cluster']
  },
  {
    caseId: 'AARO-EGLIN',
    title: 'Eglin AFB Case Resolution (Florida, January 26, 2023)',
    url: 'https://www.aaro.mil/UAP-Records/',
    status: 'RESOLVED_CONVENTIONAL',
    isUnresolved: false,
    incidentYear: '2023',
    geographicRegion: 'Gulf of Mexico / Eglin AFB Warning Area',
    reportingAgency: 'United States Air Force (USAF Pilot Direct Report)',
    sensorSystem: 'APG-81 Active Electronically Scanned Array (AESA) Radar & Pilot Optical',
    resolutionCategory: 'BALLOONS',
    officialVerdict: 'Assessed with HIGH confidence to be an ordinary lighter-than-air object (balloon).',
    officialSummary: 'Military pilot reported radar lock and visual sighting of anomalous object. Multimodal review confirmed civilian research balloon operating without transponder in offshore warning airspace.',
    physicsDeconfliction: {
      mechanism: 'Lighter-Than-Air Buoyancy & Passive Wind Drift',
      apparentIllusion: 'Pilot high closure rate (~450 knots) gave impression of anomalous maneuver.',
      groundTruth: 'Radar telemetry confirmed zero ground velocity independent of ambient winds.'
    },
    dtcCode: 'P0007: Passive Lighter-Than-Air Commercial Aerostat',
    confidence: 'HIGH',
    tags: ['eglin afb', 'eglin balloon 2023', 'aesa radar balloon']
  },
  {
    caseId: 'AARO-ATMOSPHERIC-WAKES',
    title: 'Case Resolution: "Atmospheric Wakes" Sensor Artifacts (2022–2023)',
    url: 'https://www.aaro.mil/UAP-Records/',
    status: 'RESOLVED_CONVENTIONAL',
    isUnresolved: false,
    incidentYear: '2022-2023',
    geographicRegion: 'Middle East & Mediterranean Sea',
    reportingAgency: 'Multi-Mission Military Operational Units',
    sensorSystem: 'Shortwave (SWIR) & Midwave (MWIR) Infrared Sensor Lines',
    resolutionCategory: 'SENSOR_ARTIFACT',
    officialVerdict: 'Assessed as almost certainly sensor line-scan electronic readout artifacts.',
    officialSummary: 'Reports of linear atmospheric wake trails behind high-speed targets. Detailed sensor hardware teardown confirmed readout timing latencies in the focal plane array, not physical spacetime ionization.',
    physicsDeconfliction: {
      mechanism: 'Focal Plane Array Electronic Line-Scan Bleed',
      apparentIllusion: 'Apparent plasma wake or metric atmospheric shear trailing behind targets.',
      groundTruth: 'Hardware readout latency across sensor scanning rows during rapid sensor gimbal slew.'
    },
    dtcCode: 'P0404: Sensor Electronic Readout / Focal Plane Array Artifact',
    confidence: 'HIGH',
    tags: ['atmospheric wakes', 'focal plane array artifact', 'line-scan bleed']
  },
  {
    caseId: 'AARO-SOUTH-ASIA-REAPER',
    title: 'South Asia Commercial Aircraft Resolution (2023)',
    url: 'https://www.aaro.mil/UAP-Records/',
    status: 'RESOLVED_CONVENTIONAL',
    isUnresolved: false,
    incidentYear: '2023',
    geographicRegion: 'South Asia (Regional Combatant Airspace)',
    reportingAgency: 'Airborne Intelligence, Surveillance & Reconnaissance Units',
    sensorSystem: 'MQ-9 Reaper Airborne EO/IR Full Motion Video',
    resolutionCategory: 'COMMERCIAL_AIRCRAFT',
    officialVerdict: 'Assessed with HIGH confidence to be a distant commercial aircraft; trailing wake was video compression artifact.',
    officialSummary: 'MQ-9 Reaper crew observed an unidentified target with an apparent trailing cavitation or wake trail. AARO correlated commercial ADS-B logs to an airliner at 36,000 ft; trailing wake was a lossy video compression macroblock shadow.',
    physicsDeconfliction: {
      mechanism: 'Commercial Air Traffic Correlation & Video Compression Artifact',
      apparentIllusion: 'Trailing cavitation wake behind craft simulated exotic hydro-fluid decoupling.',
      groundTruth: 'Target matched scheduled commercial airliner; shadow wake was inter-frame video compression interpolation artifact.'
    },
    dtcCode: 'P0002: Commercial High-Altitude Civil Transport Airframe',
    confidence: 'HIGH',
    tags: ['south asia', 'reaper commercial', 'compression artifact', 'south asia reaper']
  },
  {
    caseId: 'AARO-STARLINK-SPECULAR',
    title: 'Satellite Specular Reflections & LEO Flares Resolution (238+ Cases)',
    url: 'https://www.aaro.mil/UAP-Records/',
    status: 'RESOLVED_CONVENTIONAL',
    isUnresolved: false,
    incidentYear: '2024-2025',
    geographicRegion: 'Continental US & Global Airspace',
    reportingAgency: 'Federal Aviation Administration (FAA) & Commercial Airline Pilots',
    sensorSystem: 'Cockpit Pilot Visual, Night Vision Goggles (NVG), Commercial ADS-B',
    resolutionCategory: 'AIRCRAFT_STARLINK',
    officialVerdict: 'Resolved via 3D orbital modeling: Specular solar reflection from Starlink & OneWeb constellations.',
    officialSummary: 'Pilots reported racetrack formation lights, pulsing white anomalies, or dancing crafts at FL360+. AARO developed 3D orbital photometric simulation matching exact satellite solar panel angles to observer sightlines.',
    physicsDeconfliction: {
      mechanism: 'Specular Sunlight Flare Geometry from Satellite Chassis & Solar Arrays',
      apparentIllusion: 'Satellites 500 km overhead reflect blinding sunbursts toward dark aircraft at dusk/night, appearing as low-altitude maneuvering craft.',
      groundTruth: 'Ephemeris vector matching with NORAD Space-Track database confirms exact orbital pass times.'
    },
    dtcCode: 'P0505: Deconflicted Low-Earth Orbit Satellite Specular Reflection',
    confidence: 'HIGH',
    tags: ['starlink specular', 'satellite glint', 'racetrack lights', 'leoflares']
  },
  {
    caseId: 'AARO-ORNL-SPECIMEN',
    title: 'Materials Testing of Magnesium-Zinc-Bismuth Specimen (Oak Ridge National Lab, 2024)',
    url: 'https://www.aaro.mil/UAP-Records/',
    status: 'RESOLVED_CONVENTIONAL',
    isUnresolved: false,
    incidentYear: '2024',
    geographicRegion: 'Oak Ridge National Laboratory (ORNL), Tennessee',
    reportingAgency: 'AARO / Oak Ridge National Laboratory (DoD Contracted)',
    sensorSystem: 'Secondary Ion Mass Spectrometry (SIMS), SEM-EDS, X-Ray Diffraction (XRD)',
    resolutionCategory: 'METALLURGICAL_SPECIMEN',
    officialVerdict: 'Assessed to be of terrestrial origin; inconsistent with extraterrestrial artifact or terahertz antigravity waveguide.',
    officialSummary: 'A metallic magnesium alloy specimen alleged to be recovered from a 1947 crashed extraterrestrial vehicle and capable of functioning as a terahertz antigravity waveguide was evaluated by ORNL. Isotopic ratios of Mg and Pb fall within expected terrestrial standards; intermixed bismuth/lead banding precludes theoretical terahertz waveguide functionality. Concluded to be a mid-20th-century experimental aerospace alloy test piece.',
    physicsDeconfliction: {
      mechanism: 'Terrestrial Metallurgical Manufacturing & Standard Isotopic Ratios',
      apparentIllusion: 'Layered bismuth-magnesium morphology claimed to be an exotic terahertz antigravity waveguide.',
      groundTruth: 'Isotopic ratios match terrestrial mass standards; columnar grain structure and lead contamination confirm mid-century terrestrial industrial fabrication.'
    },
    dtcCode: 'P0303: Terrestrial Metallurgical Manufacturing Byproduct / Experimental Alloy',
    confidence: 'HIGH',
    tags: ['oak ridge', 'ornl', 'magnesium specimen', 'bismuth', 'terahertz waveguide', 'arts parts']
  }
];

/**
 * Authoritative Digest of AARO Scientific Information Papers: https://www.aaro.mil/UAP-Records/
 */
export const AARO_INFORMATION_PAPERS: AaroInformationPaper[] = [
  {
    id: 'paper-ornl-materials-testing',
    title: 'Materials Testing of a Magnesium-Zinc-Bismuth Alloy Specimen (ORNL Summary of Findings)',
    publicationDate: 'April 2024',
    authoringBody: 'Oak Ridge National Laboratory (ORNL) & DoD AARO',
    keyPrinciple: 'Isotopic Mass Spectrometry & Microstructural Waveguide Deconfliction',
    summary: 'Comprehensive scientific evaluation of a metallic specimen alleged to be an off-world component recovered from a 1947 crash and capable of terahertz waveguide antigravity propulsion.',
    methodology: 'Secondary Ion Mass Spectrometry (SIMS) for Mg and Pb isotopic ratios, Scanning Electron Microscopy (SEM), Energy-Dispersive X-ray Spectroscopy (EDS), and X-Ray Diffraction (XRD).',
    applicationToUap: 'Concluded the specimen is terrestrial in origin (isotopic ratios match standard terrestrial kinetic fractionation). Columnar magnesium grain boundaries and intermixed lead banding preclude theoretical terahertz waveguide capabilities. Establishes empirical standards for analyzing physical material claims.',
    resolutionMetric: 'Extraordinary physical claims require verifiable non-terrestrial isotopic deviations (>3σ from terrestrial baseline) and reproducible anomalous electromagnetic/gravitational properties.',
    url: 'https://www.aaro.mil/UAP-Records/'
  },
  {
    id: 'paper-starlink-flaring',
    title: 'Correlations of Starlink Satellite Flaring with UAP Observations',
    publicationDate: '2024',
    authoringBody: 'All-domain Anomaly Resolution Office (AARO)',
    keyPrinciple: 'Photometric Specular Glint Modeling & Low-Earth Orbit Geometry',
    summary: 'Photometric analysis of satellite flaring (specular solar reflection off flat satellite chassis and solar panels, particularly Starlink and OneWeb constellations).',
    methodology: '3D ray-tracing simulations matching observer sightlines (FL360+ airline cockpits) and solar depression angles 45–90 minutes after sunset against NORAD Two-Line Element (TLE) ephemeris.',
    applicationToUap: 'Explains why commercial and military pilots at high altitude observe pulsing white lights or racetrack formations. Provides a mathematical method for observers to correlate sightings with satellite passes.',
    resolutionMetric: 'Correlate sighting azimuth, elevation, and UTC timestamp against NORAD Space-Track satellite orbital passes before considering non-conventional kinematics.',
    url: 'https://www.aaro.mil/UAP-Records/'
  },
  {
    id: 'paper-parallax',
    title: 'Effects of Forced Perspective & Optical Parallax in UAP Encounters',
    publicationDate: '2023',
    authoringBody: 'DoD AARO & National Defense Science Partners',
    keyPrinciple: 'Size-Distance Ambiguity & Moving Sensor Trigonometry',
    summary: 'Mathematical formulation of optical parallax and forced perspective in airborne electro-optical and forward-looking infrared (FLIR) systems.',
    methodology: 'Vector subtraction of sensor aircraft velocity (150–250 knots) from camera line-of-sight angular tracking rate against stationary or wind-drifting targets.',
    applicationToUap: 'Proves that slow-moving objects (birds, balloons, small drones) observed from moving military platforms appear to streak across background terrain at multi-Mach speeds due to 2D camera projection limitations.',
    resolutionMetric: 'Always compute platform vector, camera depression angle, focal length, and target slant range before calculating velocity.',
    url: 'https://www.aaro.mil/UAP-Records/'
  },
  {
    id: 'paper-thermal-infrared',
    title: 'Thermal Bloom & Emissivity Characteristics in Airborne FLIR Sensors',
    publicationDate: '2023',
    authoringBody: 'DoD AARO Infrared Sensor Calibration Directorate',
    keyPrinciple: 'Infrared Point-Spread Function & Biological Thermal Dissipation',
    summary: 'Analysis of mid-wave (MWIR 3–5 μm) and long-wave (LWIR 8–14 μm) sensor point-spread function (PSF) blooming and radiant emissivity.',
    methodology: 'Radiometric thermal calibration across airborne InSb and MCT focal plane arrays.',
    applicationToUap: 'Warm biological bodies (~40°C) bloom beyond their physical geometric boundaries in thermal IR. For birds in flight, the core heat signature blooms over thin feather structures, masking wing flapping and creating the illusion of a solid thermal orb.',
    resolutionMetric: 'Thermal bloom must not be interpreted as a solid metallic hull without multi-spectral optical confirmation.',
    url: 'https://www.aaro.mil/UAP-Records/'
  },
  {
    id: 'paper-narrative-nlp-taxonomy',
    title: 'UAP Narrative Reports & Natural Language Processing Taxonomy Workshop',
    publicationDate: '2024',
    authoringBody: 'AARO, NASA, Academic & Intelligence Interagency Partners',
    keyPrinciple: 'Standardized Lexicon, Data Normalization & Observer Cognitive Bias Mitigation',
    summary: 'Interagency scientific framework addressing the challenge of processing thousands of unstructured civilian, commercial, and military UAP narrative reports.',
    methodology: 'Natural language processing (NLP) pipelines, standardized spatial-temporal ontologies, and multi-sensor telemetry cross-correlation.',
    applicationToUap: 'Eliminates ambiguities caused by disparate reporting jargon (e.g. "tic-tac", "cigar", "orb") by categorizing observations into objective kinematic, morphological, and spectral parameters.',
    resolutionMetric: 'Every report must be broken down into discrete observable vectors, environmental metrics, and multi-sensor corroboration levels.',
    url: 'https://www.aaro.mil/UAP-Records/'
  },
  {
    id: 'paper-historical-record-review',
    title: 'Report on the Historical Record of U.S. Government Involvement with UAP (HRR Vol 1 & 2)',
    publicationDate: 'March 2024 & Updates',
    authoringBody: 'Office of the Under Secretary of Defense for Intelligence and Security (AARO)',
    keyPrinciple: 'Archival Intelligence Audit & Special Access Program (SAP) Investigation',
    summary: 'Exhaustive congressional investigation reviewing official USG records, intelligence files, classified archives, and oral histories spanning 1945 to present regarding alleged covert UAP programs.',
    methodology: 'Unfettered access to all DoD, IC, and NSC Special Access Programs (SAPs); secure interviews with over 30 individuals under Non-Disclosure Agreement (NDA) waivers.',
    applicationToUap: 'Found no empirical evidence that any USG investigation confirmed any UAP represented extraterrestrial technology. Allegations of hidden crash retrieval or reverse-engineering programs were found to be misinterpretations of authentic classified national security defense projects.',
    resolutionMetric: 'Institutional claims of hidden government programs require primary source documentary evidence and verified physical specimens.',
    url: 'https://www.aaro.mil/UAP-Records/'
  },
  {
    id: 'paper-nara-records-collection',
    title: 'National Archives and Records Administration Historical UAP Records Collection (NDAA RG 615)',
    publicationDate: '2024',
    authoringBody: 'National Archives and Records Administration (NARA) & AARO',
    keyPrinciple: 'Statutory Interagency Digital Archiving & Provenance Verification',
    summary: 'Institutional framework established under Sections 1841–1843 of the National Defense Authorization Act (NDAA), creating Record Group 615: The Unidentified Anomalous Phenomena Records Collection.',
    methodology: 'Mandatory automated digital transfer of historical and current UAP-related federal agency documents (DoD, CIA, FBI, NASA, USAF) to the National Archives catalog on a rolling basis.',
    applicationToUap: 'Centralized unredacted historical preservation prevents institutional memory loss and provides researchers with direct access to primary declassified sensor logs and investigative reports.',
    resolutionMetric: 'Historical cases must cross-reference official NARA Record Group 615 catalog numbers for archival authenticity.',
    url: 'https://www.aaro.mil/UAP-Records/'
  },
  {
    id: 'paper-declassification-process',
    title: 'AARO and the Declassification Process: Public Disclosure & Source Protection',
    publicationDate: '2023-2024',
    authoringBody: 'Office of the Director, All-domain Anomaly Resolution Office (AARO)',
    keyPrinciple: 'Security Review, Sensor Masking & Scientific Transparency',
    summary: 'Details how AARO collaborates across the Department of Defense and Intelligence Community to sanitize, review, and declassify military UAP sensor recordings without compromising sensitive national security sensor architectures, capabilities, or operating frequencies.',
    methodology: 'Interagency declassification reviews, removal of sensitive weapon-system symbology while preserving raw optical/infrared telemetry and target kinematic trajectories.',
    applicationToUap: 'Enables release of authentic military FLIR and radar captures (e.g. DVIDS releases PR-013, PR-016) for public scientific scrutiny while safeguarding tactical capabilities.',
    resolutionMetric: 'Ensure public media releases correlate with authenticated DoD declassification markings and case resolution records.',
    url: 'https://www.aaro.mil/UAP-Records/'
  },
  {
    id: 'paper-nps-ctx-special-issue',
    title: 'Naval Postgraduate School - CTX Special Issue: Science & Analysis of UAP',
    publicationDate: '2023',
    authoringBody: 'Naval Postgraduate School (NPS) & Academic Collaborators',
    keyPrinciple: 'Multi-Spectral Sensor Calibration & Rigorous Epistemological Frameworks',
    summary: 'Academic defense monograph addressing technical sensor acquisition, atmospheric propagation anomalies, signature management, and standardized observation protocols.',
    methodology: 'Peer-reviewed physical analysis of optical diffraction, radar cross-sections, atmospheric inversion ducts, and electronic signal calibration.',
    applicationToUap: 'Provides mathematical frameworks to distinguish genuine anomalous aerodynamic maneuvers from sensor gimbal artifacts, atmospheric mirages, and anomalous radar propagation (AP).',
    resolutionMetric: 'Sensor telemetry must be calibrated against regional barometric profiles and known electromagnetic propagation ducting.',
    url: 'https://www.aaro.mil/UAP-Records/'
  },
  {
    id: 'paper-advanced-propulsion',
    title: 'State-of-the-Art Technology & Advanced Propulsion Systems Consistent with UAP Observations',
    publicationDate: '2023',
    authoringBody: 'AARO Science & Technology Directorate',
    keyPrinciple: 'Theoretical Physics vs State-of-the-Art Terrestrial Aerospace Benchmarking',
    summary: 'Examines proposed propulsion mechanisms (plasma aerodynamics, magnetohydrodynamics, vacuum engineering, and General Relativity metric manipulation) in comparison to empirical UAP kinematics.',
    methodology: 'Aerospace propulsion thermodynamics, power dissipation requirements for instantaneous acceleration, and theoretical general relativistic metric warp solutions.',
    applicationToUap: 'Formalizes the physical decoupling signature: an authentic metric manipulation craft would decouple from the ambient fluid medium, explaining the observed absence of sonic booms, aerodynamic heating, and water cavitation.',
    resolutionMetric: 'Evaluate targets across both Lens A (terrestrial aerospace limits) and Lens B (localized spacetime metric decoupling).',
    url: 'https://www.aaro.mil/UAP-Records/'
  },
  {
    id: 'paper-reporting-trends-metrics',
    title: 'AARO Reporting Trends, Locational Distribution & Observational Geometries',
    publicationDate: '2023-2025',
    authoringBody: 'All-domain Anomaly Resolution Office (AARO)',
    keyPrinciple: 'Statistical Clustered Analysis & Target Morphology Distribution',
    summary: 'Quantitative census of over 1,600 military and federal agency UAP encounter reports, categorizing altitude bands, geographical operational zones, and morphological profiles.',
    methodology: 'Multivariate statistical clustering across military operating areas, commercial airspace corridors, and maritime ranges.',
    applicationToUap: 'Reveals baseline reporting trends: 62% of targets are reported as spherical or round orbs, altitude predominantly concentrated between 15,000 and 25,000 feet, speeds ranging from stationary hover to Mach 2 without visible propulsion.',
    resolutionMetric: 'Compare individual encounters against AARO aggregate morphological baselines (spheres/orbs vs commercial airframe corridors).',
    url: 'https://www.aaro.mil/UAP-Records/'
  }
];

/**
 * High-precision helper to match an input string (filename, URL, notes) against the AARO records database.
 * Matches specific identifiers (caseId, dvidsId, targeted tags) without generic keyword bleed.
 */
export function matchAaroCase(input: string): AaroCaseRecord | undefined {
  if (!input) return undefined;
  const lower = input.toLowerCase();

  // 1. Direct case ID match (exact caseId like 'pr-013', 'pr-016', 'pr-002', 'pr-012', 'pr-018', 'pr-003', 'pr-005')
  for (const caseRec of AARO_CASE_RECORDS) {
    if (caseRec.caseId && lower.includes(caseRec.caseId.toLowerCase())) {
      return caseRec;
    }
  }

  // 2. Direct DVIDS video ID match (e.g. '992262' for PR-013, '988673' for PR-016)
  for (const caseRec of AARO_CASE_RECORDS) {
    if (caseRec.dvidsId && lower.includes(caseRec.dvidsId)) {
      return caseRec;
    }
  }

  // 3. Specific phrase tag match (e.g. 'unresolved-uap-report', 'resolved-birds', 'arts parts', 'oak ridge')
  for (const caseRec of AARO_CASE_RECORDS) {
    if (caseRec.tags.some((tag) => lower.includes(tag.toLowerCase()))) {
      return caseRec;
    }
  }

  return undefined;
}
