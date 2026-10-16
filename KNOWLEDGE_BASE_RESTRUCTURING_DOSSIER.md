# Check Sky Light (CSL): Knowledge Base Restructuring Specification & Peer Review Dossier

*A Joint Synthesis by Luna, Gemini, and Greg Tafoya for Claude Peer Review*  
*Document Code: CSL-KB-SPEC-v4.0 • Target Reviewer: Claude (Anthropic)*  
*Date: October 2026 • Status: Pending Tripartite Review (Pre-Implementation)*

---

## Executive Summary & Purpose

This document unifies **Luna’s architectural restructuring specification** with **Gemini’s proposed implementation schemas and code compatibility audit** for **Check Sky Light (CSL)**.

The objective is to transition Check Sky Light from a flat, static repository list into a **traceable, versioned, evidence-centered knowledge ecosystem** that humans, Claude, Luna, and Gemini can collaboratively curate over time. 

Crucially, this architecture enforces the core scientific principle:
> **Source verification, observational data, official assessments, and theoretical models must remain strictly segregated.** An unresolved case or an un-transponded flight is an observational data void, not proof of exotic propulsion. AI models are analytical computational tools, not evidence authorities.

This dossier is submitted to **Claude** for independent scientific and technical peer review prior to committing any structural changes to the live application.

---

## Part 1: Architectural Constraints & Principles (Luna Specification)

### 1. Core Operating Constraints
1. **Preserve Existing Identifiers**: Retain all established resource codes (`KB-T1-01` through `KB-T5-03`, `KB-REG-01..02`) and case IDs. No silent overwrites or deletions.
2. **Decouple Verification from Operational Status**:
   - `verification_status` reflects source provenance and evidentiary audit.
   - `operational_status` reflects whether the feature is actively queried in the live app (`enabled`, `disabled`, `deprecated`, `pending`).
   - A verified source may be disabled; an unverified source may be retained for research without influencing case verdicts.
3. **Segregate Five Types of Information**:
   - **Type A: Sources** (Organizations, primary publications, repositories, datasets, regulations).
   - **Type B: Claims & Evidence** (Atomic testable propositions, direct/indirect support, counterevidence).
   - **Type C: Cases** (Official assessment strictly distinguished from independent inference).
   - **Type D: Analytical Methods** (Equations, validity domains, failure modes, validation tests).
   - **Type E: AI & Application Configuration** (Models, prompts, endpoints, parameters — treated as tools, not evidence).
4. **Epistemic Honesty**:
   - Never claim a source or test has been verified unless the specific check was performed.
   - Never fabricate URLs, case numbers, or citation details.
   - Missing data $\neq$ extraordinary capability.
   - Multi-AI agreement $\neq$ independent experimental confirmation.

---

## Part 2: Proposed Directory Layout & Canonical Schemas

### Directory Architecture
The dynamic canonical system will reside in `/knowledge-base/` as structured JSON, with automated build-time exports to human-readable markdown (`resourcesdb.md` and `UAP_KNOWLEDGE_BASE_RESOURCES.md`):

```text
/knowledge-base/
├── README.md                  # Scope, principles, and maintenance guidelines
├── sources.json               # Canonical source registry
├── claims.json                # Atomic claims, evidence links, and counterevidence
├── cases.json                 # Curated reference cases (Official vs Independent)
├── analytical-methods.json    # Equations, assumptions, validity domains, failure modes
├── data-feeds.json            # Telemetry providers, coverage, latency, and blind spots
├── ai-config.json             # AI models, configurations, and review settings (NOT evidence)
├── review-policy.md           # Review rubrics and peer-review protocols
└── MIGRATION_LOG.md           # Audit history and old-to-new field mapping
```

---

### Canonical TypeScript Schemas

