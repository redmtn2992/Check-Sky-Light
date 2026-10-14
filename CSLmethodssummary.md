# Check Sky Light (CSL): Methods & Protocol Summary

This document synthesizes the analytical methodology, scoring architecture, and operationalization of cross-AI consensus derived from the **Check Sky Light** tripartite validation initiative (`CHECK_SKY_LIGHT_MANUSCRIPT_v1.0.md`, `Check_Sky_Light_Validation_Protocol_v1.0_CANDIDATE_rev5.md`, and `CROSS_AI_DOSSIER.md`).

---

## PART 1: Method and Protocol for the "Analyze Sky Phenomena" Page

### 1. Architectural Philosophy & Dual-Lens Analytical Framework
The Analyze Sky Phenomena workflow operates as a scientific decision-support system rather than a speculative classifier. It rejects binary "alien vs. fake" heuristics in favor of empirical deconfliction governed by two complementary analytical lenses:

* **Lens A: Classical Aerospace Baseline (Conventional Mechanics)**
  * Evaluates evidence against Newtonian fluid dynamics, atmospheric shear, aerodynamic control surfaces, combustion/exhaust plumes, acoustic shockwaves (sonic booms), and FAA 1.2 Hz anti-collision strobes.
  * Conducts exhaustive deconfliction against civilian airliners, military aircraft, satellites (Starlink, ISS, OneWeb via NORAD TLE), consumer/commercial drones, meteorological sounding balloons, birds, insects (parallax/rod artifacts), specular glint, and optical/sensor aberrations (lens flares, rolling shutter, pixel bloom).
* **Lens B: Theoretical Metric Manipulation (Non-Conventional Physics)**
  * Acknowledges that authentic Unidentified Anomalous Phenomena (UAP) may operate via localized spacetime metric engineering (e.g., Alcubierre-type distortion metrics, geodesic frame-dragging, or gravitational wave synthesis).
  * **Physical Decoupling Principle**: Recognizes that metric distortion decouples a craft from the ambient fluid medium. Under this framework:
    * The **absence of barometric downwash or rotor wash** is not treated as a physical impossibility—it is the direct theoretical signature of gravitational or metric propulsion.
    * **Transmedium travel** (vacuum $\rightarrow$ atmosphere $\rightarrow$ ocean) occurs without hydrodynamic drag, cavitation, or water displacement.
    * **Hypersonic acceleration** occurs without sonic booms or atmospheric thermal ionization.
  * Evaluates the case against the **Five Observables** established by ODNI/AARO: instantaneous acceleration, hypersonic velocity without signatures, low observability/cloaking, transmedium travel, and positive lift without aerodynamic surfaces.

---

### 2. Page Features, Input Modalities & Operational Options

The user interface provides structured inputs designed to eliminate ambiguity and prevent model hallucination:

1. **Evidence Media Ingestion:**
   * High-resolution image upload (visible light, 530nm Gen-3 Night Vision green phosphor, FLIR thermal infrared white-hot/black-hot).
   * Direct visual inspection with client-side zoom, pan, and channel adjustment.
2. **Observation Metadata Form:**
   * **Temporal & Geodetic Anchors**: ISO-8601 Timestamp, Lat/Lon coordinates, Observer Elevation (m ASL).
   * **Kinematic Observables**: Azimuth (°), Elevation angle above horizon (°), estimated range/distance, angular rate of climb.
   * **Environmental Conditions**: Atmospheric visibility, cloud cover, lunar phase, barometric pressure.
3. **Sensor Modality Selection:**
   * Optical / Visible Spectrum (Daylight HDR)
   * Gen-3 Night Vision (530nm P43 Green Phosphor)
   * Thermal FLIR (Long-Wave Infrared 8–14 µm / Mid-Wave Infrared 3–5 µm)
   * Radar-corroborated (Primary return vs. Secondary ADS-B squawk)
4. **Analytical Lens Selector:**
   * User can filter or focus on **Classical Aerospace**, **Non-Conventional Metric Physics**, **Sensor Artifact & Media Forensics**, or synthesize across **All Lenses**.
5. **Tool-001 "Less Ink" Interface Discipline:**
   * Adheres strictly to Edward Tufte's data-ink ratio principles: clean typography, scannable data density, elimination of redundant labels, and eradication of distracting decorative containers.

---

### 3. Step-by-Step Analytical Pipeline

When an analysis is triggered, the engine executes a multi-stage pipeline:

