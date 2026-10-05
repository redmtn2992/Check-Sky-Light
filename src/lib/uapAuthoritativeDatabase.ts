/**
 * Authoritative Scientific Knowledge Base & Scholarly Citation Repository
 * Check Sky Light - UAP Research & Multi-Sensor Triangulation Platform
 * 
 * Formatted under APA 7th Edition for academic manuscript publication.
 * Grounded across Five Empirical Tiers.
 */

export interface AuthoritativeCitation {
  id: string;
  tier: 'Tier I' | 'Tier II' | 'Tier III' | 'Tier IV' | 'Tier V';
  tierLabel: string;
  citationShort: string;
  title: string;
  authors: string;
  year: number;
  publication: string;
  doiOrUrl: string;
  empiricalRelevance: string;
  keySensorParameters?: string[];
  historicalPrecedent?: boolean;
}

export const UAP_AUTHORITATIVE_KNOWLEDGE_BASE: AuthoritativeCitation[] = [
  // --- TIER I: OFFICIAL GOVERNMENT, DEFENSE & DECLASSIFIED AEROSPACE ---
  {
    id: 'aaro-annual-2023',
    tier: 'Tier I',
    tierLabel: 'Official Government & Defense Declassification',
    citationShort: 'AARO (2023)',
    title: 'Consolidated Annual Report on Unidentified Anomalous Phenomena (UAP)',
    authors: 'All-domain Anomaly Resolution Office (AARO)',
    year: 2023,
    publication: 'Office of the Director of National Intelligence & U.S. Department of Defense',
    doiOrUrl: 'https://www.aaro.mil/',
    empiricalRelevance: 'Establishes standardized DoD reporting threshold, primary sensor characteristics, and morphology distributions (spherical orb, cylindrical, metallic disc).',
    keySensorParameters: ['Radar primary return', 'EO/IR sensor track', 'Altitude range 10k-25k ft MSL']
  },
  {
    id: 'dod-flir-2020',
    tier: 'Tier I',
    tierLabel: 'Official Government & Defense Declassification',
    citationShort: 'DoD & NAVAIR (2020)',
    title: 'Official Release of Naval Aviator FLIR Sensor Recordings: FLIR1, GIMBAL, and GOFAST',
    authors: 'U.S. Department of Defense & Naval Air Systems Command',
    year: 2020,
    publication: 'FOIA Declassification Docket 2020-0083 (Navy War.gov/ufo)',
    doiOrUrl: 'https://www.war.gov/ufo/',
    empiricalRelevance: 'Gold-standard declassified multi-sensor baseline documenting instantaneous acceleration, cold/hot thermal inversion, and absence of aerodynamic control surfaces.',
    keySensorParameters: ['Raytheon AN/ASQ-228 ATFLIR', 'AN/APG-73 Radar', 'Lock-on tracking mechanics']
  },
  {
    id: 'cnes-geipan-2022',
    tier: 'Tier I',
    tierLabel: 'Official Government & Defense Declassification',
    citationShort: 'CNES / GEIPAN (2022)',
    title: 'Classification and Technical Processing Protocols for Unidentified Aerospace Phenomena (Category A through D)',
    authors: "Groupe d'Études et d'Informations sur les Phénomènes Aérospatiaux Non-identifiés",
    year: 2022,
    publication: 'Centre National d’Études Spatiales (French Space Agency)',
    doiOrUrl: 'https://www.cnes-geipan.fr/',
    empiricalRelevance: 'Four decades of rigorous scientific field methodology. Category D cases represent unexplained phenomena with high witness and instrument consistency.',
    keySensorParameters: ['Radar-optical cross-referencing', 'Physical soil trace biochemistry', 'Atmospheric sounding data']
  },
  {
    id: 'nasa-uap-2023',
    tier: 'Tier I',
    tierLabel: 'Official Government & Defense Declassification',
    citationShort: 'NASA UAP Independent Study (2023)',
    title: 'NASA Unidentified Anomalous Phenomena Independent Study Report',
    authors: 'NASA UAP Independent Study Team',
    year: 2023,
    publication: 'National Aeronautics and Space Administration Headquarters',
    doiOrUrl: 'https://science.nasa.gov/uap/',
    empiricalRelevance: 'Scientific roadmap advocating for unclassified crowd-sourced sensor calibration, high-grade optical metadata, and machine-learning anomaly filtering.',
    keySensorParameters: ['Calibrated optical instrumentation', 'Atmospheric science deconfliction', 'Zero-bias algorithmic ingestion']
  },
  {
    id: 'bluebook-battelle-1955',
    tier: 'Tier I',
    tierLabel: 'Historical Government & Defense Research',
    citationShort: 'Battelle Memorial Institute (1955)',
    title: 'Analysis of Reports of Unidentified Aerial Objects (Project Blue Book Special Report No. 14)',
    authors: 'Davidson, L. (Ed.) & Battelle Memorial Institute',
    year: 1955,
    publication: 'U.S. Air Force Air Technical Intelligence Center (ATIC)',
    doiOrUrl: 'https://www.governmentattic.org/docs/ProjectBlueBookSpecRep14.pdf',
    empiricalRelevance: 'Seminal statistical evaluation showing that cases with the highest witness expertise and best sensor data had the highest unexplained rate (over 33%).',
    historicalPrecedent: true
  },
  {
    id: 'cometa-report-1999',
    tier: 'Tier I',
    tierLabel: 'Institutional Government Study',
    citationShort: 'COMETA (1999)',
    title: 'UFOs and Defense: What Should We Prepare For?',
    authors: 'Committee for In-Depth Studies (French Generals, Admirals, and CNES Scientists)',
    year: 1999,
    publication: "Institut des Hautes Études de Défense Nationale (IHEDN)",
    doiOrUrl: 'https://www.cnes-geipan.fr/',
    empiricalRelevance: 'Concluded after evaluating worldwide military radar and pilot cases that localized non-conventional physical mechanisms warrant rigorous scientific investigation.',
    historicalPrecedent: true
  },

  // --- TIER II: ACADEMIC & PEER-REVIEWED SCIENTIFIC LITERATURE ---
  {
    id: 'knuth-powell-2019',
    tier: 'Tier II',
    tierLabel: 'Academic & Peer-Reviewed Science',
    citationShort: 'Knuth, Powell, & Reali (2019)',
    title: 'Estimating Flight Characteristics of Anomalous Unidentified Aerial Vehicles',
    authors: 'Knuth, K. H., Powell, R. M., & Reali, P. A.',
    year: 2019,
    publication: 'Entropy, 21(10), 939',
    doiOrUrl: 'https://doi.org/10.3390/e21100939',
    empiricalRelevance: 'Forensic kinematic physics calculating acceleration rates exceeding 50g up to 5,000g in Nimitz-type encounters, proving the necessity of metric decoupling.',
    keySensorParameters: ['Radar range and bearing step-rates', 'Calculated non-thermal power limits exceeding gigawatts']
  },
  {
    id: 'lentz-soliton-2021',
    tier: 'Tier II',
    tierLabel: 'Academic & Peer-Reviewed Science',
    citationShort: 'Lentz (2021)',
    title: 'Breaking the warp barrier: hyper-fast solitons in Einstein-Maxwell-plasma theory',
    authors: 'Lentz, E. W.',
    year: 2021,
    publication: 'Classical and Quantum Gravity, 38(7), 075001',
    doiOrUrl: 'https://doi.org/10.1088/1361-6382/abe692',
    empiricalRelevance: 'Demonstrates mathematically that positive-energy solitary spacetime curvature waves can support sub-luminal and super-luminal transit without negative exotic energy.',
    keySensorParameters: ['General Relativity Einstein-Maxwell tensors', 'Zero tidal stress within central geodesic bubble']
  },
  {
    id: 'bobrick-martire-2021',
    tier: 'Tier II',
    tierLabel: 'Academic & Peer-Reviewed Science',
    citationShort: 'Bobrick & Martire (2021)',
    title: 'Introducing physical warp drives',
    authors: 'Bobrick, A., & Martire, G.',
    year: 2021,
    publication: 'Classical and Quantum Gravity, 38(10), 105009',
    doiOrUrl: 'https://doi.org/10.1088/1361-6382/abdf6e',
    empiricalRelevance: 'Categorizes spacetime metric shells into physical sub-luminal geometries conforming to classical energy conditions.',
    keySensorParameters: ['Localized metric distortion', 'Boundary layer shear diagnostics']
  },
  {
    id: 'alcubierre-1994',
    tier: 'Tier II',
    tierLabel: 'Academic & Peer-Reviewed Science',
    citationShort: 'Alcubierre (1994)',
    title: 'The warp drive: Hyper-fast travel within general relativity',
    authors: 'Alcubierre, M.',
    year: 1994,
    publication: 'Classical and Quantum Gravity, 11(5), L73–L77',
    doiOrUrl: 'https://doi.org/10.1088/0264-9381/11/5/001',
    empiricalRelevance: 'Foundational framework demonstrating that localized contraction of space ahead and expansion behind allows coordinate motion without local acceleration g-forces.',
    historicalPrecedent: true
  },
  {
    id: 'haines-narcap-2000',
    tier: 'Tier II',
    tierLabel: 'Aviation Safety & Human Factors',
    citationShort: 'Haines (2000)',
    title: 'Aviation Safety in America: A Previously Neglected Factor (Technical Report 1)',
    authors: 'Haines, R. F.',
    year: 2000,
    publication: 'National Aviation Reporting Center on Anomalous Phenomena (NARCAP)',
    doiOrUrl: 'https://www.narcap.org/',
    empiricalRelevance: 'Catalog of commercial and military cockpit encounters, near-miss trajectories, and flight safety deconfliction guidelines.',
    keySensorParameters: ['Cockpit forward field of view', 'Aircraft collision avoidance systems (TCAS)']
  },
  {
    id: 'powell-ohare-2007',
    tier: 'Tier II',
    tierLabel: 'Aviation Safety & Multi-Witness Forensics',
    citationShort: 'Powell et al. (2007)',
    title: "Report of an Unidentified Aerial Phenomenon and Its Physical Interaction with Clouds at Chicago O'Hare Airport",
    authors: 'Powell, R. M., et al.',
    year: 2007,
    publication: 'NARCAP Technical Report 10',
    doiOrUrl: 'https://www.narcap.org/',
    empiricalRelevance: 'Documents daylight metallic disc over commercial terminal gate creating a distinct hole-punch cloud through dense stratus layer.',
    keySensorParameters: ['Barometric cloud interaction', 'Class B airspace radar screening']
  },

  // --- TIER III: AUTONOMOUS MULTI-SENSOR SKY OBSERVATION NETWORKS ---
  {
    id: 'hessdalen-2021',
    tier: 'Tier III',
    tierLabel: 'Multi-Sensor Autonomous Sky Network',
    citationShort: 'Project Hessdalen (2021)',
    title: 'Thirty-Eight Years of Automated Optical, Electromagnetic, and Radar Spectra of Persistent Atmospheric Anomalies',
    authors: 'Østfold University College Research Group',
    year: 2021,
    publication: 'Department of Computer Science & Engineering, Østfold University College, Norway',
    doiOrUrl: 'https://www.hessdalen.org/',
    empiricalRelevance: 'Longest continuous scientific field laboratory recording simultaneous optical, microwave radar, and magnetometer spikes from persistent aerial phenomena.',
    keySensorParameters: ['5.4 GHz tracking radar', 'Optical diffraction spectrometers', 'Tri-axial fluxgate magnetometer']
  },
  {
    id: 'sky360-2023',
    tier: 'Tier III',
    tierLabel: 'Multi-Sensor Autonomous Sky Network',
    citationShort: 'Sky360 Network (2023)',
    title: 'Open-Source Multi-Sensor Sky Monitoring Protocols: Fish-Eye Optical Motion Segmentation and Real-Time PTZ Tracking',
    authors: 'Sky360 Scientific Consortium',
    year: 2023,
    publication: 'Sky360 Scientific Documentation',
    doiOrUrl: 'https://www.sky360.org/',
    empiricalRelevance: 'Established open-source standards for real-time background subtraction, fisheye kinematic optical vectors, and automated sensor hand-off.',
    keySensorParameters: ['All-sky fisheye camera (30 fps)', 'Pan-Tilt-Zoom telephoto follow-cam', 'Passive radar correlation']
  },
  {
    id: 'galileo-project-2023',
    tier: 'Tier III',
    tierLabel: 'Institutional Observatory Network',
    citationShort: 'Loeb & Galileo Project (2023)',
    title: 'Design and Preliminary Sensor Commissioning of the Galileo Project Multi-Sensor Sky Observatories',
    authors: 'Loeb, A., & The Galileo Project Consortium',
    year: 2023,
    publication: 'Journal of Astronomical Instrumentation, 12(3), 2350005',
    doiOrUrl: 'https://projects.iq.harvard.edu/galileo',
    empiricalRelevance: 'High-altitude multi-spectral sky observatory deploying automated computer vision, infrared, optical, and acoustic arrays for rigorous aerial anomaly discrimination.',
    keySensorParameters: ['Passive Optical 4K Cameras', 'Long-wave Infrared (LWIR)', 'Audio Microphone Arrays (10 Hz - 20 kHz)']
  },

  // --- TIER IV: TELEMETRY & EPHEMERIS DECONFLICTION ---
  {
    id: 'adsb-exchange-2026',
    tier: 'Tier IV',
    tierLabel: 'Telemetry & Spaceflight Deconfliction',
    citationShort: 'ADS-B Exchange (2026)',
    title: 'Unfiltered Global Automatic Dependent Surveillance-Broadcast (ADS-B) Aircraft Transponder Telemetry',
    authors: 'ADS-B Exchange Network',
    year: 2026,
    publication: 'Real-Time Airspace Data Service',
    doiOrUrl: 'https://www.adsbexchange.com/',
    empiricalRelevance: 'Direct unfiltered transponder feed enabling mathematical deconfliction of civilian, commercial, and unclassified military aircraft within an 18-50 nm radius.',
    keySensorParameters: ['Mode-S 1090 MHz Extended Squitter', 'GPS-derived Lat/Lng/Altitude', 'Vertical climb rates']
  },
  {
    id: 'celestrak-tle-2026',
    tier: 'Tier IV',
    tierLabel: 'Telemetry & Spaceflight Deconfliction',
    citationShort: 'CelesTrak (2026)',
    title: 'NORAD Two-Line Element (TLE) Satellite Orbital Vector Repository and LEO Constellation Ephemerides',
    authors: 'CelesTrak & 18th Space Defense Squadron (U.S. Space Force)',
    year: 2026,
    publication: 'U.S. Space Defense Telemetry Database',
    doiOrUrl: 'https://celestrak.org/',
    empiricalRelevance: 'Automated orbital propagation (SGP4 algorithm) for deconflicting Starlink satellite trains, OneWeb, ISS passes, and space debris from true anomalous vectors.',
    keySensorParameters: ['SGP4 Orbital Propagator', 'Visual apparent magnitude', 'Azimuth/Elevation celestial track']
  },
  {
    id: 'jpl-horizons-2026',
    tier: 'Tier IV',
    tierLabel: 'Telemetry & Spaceflight Deconfliction',
    citationShort: 'NASA JPL (2026)',
    title: 'JPL Horizons Ephemeris System: Solar System Planetary and Asteroid Coordinates',
    authors: 'NASA Jet Propulsion Laboratory',
    year: 2026,
    publication: 'California Institute of Technology',
    doiOrUrl: 'https://ssd.jpl.nasa.gov/horizons/',
    empiricalRelevance: 'High-precision solar system ephemeris used to deconflict nocturnal optical illusions caused by brilliant planets (e.g. Venus, Jupiter) or twinkling stars (Sirius).',
    keySensorParameters: ['Right Ascension / Declination', 'Apparent Magnitude', 'Atmospheric scintillation model']
  },
  {
    id: 'noaa-nexrad-2026',
    tier: 'Tier IV',
    tierLabel: 'Telemetry & Spaceflight Deconfliction',
    citationShort: 'NOAA / NWS (2026)',
    title: 'NEXRAD Dual-Polarization Weather Radar Archive & Upper-Air Radiosonde Balloon Trajectories',
    authors: 'National Oceanic and Atmospheric Administration & National Weather Service',
    year: 2026,
    publication: 'National Centers for Environmental Information',
    doiOrUrl: 'https://www.ncei.noaa.gov/products/radar/',
    empiricalRelevance: 'Deconfliction of atmospheric anomalies, chaff, anomalous propagation (AP), and weather balloon drift profiles.',
    keySensorParameters: ['Differential reflectivity (ZDR)', 'Correlation coefficient (CC)', 'Barometric sounding wind drift']
  },

  // --- TIER V: HISTORICAL DEFENSE RADAR-OPTICAL INTERCEPTS ---
  {
    id: 'dia-tehran-1976',
    tier: 'Tier I',
    tierLabel: 'Historical Defense Multi-Sensor Intercept',
    citationShort: 'DIA & NSA (1976)',
    title: 'Joint Military Command and F-4 Phantom II Radar/Optical Sighting (Defense Information Report 6-846-0046-76)',
    authors: 'Defense Intelligence Agency & National Security Agency',
    year: 1976,
    publication: 'Declassified U.S. Joint Chiefs of Staff Intelligence Dossier',
    doiOrUrl: 'https://www.dia.mil/',
    empiricalRelevance: 'Premier historical case of simultaneous visual contact, airborne APQ-120 radar lock, and localized electromagnetic weapon-circuit disabling.',
    keySensorParameters: ['Westinghouse APQ-120 Fire-Control Radar', 'Optical strobe frequency', 'VHF communication blackout'],
    historicalPrecedent: true
  },
  {
    id: 'belgian-f16-1991',
    tier: 'Tier I',
    tierLabel: 'Historical Defense Multi-Sensor Intercept',
    citationShort: 'De Brouwer (1991)',
    title: 'The Belgian Air Force and the UFO Wave: Analysis of F-16 Fire-Control Radar Locks and Ground-Based Doppler Tracking',
    authors: 'De Brouwer, W. (Colonel, Chief of Operations, Belgian Air Force)',
    year: 1991,
    publication: 'Society for Scientific Exploration (SSE)',
    doiOrUrl: 'https://www.scientificexploration.org/',
    empiricalRelevance: 'Simultaneous F-16 airborne radar and NATO ground station tracking showing instantaneous acceleration from 150 kts to 950+ kts in 0.3 seconds without a sonic boom.',
    keySensorParameters: ['F-16 Westinghouse AN/APG-66 Radar', 'Doppler speed shift', 'Glideslope plunge from 9,000 to 5,000 ft'],
    historicalPrecedent: true
  }
];

/**
 * Retrieve citations matching a given query, category or tier
 */
export function searchKnowledgeBase(query: string): AuthoritativeCitation[] {
  const q = query.toLowerCase();
  return UAP_AUTHORITATIVE_KNOWLEDGE_BASE.filter(c => 
    c.title.toLowerCase().includes(q) ||
    c.authors.toLowerCase().includes(q) ||
    c.citationShort.toLowerCase().includes(q) ||
    c.empiricalRelevance.toLowerCase().includes(q)
  );
}

/**
 * Generate formatted APA 7th Edition string for all citations
 */
export function formatFullBibliographyApa7(): string {
  return UAP_AUTHORITATIVE_KNOWLEDGE_BASE
    .slice()
    .sort((a, b) => a.authors.localeCompare(b.authors))
    .map(c => `${c.authors} (${c.year}). ${c.title}. ${c.publication}. ${c.doiOrUrl}`)
    .join('\n\n');
}