#### Schema 1: Sources (`sources.json`)
```typescript
export interface SourceEntry {
  resource_id: string;             // Preserved code: "KB-T1-01", "KB-T2-01", etc.
  title: string;                   // Exact publication or organization title
  publisher: string;               // Publishing institution or author
  source_type: 
    | 'primary_document' 
    | 'secondary_analysis' 
    | 'dataset' 
    | 'organization' 
    | 'regulation' 
    | 'technical_documentation' 
    | 'theoretical_paper';
  canonical_url: string;           // Primary landing page
  document_url?: string;           // Direct record / PDF link
  publication_date?: string;       // YYYY-MM-DD
  document_version?: string;
  verification_status: 
    | 'VERIFIED_PRIMARY' 
    | 'VERIFIED_SECONDARY' 
    | 'PARTIALLY_VERIFIED' 
    | 'UNVERIFIED' 
    | 'ACCESS_LIMITED' 
    | 'DEPRECATED';
  operational_status: 
    | 'enabled' 
    | 'disabled' 
    | 'deprecated' 
    | 'pending';
  last_checked_at: string;         // ISO timestamp
  verified_by: string;             // e.g., "Luna", "Claude", "Gemini", "Greg Tafoya"
  verified_fields: string[];       // Explicit array of checked attributes
  limitations: string[];           // Known caveats, data voids, or redactions
  approved_uses: string[];         // Where CSL may apply this source
  prohibited_inferences: string[]; // Interpretations this source CANNOT establish alone
}
```

#### Schema 2: Claims & Evidence (`claims.json`)
```typescript
export interface ClaimEntry {
  claim_id: string;                // e.g., "CLM-FLIR-001", "CLM-OBS-005"
  claim_text: string;              // Single, clear testable proposition
  claim_type: 
    | 'observational' 
    | 'official_assessment' 
    | 'historical' 
    | 'scientific' 
    | 'regulatory' 
    | 'theoretical' 
    | 'interpretive';
  source_links: {
    resource_id: string;
    citation_detail: string;       // Exact page, timestamp, or table
    support_type: 'direct' | 'indirect' | 'contextual';
  }[];
  counterevidence?: {
    resource_id: string;
    citation_detail: string;
    summary: string;
  }[];
  scope_conditions: string[];      // Where and when this claim applies
  limitations: string[];
  review_status: 'draft' | 'under_review' | 'accepted' | 'disputed';
  review_history: {
    date: string;
    reviewer: string;
    note: string;
  }[];
}
```

#### Schema 3: Reference Cases (`cases.json`)
```typescript
export interface CaseEntry {
  case_id: string;                 // e.g., "CASE-AARO-PR013", "CASE-2004-NIMITZ"
  official_case_ids: string[];     // ["PR-013", "DVIDS-992262"]
  event_date: string;
  event_location: {
    region: string;
    coordinates?: { lat: number; lng: number };
    precision: 'exact' | 'sector_approximate' | 'theatre_level';
  };
  original_record_url: string;
  media_provenance: {
    sensor_platform: string;       // e.g., "Raytheon ATFLIR", "L3Harris MX-15"
    sensor_spectrum: 'Visible' | 'MWIR' | 'LWIR' | 'Radar_AESA' | 'Multi-spectral';
    raw_telemetry_available: boolean;
  };
  official_assessment: {
    agency: string;                // "DoD AARO", "GEIPAN", "US Navy"
    status: 'RESOLVED' | 'UNRESOLVED';
    official_verdict: string;      // Verbatim official statement
    stated_confidence?: string;    // "HIGH", "MODERATE", "INCONCLUSIVE"
  };
  independent_analysis: {
    body: string;                  // "SCU", "CSL Parallax Tribunal", etc.
    summary: string;
    competing_hypotheses: string[];
  };
  missing_evidence: string[];      // Ground telemetry void, lack of primary radar, etc.
  known_limitations: string[];
  last_reviewed_at: string;
}
```

#### Schema 4: Analytical Methods (`analytical-methods.json`)
```typescript
export interface AnalyticalMethodEntry {
  method_id: string;               // e.g., "MTH-POCA-01", "MTH-LENS-A-DISQUAL"
  name: string;
  purpose: string;
  mathematical_basis: string;      // Formulas, vector projections, tensor equations
  required_inputs: string[];
  assumptions: string[];
  validity_domain: string;         // e.g., "Optical FOV > 2.0°, range > 500m"
  uncertainty_model: string;
  known_failure_modes: string[];   // e.g., "Platform vector unknown", "H.264 macroblocking"
  validation_tests: string[];      // Unit test IDs or synthetic benchmarks
  approved_use_cases: string[];
  limitations: string[];
  version: string;
}
```