```
[User Media + Telemetry]
           │
           ▼
[1. Media Forensics & Hash Integrity] ──► Checks for generative AI artifacts, compression, metadata
           │
           ▼
[2. Astronomical & Ephemeris Deconfliction] ──► JPL Horizons / Star Tracker (Venus, Jupiter, Sirius)
           │
           ▼
[3. Orbital & Airspace Deconfliction] ──► CSpOC TLE (Starlink, ISS) + ADS-B transponder feeds
           │
           ▼
[4. Multi-Lens Prompt Synthesis] ──► Gemini 3.8 Flash structured reasoning (Lenses A & B)
           │
           ▼
[5. Mathematical Triangulation & Kinematics] ──► POCA vector intersection, Chi-Square, g-force
           │
           ▼
[6. Diagnostic Triage & Scoring Synthesis] ──► Anomaly Score (0-100), Confidence, Credibility
```

1. **Media Forensics & Synthetic Artifact Screening:** Evaluates the asset for neural diffusion signatures (warping, lack of frame-to-frame coherence, prompt leakage) versus authentic sensor artifacts (rolling shutter, compression macroblocking, sensor hot pixels).
2. **Astronomical & Ephemeris Cross-Referencing:** Evaluates whether target azimuth and elevation coincide with prominent celestial bodies (e.g., Venus at maximum elongation, Jupiter, Sirius) or atmospheric mirages.
3. **Orbital & Airspace Deconfliction:** Compares timestamp and look-angles against Two-Line Element (TLE) satellite passes and unaggregated ADS-B flight paths.
4. **Multi-Lens Inference:** Executes a structured reasoning prompt enforcing strict epistemic neutrality, demanding explicit reasoning under both Lens A (Newtonian/Conventional) and Lens B (Spacetime Metric Manipulation).
5. **Kinematic & Mathematical Triangulation:** Where multi-station observer vectors exist, calculates Point of Closest Approach (POCA), Miss Distance ($d_{\text{miss}}$), and $\chi^2$ goodness-of-fit.
6. **Diagnostic Triage Card Generation:** Synthesizes the final report, key observables, deconfliction status, and quantitative scores.

---

### 4. Mathematical Scoring Architecture

The engine generates three primary composite scores, each normalized between 0 and 100:

#### A. Anomaly Score ($S_{\text{anomaly}}$: 0 to 100)
Quantifies the degree to which observed characteristics depart from known classical aerospace, meteorological, and celestial phenomena:

$$S_{\text{anomaly}} = \sum_{i=1}^{5} w_i \cdot O_i + W_{\text{phys}} \cdot P_{\text{kinematic}} - D_{\text{conv}}$$

Where:
* $O_1 \dots O_5$ are the Five ODNI/AARO Observables (Instantaneous Acceleration, Hypersonic Velocity without signatures, Low Observability, Transmedium Travel, Positive Lift without aerodynamic surfaces), weighted from 0 to 15 points each.
* $P_{\text{kinematic}}$ measures calculated g-force ($a / g$) and angular velocity ($\omega$). Acceleration exceeding human physiological tolerance ($>9g$) or conventional airframe limits ($>45g$) drives this component to its maximum ($+25$ points).
* $D_{\text{conv}}$ is the Conventional Deconfliction Penalty (deducts up to $-60$ points if the kinematic path matches ballistic satellite decay, FAA beacon flash rates at 1.2 Hz, commercial cruise speed/altitude, or astronomical coordinates).

#### B. Confidence Score ($S_{\text{confidence}}$: 0 to 100)
Reflects the epistemic reliability and signal-to-noise ratio of the submitted data:

$$S_{\text{confidence}} = 0.35 \cdot M_{\text{sensor}} + 0.30 \cdot C_{\text{triangulation}} + 0.20 \cdot Q_{\text{media}} + 0.15 \cdot E_{\text{metadata}}$$

* $M_{\text{sensor}}$: Multi-sensor corroboration (Optical + FLIR + Radar primary returns = 100; single smartphone optical = 30).
* $C_{\text{triangulation}}$: Rigor of spatial intersection based on Miss Distance ($d_{\text{miss}} < 50\text{ m} \implies 100$; uncorroborated single line-of-sight = 15).
* $Q_{\text{media}}$: Visual clarity, resolution, dynamic range, and absence of compression degradation.
* $E_{\text{metadata}}$: Authenticity of EXIF/metadata, GPS lock precision, and NTP synchronized timestamps.

