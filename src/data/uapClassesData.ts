export interface UapClassDefinition {
  id: string;
  classNumber: number;
  code: string;
  name: string;
  shortName: string;
  iconName: string;
  shapeCategory: string;
  badgeColor: string;
  borderColor: string;
  summary: string;
  description: string;
  kinematics: string[];
  telemetrySignature: string;
  typicalAnomalyScore: number;
  keywordTriggers: string[];
  sampleObservationNote: string;
}

export const THE_NINE_UAP_CLASSES: UapClassDefinition[] = [
  {
    id: 'class-1-orb-sphere',
    classNumber: 1,
    code: 'UAP-C1',
    name: 'Class I: Orb & Sphere',
    shortName: 'Orb / Sphere',
    iconName: 'Circle',
    shapeCategory: 'Spherical / Luminous',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    borderColor: 'border-amber-700/60',
    summary: 'Smooth spherical or orb-like objects exhibiting omnidirectional vector shifts and stationary hovering without aerodynamic control surfaces.',
    description: 'Class I entities are among the most frequently documented aerial phenomena. They appear as luminous spheres or polished metallic globes ranging from 1 to 10 meters in diameter. They operate without sound, thermal plumes, or visible aerodynamic surfaces.',
    kinematics: [
      'Instantaneous multi-directional vector shifts without deceleration inertia',
      'Stationary hovering unaffected by local high-altitude wind shears',
      'Omnidirectional velocity range from 0 to Mach 3+'
    ],
    telemetrySignature: 'Zero 1090MHz ADS-B transponder squawk. Intermittent primary radar echo with high specular reflection.',
    typicalAnomalyScore: 91,
    keywordTriggers: ['orb', 'sphere', 'glowing ball', 'glowing orb', 'luminous sphere'],
    sampleObservationNote: 'Glowing metallic sphere hovering motionless at high altitude, then instantly accelerating sideways with zero sound.'
  },
  {
    id: 'class-2-tictac-capsule',
    classNumber: 2,
    code: 'UAP-C2',
    name: 'Class II: Tic-Tac & Capsule',
    shortName: 'Tic-Tac / Capsule',
    iconName: 'Pill',
    shapeCategory: 'Cylindrical / Smooth',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    borderColor: 'border-cyan-700/60',
    summary: 'Smooth white capsule or elongated cylinder devoid of wings, tail fins, windows, or visible jet engine exhaust.',
    description: 'Popularized by naval aviator encounters (such as the 2004 USS Nimitz engagement), Class II objects display an unblemished matte white or specular metallic exterior without flight surfaces or visible propulsion systems.',
    kinematics: [
      'Hypersonic acceleration from stationary hover in under 100 milliseconds',
      'Instantaneous 90-degree angular turns at multi-Mach speeds',
      'Disturbance of water surface below without thermal shockwave'
    ],
    telemetrySignature: 'Uncorrelated altitude telemetry. Active military radar target jamming/spoofing signature.',
    typicalAnomalyScore: 95,
    keywordTriggers: ['tic-tac', 'tictac', 'capsule', 'cylinder', 'pill shape'],
    sampleObservationNote: 'White smooth Tic-Tac shaped craft hovering near water line, executing instant erratic 90-degree turns without deceleration.'
  },
  {
    id: 'class-3-disc-saucer',
    classNumber: 3,
    code: 'UAP-C3',
    name: 'Class III: Lenticular Disc & Saucer',
    shortName: 'Disc / Saucer',
    iconName: 'Disc',
    shapeCategory: 'Lenticular / Domed',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    borderColor: 'border-emerald-700/60',
    summary: 'Classic circular, lenticular, or domed disc featuring perimeter light arrays or central rotation.',
    description: 'Class III represents the historical lenticular geometry. These objects frequently display metallic hulls, central raised domes, or rotating outer rings equipped with monochromatic or multi-spectral light ports.',
    kinematics: [
      'Forward flight trajectory accompanied by characteristic forward-tilting angle',
      'Localized low-frequency electromagnetic disturbance affecting electronic sensors',
      'Rapid vertical altitude hops (stair-step elevation shifts)'
    ],
    telemetrySignature: 'Substantial primary radar cross-section (RCS) without corresponding civilian flight plan or transponder.',
    typicalAnomalyScore: 89,
    keywordTriggers: ['disc', 'disk', 'saucer', 'flying saucer', 'domed craft'],
    sampleObservationNote: 'Classic domed metallic disc tilting 45 degrees forward as it silent glides across the sky with rotating perimeter amber lights.'
  },
  {
    id: 'class-4-triangle-delta',
    classNumber: 4,
    code: 'UAP-C4',
    name: 'Class IV: Triangular & Delta Craft',
    shortName: 'Triangle / Delta',
    iconName: 'Triangle',
    shapeCategory: 'Triangular / Delta',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    borderColor: 'border-purple-700/60',
    summary: 'Massive dark triangular or delta-wing craft featuring distinct corner lights and a pulsing central red orb.',
    description: 'Class IV encompasses large dark triangular structures (often reported during the Belgian UAP Wave and Hudson Valley sightings). They typically feature three white or amber lights at the vertices and a central pulsing red beacon.',
    kinematics: [
      'Ultra-low speed silent hovering below 1,000 feet without aerodynamic stall',
      'Complete absence of acoustic engine or jet turbine sound',
      'Smooth, deliberate turn radius without bank angle'
    ],
    telemetrySignature: 'Low radar cross-section (stealth geometry) or massive primary return without military flight plan filing.',
    typicalAnomalyScore: 93,
    keywordTriggers: ['triangle', 'triangular', 'delta craft', 'black triangle', 'boomerang'],
    sampleObservationNote: 'Massive silent black triangle with three amber corner lights and a glowing center red light moving slowly at treetop level.'
  },
  {
    id: 'class-5-transmedium',
    classNumber: 5,
    code: 'UAP-C5',
    name: 'Class V: Transmedium & Submersible',
    shortName: 'Transmedium / USO',
    iconName: 'Waves',
    shapeCategory: 'Aquatic-Air / Dual Environment',
    badgeColor: 'bg-blue-950 text-blue-300 border-blue-800',
    borderColor: 'border-blue-700/60',
    summary: 'Anomalous objects observed transitioning seamlessly between air, space, and bodies of water without hydrodynamic splash or shock.',
    description: 'Class V craft demonstrate transmedium travel capability, transitioning from high-altitude air flight into ocean or lake waters without thermal destruction, hydrodynamic splash, or structural deceleration damage.',
    kinematics: [
      'Water entry/exit at Mach 1+ without displacement splash or steam plume',
      'High underwater propulsion velocity exceeding 100+ knots underwater',
      'Zero structural deformation across atmospheric pressure gradients'
    ],
    telemetrySignature: 'Simultaneous airborne radar tracking and acoustic underwater sonar correlation.',
    typicalAnomalyScore: 97,
    keywordTriggers: ['transmedium', 'submerged', 'water entry', 'ocean entry', 'uso'],
    sampleObservationNote: 'Glowing object diving directly into ocean waters at high speed without splash or deceleration, continuing motion underwater.'
  },
  {
    id: 'class-6-swarm-cluster',
    classNumber: 6,
    code: 'UAP-C6',
    name: 'Class VI: Swarm & Multi-Node Cluster',
    shortName: 'Swarm / Cluster',
    iconName: 'Grid',
    shapeCategory: 'Multi-Object / Swarm',
    badgeColor: 'bg-teal-950 text-teal-300 border-teal-800',
    borderColor: 'border-teal-700/60',
    summary: 'Coordinated groupings of multiple sub-units traveling in precise geometric lattices, grid arrays, or dynamic formations.',
    description: 'Class VI consists of multiple discrete light or metallic sub-units (3 to 100+ nodes) moving in synchronized unison. Unlike Starlink satellite trains, swarm clusters execute complex tactical maneuvers and grid reorganizations.',
    kinematics: [
      'Instantaneous formation shifts (V-shape to grid array to circle)',
      'Synchronized acceleration across all swarm nodes without communication latency',
      'Sub-units splitting off from main cluster and returning'
    ],
    telemetrySignature: 'Multiple clustered primary radar returns without FAA flight plan or ADS-B squawks.',
    typicalAnomalyScore: 88,
    keywordTriggers: ['swarm', 'cluster', 'formation', 'grid array', 'multiple lights'],
    sampleObservationNote: 'Cluster of 12 glowing orbs flying in tight V-formation that suddenly rearranged into a rotating grid array.'
  },
  {
    id: 'class-7-plasma-luminous',
    classNumber: 7,
    code: 'UAP-C7',
    name: 'Class VII: Luminous Plasma & Energy Entity',
    shortName: 'Plasma / Luminous',
    iconName: 'Zap',
    shapeCategory: 'High Energy / Plasma',
    badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
    borderColor: 'border-rose-700/60',
    summary: 'High-luminance self-emitting plasma entities displaying intense color shifts, pulsing halos, or fluid energy boundaries.',
    description: 'Class VII covers self-luminous high-energy phenomena without apparent solid physical hulls. They emit intense chromatic radiation across visible and ultraviolet spectrums and can expand, contract, or pulse rapidly.',
    kinematics: [
      'Pulsing luminescence synchronized with electric/magnetic field surges',
      'Physical splitting into smaller daughter energy orbs or re-merging',
      'Non-ballistic floating or dancing flight trajectories'
    ],
    telemetrySignature: 'Strong local radio frequency (RF) noise and localized radar ionization reflections.',
    typicalAnomalyScore: 87,
    keywordTriggers: ['plasma', 'glowing energy', 'fireball', 'pulsing orb', 'luminous entity'],
    sampleObservationNote: 'Bright blue-violet plasma ball floating in night sky that split into two separate pulsing lights before recombining.'
  },
  {
    id: 'class-8-metamorphic',
    classNumber: 8,
    code: 'UAP-C8',
    name: 'Class VIII: Metamorphic & Morphing Structure',
    shortName: 'Metamorphic / Morphing',
    iconName: 'Sparkles',
    shapeCategory: 'Shape-Shifting / Dynamic',
    badgeColor: 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-800',
    borderColor: 'border-fuchsia-700/60',
    summary: 'Dynamic shape-shifting geometry that alters physical outline, optical opacity, or surface structure while airborne.',
    description: 'Class VIII objects alter their physical silhouette during observation — transitioning from a disc into a ring, orb, or complex geometry while maintaining continuous flight trajectory.',
    kinematics: [
      'Continuous morphing of geometric cross-section in active flight',
      'Optical cloaking / opacity shifts from translucent to opaque metallic',
      'Absence of structural stress fractures during morphing'
    ],
    telemetrySignature: 'Fluctuating radar cross-section (RCS) values corresponding to physical geometry shifts.',
    typicalAnomalyScore: 94,
    keywordTriggers: ['morphing', 'shape shifting', 'changing shape', 'metamorphic', 'cloaking'],
    sampleObservationNote: 'Metallic object shifting fluidly between a disc shape and a hollow ring while traveling silently across the sky.'
  },
  {
    id: 'class-9-specular-polyhedral',
    classNumber: 9,
    code: 'UAP-C9',
    name: 'Class IX: Specular Polyhedral Geometry',
    shortName: 'Polyhedral / Cube-Sphere',
    iconName: 'Box',
    shapeCategory: 'Polyhedral / Geometric',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    borderColor: 'border-indigo-700/60',
    summary: 'Highly faceted geometric structures such as cubes enclosed in clear spheres, diamonds, or octahedrons reflecting high optical energy.',
    description: 'Reported frequently by military pilots in designated warning areas (such as the US East Coast sphere-inside-cube reports). These geometric shapes exhibit reflective metallic surfaces or translucent outer envelopes.',
    kinematics: [
      'Stationary high-altitude tether-like station keeping against 50+ knot wind currents',
      'Inverted rotation of inner geometric cube inside outer spherical shell',
      'High-velocity vertical ascents without propulsion plumes'
    ],
    telemetrySignature: 'Strong specular radar reflection coefficient without jet engine thermal exhaust signature.',
    typicalAnomalyScore: 92,
    keywordTriggers: ['cube in sphere', 'polyhedral', 'diamond shape', 'octahedron', 'cube'],
    sampleObservationNote: 'Dark metallic cube enclosed inside a translucent clear sphere hovering stationary directly against high wind currents.'
  }
];