#### Schema 5: Application & AI Configuration (`ai-config.json` - Tooling, not Evidence)
```typescript
export interface AiConfigEntry {
  config_id: string;               // e.g., "CFG-ENGINE-GEMINI", "CFG-BLINDED-CLAUDE"
  role: 'live_reasoning_engine' | 'blinded_peer_review_target';
  model_name: string;              // "models/gemini-3.8-flash", "claude-3-7-sonnet"
  provider: string;
  api_endpoint_used: string;       // "/api/analyze/url", "/api/analyze/media"
  parameters: {
    temperature: number;
    thinking_budget?: number;
    top_p?: number;
  };
  prompts_referenced: string[];
  reproducibility_notes: string;
}
```

---

## Part 3: Old-to-New Resource ID Mapping Table

All existing resource identifiers from `resourcesdb.md` are preserved and reclassified:

| Old ID | Name / Organization | Old Tier | New Schema File | New Status | Classification Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`KB-T1-01`** | DoD AARO | Tier I | `sources.json` | `VERIFIED_PRIMARY` | Official defense anomaly resolution agency |
| **`KB-T1-02`** | PURSUE / Dept of War | Tier I | `sources.json` | `PARTIALLY_VERIFIED` | Primary government domain requires URL audit |
| **`KB-T1-03`** | NASA UAP Study Team | Tier I | `sources.json` | `VERIFIED_PRIMARY` | Official independent scientific roadmap |
| **`KB-T1-04`** | CNES / GEIPAN | Tier I | `sources.json` | `VERIFIED_PRIMARY` | French National Space Agency PAN archive |
| **`KB-T1-05`** | ODNI Assessments | Tier I | `sources.json` | `VERIFIED_PRIMARY` | Threat assessments (Observables baseline separated) |
| **`KB-T1-06`** | DVIDS Military Media | Tier I | `sources.json` | `VERIFIED_PRIMARY` | Unclassified DoD imagery/video distribution |
| **`KB-T2-01`** | Americans for Safe Aerospace | Tier II | `sources.json` | `VERIFIED_PRIMARY` | Aviator flight safety & de-stigmatization |
| **`KB-T2-02`** | Merged Podcast (Lt. Ryan Graves) | Tier II | `sources.json` | `VERIFIED_SECONDARY` | Aviator flight-deck audio/video testimonies |
| **`KB-T2-03`** | AIAA UAPIOC | Tier II | `sources.json` | `VERIFIED_PRIMARY` | Aerospace engineering standards committee |
| **`KB-T2-04`** | SCU (Scientific Coalition) | Tier II | `sources.json` | `VERIFIED_PRIMARY` | Peer-reviewed forensic kinematic radar papers |
| **`KB-T2-05`** | Society for UAP Studies (Limina) | Tier II | `sources.json` | `VERIFIED_PRIMARY` | Interdisciplinary peer-reviewed academic journal |
| **`KB-T2-06`** | The Galileo Project (Harvard CfA) | Tier II | `sources.json` | `VERIFIED_PRIMARY` | Automated multi-spectral sky observatories |
| **`KB-T2-07`** | The Sol Foundation | Tier II | `sources.json` | `VERIFIED_PRIMARY` | Scientific research & governance institute |
| **`KB-T3-01`** | Skywatcher.ai | Tier III | `sources.json` | `PARTIALLY_VERIFIED` | Computer vision atmospheric tracking |
| **`KB-T3-02`** | Sky360 Network | Tier III | `sources.json` | `PARTIALLY_VERIFIED` | Citizen-science 360° all-sky network |
| **`KB-T3-03`** | UFODAP Hardware Stations | Tier III | `sources.json` | `PARTIALLY_VERIFIED` | Optical/RF hardware triangulation stations |
| **`KB-T3-04`** | Project Hessdalen (Norway) | Tier III | `sources.json` | `VERIFIED_PRIMARY` | Scientific field laboratory operational since 1983 |
| **`KB-T4-01`** | Celestrak / Space-Track (NORAD) | Tier IV | `data-feeds.json` | `VERIFIED_PRIMARY` | Two-Line Element (TLE) satellite orbits |
| **`KB-T4-02`** | ADS-B Exchange | Tier IV | `data-feeds.json` | `VERIFIED_PRIMARY` | Unfiltered flight transponder telemetry |
| **`KB-T4-03`** | OpenSky Network | Tier IV | `data-feeds.json` | `VERIFIED_PRIMARY` | Historical academic transponder archive |
| **`KB-T4-04`** | Sondehub / APRS Tracker | Tier IV | `data-feeds.json` | `VERIFIED_PRIMARY` | Meteorological balloon telemetry |
| **`KB-T4-05`** | NOAA NEXRAD Radar | Tier IV | `data-feeds.json` | `VERIFIED_PRIMARY` | Dual-polarization weather radar |
| **`KB-T4-06`** | NASA JPL Horizons | Tier IV | `data-feeds.json` | `VERIFIED_PRIMARY` | High-precision celestial ephemeris |
| **`KB-T5-01`** | Alcubierre Metric (1994) | Tier V | `sources.json` | `VERIFIED_PRIMARY` | Theoretical General Relativity literature |
| **`KB-T5-02`** | Lentz Solitons (2021) | Tier V | `sources.json` | `VERIFIED_PRIMARY` | Theoretical positive-energy solitons |
| **`KB-T5-03`** | Bobrick & Martire (2021) | Tier V | `sources.json` | `VERIFIED_PRIMARY` | Theoretical physical warp geometries |
| **`KB-REG-01`** | FAA 14 CFR § 91.209 | Regulations | `sources.json` | `VERIFIED_PRIMARY` | Aircraft lighting mandates |
| **`KB-REG-02`** | FAA 14 CFR Part 107 | Regulations | `sources.json` | `VERIFIED_PRIMARY` | Small UAS operational ceiling & limitations |
| **`KB-AI-01`** | Google Gemini 3.8 Flash | AI Tools | **`ai-config.json`** | `OPERATIONAL_TOOL` | **Reclassified as Tooling (Not Evidence)** |
| **`KB-AI-02`** | Anthropic Claude / ChatGPT | AI Tools | **`ai-config.json`** | `OPERATIONAL_TOOL` | **Reclassified as Tooling (Not Evidence)** |

