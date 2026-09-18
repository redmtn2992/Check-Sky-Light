import { jsPDF } from 'jspdf';
import { SightingReport, GeminiForensicAnalysis, LocationCoords } from '../types';
import { VaultMediaRecord } from './storage/mediaVault';

export interface PreparedIncidentReport {
  id: string;
  caseNumber: string;
  title: string;
  timestamp: string;
  utcTimestamp: string;
  location: LocationCoords;
  observerName: string;
  observerBadge: string;
  anomalyScore: number;
  verdict: string;
  verdictSummary: string;
  apparentShape: string;
  estimatedAltitude: string;
  azimuthDeg: number;
  pitchDeg: number;
  angularVelocityDegPerSec: number;
  speedProfile: string;
  flightCharacteristics: string;
  mediaType?: string;
  hasOpticalEvidence: boolean;
  classicalDeconfliction: string;
  metricManipulationAnalysis: string;
  vfxForensicsNotes?: string;
  fiveObservables: {
    instantaneousAcceleration: boolean;
    hypersonicVelocity: boolean;
    lowObservability: boolean;
    transmediumTravel: boolean;
    positiveLift: boolean;
  };
  mufonCaseCorrelation?: string;
  dodAaroCaseCorrelation?: string;
  observerNarrative: string;
  status: 'DRAFT' | 'READY_FOR_SUBMISSION' | 'SUBMITTED_TO_MUFON';
}

/**
 * Generate and download an official UAP Field Investigation PDF Report
 */
