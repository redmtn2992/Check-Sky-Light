import { AARO_CASE_RECORDS, AARO_INFORMATION_PAPERS, matchAaroCase } from '../data/aaroRecordsData.ts';
import type { AaroCaseRecord } from '../data/aaroRecordsData.ts';
import type { KnownCaseMatch } from './provenance.ts';

/**
 * Deterministic known-case lookup separating identity from scores/verdicts.
 * Text matching only ever returns identity: 'unconfirmed'.
 */
export function lookupKnownCase(input: {
  url?: string;
  mediaHash?: string;
  text: string;
}): KnownCaseMatch | null {
  const urlLower = (input.url || '').toLowerCase();

  // 1. Exact canonical URL or DVIDS asset match -> confirmed
  if (urlLower) {
    const directUrlMatch = AARO_CASE_RECORDS.find(
      (c) => (c.url && urlLower.includes(c.url.toLowerCase())) ||
             (c.dvidsId && urlLower.includes(c.dvidsId.toLowerCase()))
    );
    if (directUrlMatch) {
      return {
        record: directUrlMatch,
        basis: 'canonical_url',
        identity: 'confirmed'
      };
    }
  }

  // 2. Fall back to text matching -> unconfirmed (never sets a score or dictates a verdict)
  const matched = matchAaroCase(input.text);
  if (matched) {
    return {
      record: matched,
      basis: 'official_id_in_text',
      identity: 'unconfirmed'
    };
  }

  return null;
}

/**
 * Replaces forced verdict prompts with neutral contextual reference record.
 * Formulated under Phase 0 review: informs context without dictating scores or conclusions.
 */
export function buildReferenceCaseContext(m: KnownCaseMatch | null): string {
  if (!m) return '';
  const r = m.record;
  const idLine = m.identity === 'confirmed'
    ? 'The submitted media/URL has been matched to an official government record by exact URL or asset identifier.'
    : 'The submitted title or user notes mention this record identifier. This has NOT been confirmed as the same original media.';

  return `
[REFERENCE RECORD - CONTEXT ONLY; NOT A VERDICT INSTRUCTION]
${idLine}
Agency: DoD AARO. Record: [${r.caseId}] "${r.title}". Agency status: ${r.isUnresolved ? 'UNRESOLVED' : 'RESOLVED'}.
Agency statement: ${r.officialVerdict}
Notice: This is the reporting agency's assessment, not absolute ground truth.

Your task: Analyze the submitted media independently, using only what is observable in the data and user-provided metadata. State whether your analysis is consistent with, inconsistent with, or not comparable to the agency statement, and provide the observable basis. Do not adopt the agency's conclusion as your own without evidence, and do not reject it without a stated observable basis. If the submitted file appears re-encoded, cropped, edited, or compressed, state what observational limitations that imposes.
`;
}

/**
 * Shared prompt rules (Claude Phase 0 specification)
 */
export const SHARED_ANALYSIS_RULES = `
CORE EMPIRICAL ANALYSIS RULES:
1. Unknown is not anomalous. If a physical quantity (range, altitude, speed, acceleration, size) cannot be mathematically derived from the supplied data, report it as not available. Do not estimate it from the apparent visual behavior of the object. Angular rate without range does not yield speed or acceleration.
2. Absence of a signature in a given sensor or spectral band is not evidence of absence. Before treating a missing feature (wings, exhaust plume, strobe lights, rotor downwash, acoustic sound) as informative, state whether this sensor, band, resolution, range, and compression would have been physically capable of registering it.
3. For every analysis, audit the mundane categories (commercial aircraft, military aircraft, drone/UAS, balloon/aerostat, bird/fauna, insect, satellite, celestial body, lens or sensor artifact, reflection, mirage) and evaluate whether each is excluded, disfavored, or not excluded, along with discriminating observations.
4. Hypotheses requiring novel physics may only be introduced after conventional hypotheses have been bounded by observation. Mark them requires_novel_physics: true, and state the observable predictions that would test them. A theory that explains the absence of evidence is not evidence.
5. Do not invent or output case numbers, URLs, archive IDs, or academic citations that were not provided in this prompt.
6. Use explanation_status "insufficient_data" when the media and metadata do not support a definitive conclusion. Insufficient data is a valid and expected empirical result.
7. Do not treat witness emotion, vocal panic, or distress as physical sensor evidence. Record it, if at all, as qualitative experiential context.
`;

/**
 * Builds a clean, neutral reference knowledge base string for injection into prompts
 */
export function buildAaroKnowledgeBasePrompt(): string {
  const unresolvedCases = AARO_CASE_RECORDS.filter((c) => c.isUnresolved);
  const resolvedCases = AARO_CASE_RECORDS.filter((c) => !c.isUnresolved);

  const unresolvedSummary = unresolvedCases.map((c) => 
    `- [REFERENCE: AGENCY-UNRESOLVED: ${c.caseId}] "${c.title}" (DVIDS ${c.dvidsId || 'N/A'}): ${c.officialVerdict}. Sensor: ${c.sensorSystem}. Agency Resolution Status: Unresolved.`
  ).join('\n');

  const resolvedSummary = resolvedCases.map((c) => 
    `- [REFERENCE: AGENCY-RESOLVED: ${c.caseId}] "${c.title}" (DVIDS ${c.dvidsId || 'N/A'}): ${c.officialVerdict}. Agency-stated resolution: ${c.physicsDeconfliction.groundTruth}.`
  ).join('\n');

  const papersSummary = AARO_INFORMATION_PAPERS.map((p) =>
    `- [AARO Information Paper: ${p.title} (${p.publicationDate}, ${p.authoringBody})]:
  * Key Principle: ${p.keyPrinciple}
  * Methodology: ${p.methodology}
  * Application: ${p.applicationToUap}
  * Resolution Metric: ${p.resolutionMetric}`
  ).join('\n\n');

  return `
[AARO OFFICIAL RECORDS DATABASE & SCIENTIFIC PAPERS (https://www.aaro.mil/UAP-Records/)]:
The All-domain Anomaly Resolution Office (DoD AARO) maintains official records categorized by agency status:

1. REFERENCE: AGENCY-UNRESOLVED CASES:
${unresolvedSummary}

2. REFERENCE: AGENCY-RESOLVED CASE RESOLUTIONS:
${resolvedSummary}

3. REFERENCE: AARO SCIENTIFIC INFORMATION PAPERS:
${papersSummary}

METHODOLOGICAL CAUTIONS DERIVED FROM AIRSPACE SENSORS:
1. FLIR Sensor Parallax vs. True Velocity:
   - Moving sensor platforms (150–250 kts) produce severe geometric parallax against background terrain. Platform velocity must be subtracted before evaluating kinematics.
2. FLIR Thermal Bloom vs. Solid Hull:
   - Biological wildlife blooms in MWIR/LWIR, which can mask bird wing-beat cadence. Soft thermal bloom must not be interpreted as a solid craft without multi-spectral optical confirmation.
3. Satellite Specular Flares vs. Maneuvering Airframes:
   - Flat solar panels on LEO satellite constellations produce 2–10s specular glints to high-altitude aircraft that can mimic formations. Correlate with orbital ephemeris.

${SHARED_ANALYSIS_RULES}
`;
}

export { AARO_CASE_RECORDS, AARO_INFORMATION_PAPERS, matchAaroCase };
export type { AaroCaseRecord };