---

## Part 4: Representative Migrated Records

### 1. Government Source (`sources.json`)
```json
{
  "resource_id": "KB-T1-01",
  "title": "All-domain Anomaly Resolution Office (AARO)",
  "publisher": "U.S. Department of Defense",
  "source_type": "organization",
  "canonical_url": "https://www.aaro.mil/",
  "document_url": "https://www.aaro.mil/UAP-Records/",
  "verification_status": "VERIFIED_PRIMARY",
  "operational_status": "enabled",
  "last_checked_at": "2026-10-16T15:00:00Z",
  "verified_by": "Gemini & Luna review",
  "verified_fields": ["canonical_url", "document_url", "official_reporting_scope"],
  "limitations": [
    "Unclassified releases only; operational sensor metadata often redacted",
    "Resolutions are bounded by submitted data quality"
  ],
  "approved_uses": [
    "Official reporting baseline",
    "Case resolution deconfliction controls (negative controls)",
    "Unresolved UAP trend monitoring"
  ],
  "prohibited_inferences": [
    "An 'unresolved' status does not constitute proof of extraterrestrial technology or non-conventional metric manipulation.",
    "AARO organizational existence does not validate third-party folklore."
  ]
}
```

### 2. Reference Case Record (`cases.json`)
```json
{
  "case_id": "CASE-AARO-PR013",
  "official_case_ids": ["PR-013", "DVIDS-992262"],
  "event_date": "2022",
  "event_location": {
    "region": "USEUCOM Operational Area, Europe",
    "precision": "theatre_level"
  },
  "original_record_url": "https://www.aaro.mil/UAP-Records/",
  "media_provenance": {
    "sensor_platform": "Airborne Military Platform",
    "sensor_spectrum": "MWIR",
    "raw_telemetry_available": false
  },
  "official_assessment": {
    "agency": "DoD AARO",
    "status": "UNRESOLVED",
    "official_verdict": "AARO assesses the video depicts an authentic physical object. Kinematics remain unresolved due to lack of corroborating primary radar telemetry.",
    "stated_confidence": "HIGH (for physical object validity); UNRESOLVED (for origin and propulsion mechanism)"
  },
  "independent_analysis": {
    "body": "Check Sky Light Research Collective",
    "summary": "Object maintains horizontal trajectory without visible lifting surfaces, rotor downwash, or engine thermal plume in 20-second MWIR clip.",
    "competing_hypotheses": [
      "Un-transponded specialized uncrewed aerial reconnaissance platform",
      "Low-observable aerostat drifting with prevailing high-altitude wind gradient",
      "Metric-decoupled non-conventional craft"
    ]
  },
  "missing_evidence": [
    "Raw sensor platform IMU telemetry",
    "Concurrent primary/secondary radar track",
    "Multi-spectral optical visible-band confirmation"
  ],
  "known_limitations": [
    "Single-sensor 2D infrared projection",
    "Potential optical parallax from moving sensor aircraft"
  ],
  "last_reviewed_at": "2026-10-16T15:00:00Z"
}
```