#### C. Credibility & Forensic Index (0 to 100)
Measures the resistance of the evidence to digital forgery, CGI tampering, or misinterpretation:
* **Digital Tampering Index (DTI)**: Evaluates compression artifacts, edge continuity, chromatic aberration consistency, and noise floor homogeneity across the image plane.
* **Observer Baseline**: Accounts for optical device calibration and known observer vantage point stability.

---

## PART 2: Application of Manuscript, Protocol rev5, and Cross-AI Dossier Knowledge

The analytical pipeline directly incorporates the empirical consensus, mathematical formulas, and critical error corrections established across:
* **`CHECK_SKY_LIGHT_MANUSCRIPT_v1.0.md`** (Tripartite Scientific Manuscript)
* **`Check_Sky_Light_Validation_Protocol_v1.0_CANDIDATE_rev5.md`** (Empirical Validation Protocol)
* **`CROSS_AI_DOSSIER.md`** (Comprehensive Cross-AI Consensus & Case History)

Below are the exact operational integrations and error corrections applied:

---

### 1. Correction of Mathematical & Astronomical Errors (Phase 0 Consensus)

During the cross-AI validation between Gemini 3.8 Flash, Claude Sonnet 5.5, and ChatGPT/Luna, several critical mathematical and astronomical errors in early drafts were exposed and definitively resolved:

| Error Identified in Early Drafts | Correcting AI / Finding | Operational Rule in Check Sky Light |
| :--- | :--- | :--- |
| **Lunar Phase Inversion** (Claimed Full Moon on Nov 2, 2023) | **Claude & Gemini**: Astronomical ephemeris proves Nov 2, 2023 was Waning Gibbous (80% illumination), not Full Moon. | System mandates **authoritative astronomical ephemeris (JPL Horizons)**; user-input lunar conditions are validated against calculated ephemeris tables. |
| **$\chi^2$ Coordinate Frame Mismatch** (Degenerate degrees of freedom) | **Gemini & Claude**: $\chi^2$ goodness-of-fit was computing coordinate residuals in unscaled angular degrees rather than metric orthogonal projection error ($d_{\text{miss}}$ in meters). | Vector triangulation calculates true 3D spatial Point of Closest Approach (POCA) with metric covariance ellipsoids: $\chi^2 = \sum (d_{\text{miss}, i} / \sigma_i)^2$. |
| **Acoustic Shockwave Omission** | **Tripartite Consensus**: Classical aerospace models mandate $N$-wave acoustic sonic booms at velocities $> \text{Mach } 1.0$. | The presence or absence of sonic booms is an explicit diagnostic gate. Supersonic flight without an $N$-wave automatically triggers the Lens B Physical Decoupling diagnostic. |
| **Mischaracterization of Decoupling** | **Tripartite Consensus**: Rejecting non-Newtonian observations as "impossible" violates scientific inquiry. | System protocol treats absence of downwash/cavitation as a positive indicator of metric manipulation, not an automatic disqualifier. |

---

### 2. Implementation of the $T_0$ Gate & Pre-Registered Decision Thresholds

As codified in `Check_Sky_Light_Validation_Protocol_v1.0_CANDIDATE_rev5.md`, the platform implements the pre-registered $T_0$ Gate architecture to prevent post-hoc rationalization:

* **POCA Miss Distance Threshold ($d_{\text{miss}}$):**
  * Two observer lines-of-sight must yield a spatial intersection Miss Distance $d_{\text{miss}} \le 150\text{ meters}$ (or within the $2\sigma$ error ellipsoid) to qualify as a confirmed geometric triangulation.
  * If $d_{\text{miss}} > 500\text{ meters}$, the system flags an "Uncorrelated Trajectory" and suppresses triangulation confidence.
* **$T_0$ Temporal Synchronization Window ($\Delta t$):**
  * Synchronous observations across independent stations must share a timestamp delta $\Delta t \le 1.0\text{ second}$ (NTP synchronized) or $\le 3.0\text{ seconds}$ (video frame cross-correlation).
* **Kinematic Thresholds ($g$-Force & Velocity):**
  * Sustained linear acceleration $a > 45g$ without aerodynamic deformation is categorized as an Anomalous Non-Inertial Vector.
  * Instantaneous turn radii defying dynamic pressure limits ($q = \frac{1}{2} \rho v^2$) trigger the Lens B Spacetime Metric flag.

