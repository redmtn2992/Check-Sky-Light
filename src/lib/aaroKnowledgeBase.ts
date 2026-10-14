import { AARO_CASE_RECORDS, AARO_INFORMATION_PAPERS, AaroCaseRecord, matchAaroCase } from '../data/aaroRecordsData';

/**
 * Builds a concise, authoritative knowledge base string for injection into Gemini prompts
 */
export function buildAaroKnowledgeBasePrompt(): string {
  const unresolvedCases = AARO_CASE_RECORDS.filter((c) => c.isUnresolved);
  const resolvedCases = AARO_CASE_RECORDS.filter((c) => !c.isUnresolved);

  const unresolvedSummary = unresolvedCases.map((c) => 
    `- [POSITIVE CONTROL - UNRESOLVED UAP: ${c.caseId}] "${c.title}" (DVIDS ${c.dvidsId || 'N/A'}): ${c.officialVerdict} Physics: ${c.physicsDeconfliction.mechanism}. Ground Truth: ${c.physicsDeconfliction.groundTruth} (Target DTC: ${c.dtcCode})`
  ).join('\n');

  const resolvedSummary = resolvedCases.map((c) => 
    `- [NEGATIVE CONTROL - RESOLVED CASE: ${c.caseId}] "${c.title}" (DVIDS ${c.dvidsId || 'N/A'}): ${c.officialVerdict} Physics: ${c.physicsDeconfliction.mechanism}. Ground Truth: ${c.physicsDeconfliction.groundTruth} (Target DTC: ${c.dtcCode})`
  ).join('\n');

  const papersSummary = AARO_INFORMATION_PAPERS.map((p) =>
    `- [AARO Scientific Paper: ${p.title} (${p.publicationDate}, ${p.authoringBody})]:
  * Principle: ${p.keyPrinciple}
  * Methodology: ${p.methodology}
  * Application: ${p.applicationToUap}
  * Standard Metric: ${p.resolutionMetric}`
  ).join('\n\n');

  return `
[AARO OFFICIAL RECORDS DATABASE & SCIENTIFIC PAPERS (https://www.aaro.mil/UAP-Records/)]:
The All-domain Anomaly Resolution Office (DoD AARO) maintains official Unresolved UAP Reports (Active Anomaly Baseline), Case Resolution Sheets (Conventional Baseline), and Scientific Information Papers:

1. OFFICIAL AARO UNRESOLVED UAP REPORTS (POSITIVE CONTROLS / AUTHENTIC ANOMALIES):
${unresolvedSummary}

2. OFFICIAL AARO RESOLVED CASE RESOLUTIONS (NEGATIVE CONTROLS / CONVENTIONAL AIRSPACE):
${resolvedSummary}

3. OFFICIAL AARO SCIENTIFIC INFORMATION PAPERS:
${papersSummary}

CRITICAL FORENSIC DECONFLICTION MANDATES DERIVED FROM AARO PAPERS:
1. FLIR Sensor Parallax vs. True Mach Velocity:
   - Moving sensor platforms (150–250 kts) produce severe geometric parallax against background terrain.
   - For cases matching PR-016 (Birds) or Go Fast (Aerostat): Always compute vector subtraction of platform speed before positing anomalous acceleration!
2. FLIR Thermal Bloom vs. Solid Metallic Hull:
   - Biological wildlife blooms in MWIR/LWIR, completely masking bird wing-beat cadence. Soft thermal bloom must not be interpreted as a solid craft without multi-spectral visible confirmation.
3. Satellite Specular Flares vs. Maneuvering Airframes:
   - Starlink and OneWeb flat solar panels produce blinding 2–10s specular flares at dusk/night to FL360+ airline pilots that mimic racetrack formations. Correlate against NORAD TLE orbital passes.
4. Physical Metallic Specimen Testing (Oak Ridge National Laboratory Standard):
   - Claims of recovered off-world debris or terahertz waveguides (e.g. Bismuth-Magnesium alloys) require empirical isotopic testing. Terrestrial isotopic fractionation and columnar grain structures deconflict specimens as terrestrial metallurgical manufacturing test samples.
5. Critical Discrimination: PR-013 (Unresolved Physical Object) vs. PR-016 (Resolved Birds):
   - PR-013 is an OFFICIAL UNRESOLVED UAP REPORT depicting a verified physical object without wings, surfaces, or exhaust. MUST be evaluated under Lens B as an authentic military anomaly (DTC P0001, high authenticity).
   - PR-016 is an OFFICIAL RESOLVED NEGATIVE CONTROL deconflicted as biological avian fauna (birds) under optical parallax (DTC P0006, low authenticity).
`;
}

export { AARO_CASE_RECORDS, AARO_INFORMATION_PAPERS, matchAaroCase };
export type { AaroCaseRecord };