### 3. Telemetry Feed (`data-feeds.json`)
```json
{
  "feed_id": "KB-T4-02",
  "name": "ADS-B Exchange",
  "operator": "ADS-B Exchange LLC",
  "data_products": ["Unfiltered Mode-S and ADS-B transponder state vectors"],
  "geographic_coverage": "Global civilian and military airspace (receiver-dependent)",
  "latency": "Near real-time (1–3 seconds)",
  "historical_retention": "Available via archival API; limited free query window",
  "access_status_in_app": "integrated_live",
  "verification_status": "VERIFIED_PRIMARY",
  "operational_status": "enabled",
  "known_blind_spots": [
    "Does not track aircraft with disabled, faulty, or military-off transponders",
    "Coverage requires local ground station line-of-sight; oceanic and remote terrain gaps exist",
    "Does not detect non-transponding balloons, drones, or anomalous targets without RF emission"
  ],
  "prohibited_inferences": [
    "Absence of an ADS-B squawk does NOT prove an exotic origin; aircraft frequently operate un-transponded or below receiver line-of-sight."
  ]
}
```

### 4. Theoretical Paper (`sources.json`)
```json
{
  "resource_id": "KB-T5-01",
  "title": "The warp drive: hyper-fast travel within general relativity",
  "publisher": "Classical and Quantum Gravity, Vol. 11, No. 5",
  "authors": ["Miguel Alcubierre"],
  "source_type": "theoretical_paper",
  "canonical_url": "https://doi.org/10.1088/0264-9381/11/5/001",
  "publication_date": "1994-05-01",
  "verification_status": "VERIFIED_PRIMARY",
  "operational_status": "enabled",
  "last_checked_at": "2026-10-16T15:00:00Z",
  "verified_by": "Gemini & Luna review",
  "verified_fields": ["doi", "authors", "mathematical_conclusions"],
  "limitations": [
    "Purely theoretical mathematical metric solution in General Relativity",
    "Requires negative energy density (exotic matter) in its original formulation",
    "No experimental macroscopic demonstration exists"
  ],
  "approved_uses": [
    "Theoretical modeling under Lens B (Metric Manipulation)",
    "Explaining fluid decoupling hypotheses (absence of shockwaves/downwash in metric frames)"
  ],
  "prohibited_inferences": [
    "Cannot be used as empirical evidence that an observed target is operating an Alcubierre drive.",
    "Must not alter case classification scores without measurable, testable physical parameters."
  ]
}
```

### 5. Application / AI Configuration (`ai-config.json`)
```json
{
  "config_id": "CFG-AI-01",
  "tool_name": "Google Gemini Multimodal Reasoning Engine",
  "role": "live_reasoning_engine",
  "model_identifier": "models/gemini-3.8-flash",
  "provider": "Google DeepMind / Google AI Studio",
  "classification": "Analytical Computational Tool (NOT an evidence source)",
  "operational_status": "enabled",
  "approved_functions": [
    "Real-time video and image multi-modal forensic analysis",
    "Automated mathematical kinematics and angular triangulation",
    "Dual-Lens Parallax Tribunal synthesis"
  ],
  "epistemic_safeguards": [
    "Model consensus is not experimental replication.",
    "Model outputs must be presented alongside raw observable data so human investigators can audit conclusions.",
    "Blinded un-primed dossiers ('Copy Case Facts') are exported to external models (Claude, ChatGPT) to prevent single-vendor bias."
  ]
}
```

---

## Part 5: Code Conflict & Compatibility Audit

A comprehensive code inspection reveals four specific touchpoints where the current application interfaces with the knowledge base, along with our planned compatibility solutions:

### Touchpoint 1: Backend Heuristics & AARO Matching in `server.ts`
* **Current Code**:
  * Lines 9, 1025, 1052, 1817–1818 import `buildAaroKnowledgeBasePrompt()` and `matchAaroCase()` from `./src/lib/aaroKnowledgeBase.ts`.
  * Lines 1054–1065 force positive-control matches (e.g. `PR-013`) into automated `AUTHENTIC_INCIDENT` verdicts with high fixed scores (88%).
* **Luna Guardrail / Conflict**:
  * An unresolved official case simply means data was insufficient to reach resolution; it is not scientific proof of exotic propulsion.
* **Compatibility Solution**:
  * Preserve `matchAaroCase()` and `buildAaroKnowledgeBasePrompt()` interfaces, but update the generated prompt text to present the official DoD finding alongside competing hypotheses (un-transponded military prototype, low-observable aerostat, or metric anomaly). The model is instructed to maintain tension in the Parallax Tribunal rather than assigning a hardcoded 88% conclusion.

### Touchpoint 2: Frontend Explorer Modal (`AaroRecordsModal.tsx`)
* **Current Code**:
  * `src/components/analyze/AaroRecordsModal.tsx` directly renders `AARO_CASE_RECORDS` and `AARO_INFORMATION_PAPERS` from `src/data/aaroRecordsData.ts`.
* **Compatibility Solution**:
  * Provide a backwards-compatible export in `aaroRecordsData.ts` that maps from `cases.json` and `sources.json`. The modal continues rendering smoothly without any breaking UI changes, while immediately gaining richer fields (official assessment vs independent analysis, primary record links).

### Touchpoint 3: Pillar 2 Aviation Disqualification vs. Compression Artifacts
* **Current Code**:
  * `CSLmethodssummary.md` and `server.ts` currently state: *"If an object lacks FAA-mandated position/strobe lights $\implies$ Commercial airliner hypothesis is mechanically disqualified."*
* **Luna Guardrail / Conflict**:
  * A 1.2 Hz strobe light (1 flash every 0.83 seconds) can easily be dropped by digital video compression (macroblocking, rolling shutter, or a 15-frame web video clip).
* **Compatibility Solution**:
  * Formalize Method `MTH-LENS-A-DISQUAL` in `analytical-methods.json`: Strobe absence may only be used for mechanical disqualification when video duration exceeds $3.0\text{ seconds}$ with verifiable temporal resolution. For short or compressed video, the absence of strobes must be qualified as *"Inconclusive due to sensor/codec limitations"* rather than definitive disqualification.

### Touchpoint 4: Dual Maintenance of Markdown Files (`resourcesdb.md` & `UAP_KNOWLEDGE_BASE_RESOURCES.md`)
* **Current Code**:
  * Two separate markdown files exist in the root directory.
* **Compatibility Solution**:
  * Treat the JSON files in `/knowledge-base/` as the single source of truth. Add a lightweight build/sync script that automatically compiles `resourcesdb.md` directly from `sources.json`, `cases.json`, and `data-feeds.json`.

---

## Part 6: Specific Questions for Claude's Peer Review

We invite Claude to critique and advise on the following targeted questions:

1. **Schema Expressiveness**:
   - In `claims.json` and `cases.json`, are the evidence linkage structures (`source_links`, `counterevidence`, `competing_hypotheses`) sufficiently expressive to capture nuanced UAP encounters without oversimplifying or introducing hidden bias?
2. **Epistemic Balance in Lens A vs Lens B**:
   - Does separating theoretical metric literature (`KB-T5-01..03`) into a research-only category strike the right balance between acknowledging advanced physics possibilities and maintaining rigorous empirical standards?
3. **Handling of Ambiguous / Contested Cases**:
   - For contested military cases (e.g. 2013 Aguadilla or 2015 Go Fast), where official AARO resolution sheets (Negative Controls) conflict with peer-reviewed kinematic physics papers from the Scientific Coalition for UAP Studies (SCU), how should `cases.json` structure the competing assessments to maintain transparency without taking an authoritarian stance?
4. **Implementation Phasing**:
   - Do you foresee any regressions in the live full-stack app if we implement Phase 1 (creating `/knowledge-base/` and canonical JSON files) while preserving existing TypeScript interfaces as a compatibility shim?

---

*End of Specification Dossier • Ready for Claude Review.*