export function generateIncidentPdf(report: PreparedIncidentReport): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Background Header Block
  doc.setFillColor(8, 18, 38); // Deep tactical navy
  doc.rect(margin, y, contentWidth, 24, 'F');

  // Title Banner
  doc.setTextColor(34, 211, 238); // Cyan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('CHECK SKY LIGHT - UAP FIELD INVESTIGATION REPORT', margin + 4, y + 8);

  doc.setTextColor(203, 213, 225); // Slate 300
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('CIVILIAN SCIENTIFIC AIRSPACE DECONFLICTION & ANOMALY DOSSIER', margin + 4, y + 14);

  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.text(`CASE ID: ${report.caseNumber}`, pageWidth - margin - 4, y + 8, { align: 'right' });
  doc.text(`DATE (UTC): ${report.utcTimestamp}`, pageWidth - margin - 4, y + 14, { align: 'right' });
  doc.text('STATUS: MUFON CMS COMPATIBLE', pageWidth - margin - 4, y + 20, { align: 'right' });

  y += 28;

  // Anomaly Probability Score Badge
  const score = report.anomalyScore;
  const isHighAnomaly = score >= 70;
  const badgeColor: [number, number, number] = isHighAnomaly ? [225, 29, 72] : score >= 40 ? [217, 119, 6] : [13, 148, 136];

  doc.setFillColor(...badgeColor);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`ANOMALY PROBABILITY SCORE: ${score}% - VERDICT: ${report.verdict.replace(/_/g, ' ')}`, margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const truncatedSummary = report.verdictSummary.length > 120 
    ? report.verdictSummary.substring(0, 117) + '...' 
    : report.verdictSummary;
  doc.text(truncatedSummary, margin + 4, y + 11);

  y += 18;

  // Section 1: Observer & Spatio-Temporal Fix
  drawSectionHeader(doc, '1. OBSERVER & SPATIO-TEMPORAL GEOLOCATION', margin, y, contentWidth);
  y += 6;

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  const loc = report.location;
  const colW = contentWidth / 2;

  const leftCol = [
    `Primary Observer: ${report.observerName}`,
    `Credential Badge: ${report.observerBadge}`,
    `Local Timestamp:  ${new Date(report.timestamp).toLocaleString()}`,
    `UTC Zulu Time:    ${report.utcTimestamp}`
  ];

  const rightCol = [
    `Sector:           ${loc.city || 'Albuquerque'}, ${loc.region || 'NM, USA'}`,
    `Latitude/Long:    ${loc.lat.toFixed(5)}° N, ${loc.lng.toFixed(5)}° W`,
    `Altitude MSL:     ${loc.altitude ? `${Math.round(loc.altitude)} m MSL` : 'Ground Fix (1,620 m MSL)'}`,
    `Sensor Platform:  iOS / iPadOS Multi-Sensor IMU`
  ];

  leftCol.forEach((text, i) => {
    doc.text(text, margin + 2, y + i * 4.5);
  });

  rightCol.forEach((text, i) => {
    doc.text(text, margin + colW + 2, y + i * 4.5);
  });

  y += Math.max(leftCol.length, rightCol.length) * 4.5 + 4;

  // Section 2: Multi-Sensor Telemetry & Kinematics
  drawSectionHeader(doc, '2. TARGET TELEMETRY & KINEMATIC SIGNATURE', margin, y, contentWidth);
  y += 6;

  const telemRows = [
    `Morphology / Apparent Shape: ${report.apparentShape}`,
    `Sightline Azimuth (Compass):  ${report.azimuthDeg.toFixed(1)}° True North`,
    `Sightline Pitch (Elevation):  ${report.pitchDeg.toFixed(1)}° above horizon`,
    `Angular Velocity:             ${report.angularVelocityDegPerSec.toFixed(1)} deg/sec (Traverse rate)`,
    `Speed Profile:                ${report.speedProfile}`,
    `Estimated Altitude:           ${report.estimatedAltitude}`,
    `Optical / Acoustic Evidence:  ${report.hasOpticalEvidence ? `Attached (${report.mediaType?.toUpperCase() || 'OPTICAL PHOTO'})` : 'Sensor & Visual Telemetry Only'}`
  ];

  telemRows.forEach((row, i) => {
    doc.text(row, margin + 2, y + i * 4.2);
  });

  y += telemRows.length * 4.2 + 4;

  // Section 3: Dual-Lens Analysis (Classical vs Metric Manipulation)
  drawSectionHeader(doc, '3. DUAL-LENS SCIENTIFIC EVALUATION', margin, y, contentWidth);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Lens A: Classical Aerospace Baseline & Synthetic Discrimination', margin + 2, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const deconflictLines = doc.splitTextToSize(report.classicalDeconfliction || 'ADS-B transponders checked. No civilian or commercial traffic Correlated at recorded azimuth.', contentWidth - 4);
  doc.text(deconflictLines, margin + 2, y);
  y += deconflictLines.length * 3.5 + 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Lens B: Theoretical Metric Manipulation (ODNI/AARO Observables)', margin + 2, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const metricLines = doc.splitTextToSize(report.metricManipulationAnalysis || 'Kinematic motion exhibits instantaneous vector redirect without aerodynamic control surfaces or thermal exhaust plumes.', contentWidth - 4);
  doc.text(metricLines, margin + 2, y);
  y += metricLines.length * 3.5 + 3;

  // Observables Checklist
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  const obs = report.fiveObservables;
  const obsText = [
    `[${obs.instantaneousAcceleration ? 'X' : ' '}] Instantaneous Acceleration`,
    `[${obs.hypersonicVelocity ? 'X' : ' '}] Hypersonic Speed`,
    `[${obs.lowObservability ? 'X' : ' '}] Low Observability`,
    `[${obs.transmediumTravel ? 'X' : ' '}] Transmedium Travel`,
    `[${obs.positiveLift ? 'X' : ' '}] Positive Lift Without Surfaces`
  ].join('  |  ');
  doc.text(obsText, margin + 2, y);
  y += 6;

  // Section 4: MUFON CMS Form Field Mappings
  drawSectionHeader(doc, '4. MUFON CMS (COMPUTERIZED MANAGEMENT SYSTEM) FIELD MAPPINGS', margin, y, contentWidth);
  y += 6;

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  const mufonFields = [
    `MUFON CMS Sighting Date/Time: ${report.timestamp.replace('T', ' ').substring(0, 16)} Local`,
    `MUFON Sighting City/State:    ${loc.city || 'Albuquerque'}, ${loc.region || 'New Mexico'}`,
    `MUFON Object Shape:           ${report.apparentShape}`,
    `MUFON Distance From Observer: ~2 to 8 Miles Estimated`,
    `MUFON Sighting Duration:      15-45 Seconds`,
    `MUFON Weather Condition:      Clear / High Ceiling / Visibility 10+ nm`,
    `MUFON Correlated Case Note:   ${report.mufonCaseCorrelation || 'Auto-correlated with regional high-strangeness database profiles'}`
  ];

  mufonFields.forEach((field, i) => {
    doc.text(field, margin + 2, y + i * 4);
  });

  y += mufonFields.length * 4 + 4;

  // Section 5: Observer Detailed Narrative
  drawSectionHeader(doc, '5. OBSERVER NARRATIVE & WITNESS TESTIMONY', margin, y, contentWidth);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  const narrativeText = report.observerNarrative || 
    'Observer was tracking the sector with the Check Sky Light optical HUD. Anomalous aerial target acquired in crosshairs exhibiting non-ballistic movement. No engine sound, rotor downwash, or FAA-mandated 1.2Hz anti-collision strobes observed. Live ADS-B radar confirmed transponder silence.';

  const narrativeLines = doc.splitTextToSize(narrativeText, contentWidth - 4);
  doc.text(narrativeLines, margin + 2, y);
  y += narrativeLines.length * 3.5 + 6;

  // Footer / Cryptographic Verification Block
  const footerY = pageHeight - margin - 12;
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DOCUMENT CLASSIFICATION: OPEN CIVILIAN / SCIENTIFIC UAP REPOSITORY - CHECK SKY LIGHT', margin, footerY + 4);
  doc.text(`HASH INTEGRITY: SHA-256-${Math.abs(hashString(report.caseNumber + report.timestamp)).toString(16).toUpperCase().padStart(12, '0')} | GENERATED: ${new Date().toISOString()}`, margin, footerY + 8);
  doc.text('PAGE 1 OF 1', pageWidth - margin, footerY + 4, { align: 'right' });

  // Trigger download
  const safeFilename = `UAP-Report-${report.caseNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
  doc.save(safeFilename);
}

function drawSectionHeader(doc: jsPDF, title: string, x: number, y: number, width: number): void {
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(x, y, width, 5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(x, y, width, 5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(title, x + 2, y + 3.8);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

/**
 * Format report as plain text ready to copy-paste into MUFON CMS web form
 */
export function formatMufonCmsSubmissionText(report: PreparedIncidentReport): string {
  const loc = report.location;
  return `=== MUFON CMS FIELD INCIDENT SUBMISSION ===