---

### 3. Rigorous Deconfliction Tiers (Tiers I through V)

The system enforces the five epistemological tiers established in the project charter:

1. **Tier I: Official Declassification & Defense Baselines**
   * Incorporates reporting standards from AARO (All-domain Anomaly Resolution Office), NASA UAP Independent Study Team, CNES/GEIPAN Category A–D taxonomy, and ODNI preliminary assessments.
2. **Tier II: Academic & Institutional Scientific Standards**
   * SCU (Scientific Coalition for UAP Studies) kinematic radar reconstruction formulas.
   * Galileo Project multi-spectral sensor discrimination heuristics.
   * SUAPS (Society for UAP Studies) / Limina peer-reviewed literature guidelines.
3. **Tier III: Autonomous Observation Networks**
   * Skywatcher.ai, Sky360, and UFODAP multi-spectral camera tracking principles (optical, 530nm Gen-3 night vision, FLIR LWIR/MWIR).
4. **Tier IV: Ephemeris & Airspace Telemetry Sources**
   * CSpOC / Celestrak Space-Track NORAD TLE propagation for LEO satellite deconfliction (eliminates Starlink train false positives).
   * ADS-B Exchange raw, unfiltered flight data deconfliction (differentiates civil/military transponders).
   * NOAA NEXRAD dual-polarization weather radar signatures (identifies anomalous propagation, chaff, and biological clutter).
5. **Tier V: Theoretical Spacetime Metric Mechanics**
   * Peer-reviewed General Relativity models (Alcubierre 1994, Lentz 2021 positive-energy solitons, Bobrick & Martire 2021 physical warp drive geometries) for evaluating non-dispersive wave propagation and localized geodesics.

---

### 4. Blinded Multi-AI Tribunal & Neutral Dossier Export

To honor the multi-AI partnership charter without infringing third-party service boundaries:

* **In-App Neutral Analysis Engine:**
  * Uses Google Gemini 3.8 Flash to evaluate data across the three pre-defined lenses with mathematical impartiality.
* **"Export Raw Neutral Dossier" Feature:**
  * Strips all internal confidence scores, AI model labels, and interpretive commentary.
  * Produces a clean, standardized Markdown dossier containing only raw empirical coordinates, timestamps, sensor telemetry, and kinematic measurements.
  * Enables users to independently paste the dossier into external frontier models (such as Anthropic Claude or OpenAI ChatGPT) to perform rigorous, independent, and blinded tripartite verification.

---

### 5. Edward Tufte "Tool-001 Less Ink" Aesthetic Implementation

Reflecting the UI overhaul mandated by the user and documented in the protocol:
* Redundant brand badges and repetitive model names have been stripped from the analysis view.
* Data-ink ratio is maximized: high-contrast typography, clear tabular breakdowns of observables, and distinct visual callouts for Lens A and Lens B.
* Overly complex narrative paragraphs are replaced with concise diagnostic metrics: Miss Distance ($d_{\text{miss}}$), $\chi^2$ value, Acceleration ($g$), Velocity ($\text{km/s}$), and Deconfliction Status.

---

## Summary Matrix

| Protocol Component | Source Document Reference | Codebase Implementation |
| :--- | :--- | :--- |
| **Dual-Lens Evaluation** | `CHECK_SKY_LIGHT_MANUSCRIPT_v1.0.md` §3 | `server.ts` `/api/analyze-sky-light` multi-lens system prompt |
| **POCA & Triangulation** | `Check_Sky_Light_Validation_Protocol_v1.0_CANDIDATE_rev5.md` | `src/lib/triangulationMath.ts` (`calculatePOCA`, `runMonteCarloT0Gate`) |
| **Five Observables Scoring** | `CROSS_AI_DOSSIER.md` §Tier I | `DiagnosticReportCard.tsx` Anomaly Score Breakdown |
| **Ephemeris Deconfliction** | Error correction in Phase 0 review | Celestial lookup against Venus/Jupiter/Sirius coordinates |
| **Blinded Dossier Export** | Tripartite Agreement (`CROSS_AI_DOSSIER.md`) | `TierOsintSleuthLab.tsx` "Copy Neutral Raw Dossier" action |
| **Tool-001 Visual Theme** | User Aesthetic Mandate & Protocol rev5 | Streamlined minimal ink layout on `AnalyzeSkyPhenomena.tsx` |

*Document compiled and archived for reference: October 2026.*