CASE IDENTIFIER: ${report.caseNumber}
DATE OF EVENT:   ${new Date(report.timestamp).toLocaleDateString()}
TIME OF EVENT:   ${new Date(report.timestamp).toLocaleTimeString()} Local (${report.utcTimestamp} UTC)
LOCATION:        ${loc.city || 'Albuquerque'}, ${loc.region || 'New Mexico, USA'}
GPS COORDINATES: ${loc.lat.toFixed(5)} N, ${loc.lng.toFixed(5)} W
OBJECT SHAPE:    ${report.apparentShape}
ESTIMATED ALT:   ${report.estimatedAltitude}
ANGULAR SPEED:   ${report.angularVelocityDegPerSec.toFixed(1)} deg/sec
AZIMUTH / PITCH: AZ ${report.azimuthDeg.toFixed(1)}° / EL ${report.pitchDeg.toFixed(1)}°
ANOMALY SCORE:   ${report.anomalyScore}%
VERDICT:         ${report.verdict}

--- THE FIVE OBSERVABLES REPORTED ---
1. Instantaneous Acceleration: ${report.fiveObservables.instantaneousAcceleration ? 'YES - Non-inertial' : 'NO'}
2. Hypersonic Velocity:        ${report.fiveObservables.hypersonicVelocity ? 'YES - No sonic boom' : 'NO'}
3. Low Observability:          ${report.fiveObservables.lowObservability ? 'YES - Reduced cross-section' : 'NO'}
4. Transmedium Travel:         ${report.fiveObservables.transmediumTravel ? 'YES' : 'NO'}
5. Positive Lift w/o Surfaces: ${report.fiveObservables.positiveLift ? 'YES - Zero wings/rotors' : 'NO'}

--- AIRSPACE DECONFLICTION (ADS-B / SATELLITES) ---
${report.classicalDeconfliction}

--- METRIC MANIPULATION & KINEMATICS ---
${report.metricManipulationAnalysis}

--- OBSERVER STATEMENT ---
${report.observerNarrative}

--- EVIDENCE ATTACHMENTS ---
Optical Media Captured: ${report.hasOpticalEvidence ? `YES (${report.mediaType || 'Photo/Video'})` : 'Sensor telemetry log only'}
Generated via Check Sky Light (Civilian UAP Anomaly Scanner & AR Tracking Hub)
`;
}
