# Check Sky Light: Validation Protocol v1.0 (CANONICAL CANDIDATE rev 5, NOT FROZEN)

**Status:** Candidate rev 5. Incorporates the statistical and sensor-fusion review of rev 1 (ChatGPT, "Luna") and the exact Jacobian variance verification from Phase 0 (T0). Becomes v1.0 only when the Principal Investigator signs the freeze checklist (Section 11).  
**Drafted:** October 2026, with AI-assisted design input from "The Parallax Panel" (Claude Sonnet 5.5, Anthropic; Gemini 3.8 Flash, Google; ChatGPT / OpenAI, styled "Luna").  
**Principal Investigator:** Gregory Bryant Tafoya, MPH  
**Convention:** **[PILOT]** = set from development-set data, then frozen. **[AUTHOR]** = a human decision this draft deliberately leaves open.  

---

## 1. Purpose
Characterize the measurement performance and error model of the Check Sky Light pipeline (sensor fusion, deconfliction, multi-observer triangulation, pairing gate, rejection states) under controlled conditions with independent ground truth.

This is an **empirical characterization study of the instrument**. It does not search for anomalous phenomena.

## 2. What This Experiment Cannot Establish
- Extraterrestrial origin of anything.
- Metric manipulation or any exotic physical mechanism.
- That an object is physically anomalous merely because the software cannot classify it.
- Real-world base rates of unexplained sightings.
- That the ISS pass validates *range* triangulation. At 400+ km slant range and a few-km baseline the parallax is far below phone bearing noise, so the ISS tests bearing accuracy and the refusal to claim range only.
- General performance across all phones, operating systems, environments, regions, or baselines. Results apply only to the tested devices, geometry strata, and conditions (strata without enough data are reported as "not characterized").
- Usability or data quality from untrained crowd-sourced users.
- Coverage of ADS-B, TLE, or weather feeds outside the test region and dates.
- That an effect left unmodeled (for example atmospheric refraction) is negligible, unless a pre-specified test demonstrates it. "Not modeled" and "demonstrated negligible" are different claims and are reported as such.

## 3. Definitions
- **Reference truth:** independently derived position or trajectory: SGP4 propagation from a recorded element-set epoch, an ADS-B record (with its latency and accuracy), a GPS logger on a controlled object, a surveyed fixed point, or an astronomical ephemeris. Reference uncertainty is propagated into every comparison.
- **False anomaly:** a known object that ends as an unresolved residual.
- **False exclusion:** an object with known ground truth that is absent from every catalog the pipeline consults, but that the pipeline explains by assigning a catalog identity.
- **Insufficient-data rate:** reported separately; never merged into either error type.
- **Error budget:** Σ_observed ≈ Σ_sensor + Σ_ephemeris + Σ_timing + Σ_model. Residuals against reference truth are not assumed to be entirely phone error.

## 4. Phases and Standing Rules
| Phase | What happens | Data rule |
|---|---|---|
| 0. Simulation | Monte Carlo test of the pairing gate (T0). No field data. | n/a |
| 1. Development (pilot) | Collect field data to set noise model, thresholds, strata, and sample sizes. | May be inspected freely. Never reused as validation data. |
| Freeze | Section 11 checklist completed, tagged, hashed, timestamped. | No changes after this point. |
| 2. Validation | Collect fresh data on different nights and, where possible, different sites. | Sealed. No plots, no summaries, no peeking until analysis lock. |
| 3. Analysis | Run frozen analysis code once on sealed data. Publish everything. | Section 6 rules apply. |

**Standing rules:**
1. If any primary endpoint fails, report the failure. A modified pipeline is **v1.1** and must be validated on **new** data.
2. The validation set may not be used to select devices, baselines, thresholds, covariance models, feature representations, geometry strata, or hypotheses.
3. A device that performs poorly is reported, not quietly removed.
4. The hypothesis taxonomy used for deconfliction and residual classification is frozen before validation. Adding a hypothesis afterward means v1.1 and new validation data. Speculative physics stays outside the scoring pipeline.
5. The validation experiment evaluates the measurement and classification pipeline, not the truth of any underlying physical interpretation.

## 5. Tests and Endpoints
| ID | Test | Reference | Endpoint | Role |
|---|---|---|---|---|
| T0 | Monte Carlo simulation of rays through the pairing gate across geometries | Simulation truth | (a) Moments; (b) distribution of gate statistic vs χ²₁ | Primary |
| T1 | Bearing characterization on ephemeris targets (ISS, planets, Starlink) | Ephemerides | Az/el residual bias and scatter per device pose; refraction check | Secondary |
| T2 | Opportunistic orientation calibration on held-out references | Held-out targets | Paired reduction in bearing error on independent targets | Secondary |
| T3 | Geometric observability refusal (negative control on high orbiters) | Ephemeris | No output asserting constrained range when parallax is unobservable | Primary |
| T4 | Triangulation of ADS-B aircraft and GPS-logged targets stratified by geometry | ADS-B, GPS logger | Coverage of reported 95% region per stratum; range error vs δR | Primary (coverage), Secondary (range) |
| T5a | Deliberate mismatched pairs (different objects, same time) | Known identities | False-acceptance rate | Primary |
| T5b | Sky-scramble empirical null | Recorded sessions | Expected accidental matches E[N] with CI | Primary (with T5a) |
| T6 | Catalog-assignment false-positive rate under blinded controls | GPS logger | False-exclusion rate under blinded ground truth | Primary |
| T7 | Clock offset and jitter verification | Reference clock | Offset error; adequacy of the (ω·Δt)² noise inflation | Secondary |
| T8 | Camera/IMU boresight, intrinsics, and camera-to-IMU time-offset | Plate-solved targets | Stability of R_camera←IMU and temporal offset | Secondary |
| T9 | Optical centroid point-source characterization | Surveyed light | Centroid bias/scatter vs brightness, focus, motion | Secondary |
| T10 | Optical artifact control set | Reflections, glare | Tracker behavior under flare, window ghosting, saturation | Secondary |

## 6. Pre-Specified Criteria and Analysis
- **T0:** Evaluated on shipped code against theoretical χ²₁ across characterized strata.
- **T3:** Zero outputs claiming geometrically constrained range when σ_R/R exceeds observability threshold [PILOT].
- **T4:** In each stratum with n ≥ n_min [PILOT], lower 95% confidence bound on coverage must be ≥ C_min [AUTHOR].
- **T5:** Observed false-acceptance count in T5a ≤ upper 95% bound of E[N] from T5b empirical null.
- **T6:** False-exclusion rate evaluated with exact Clopper-Pearson 95% CI (target: upper bound ≤ [AUTHOR]).

## 7. Procedures
- **Baseline survey:** Surveyed with GNSS to an uncertainty an order of magnitude below bearing-limited uncertainty [PILOT].
- **Devices:** List models, OS versions, browser/PWA versions. Test fixed mounts and handheld arm separately.
- **Time sync:** Monotonic timestamps, plus RTT-based offset estimation and logged gap_flag.
- **Reference data:** Record fetch times and version policies for all feeds.

## 8. Data Capture and Integrity
Record unthrottled sensor streams, timestamps, camera settings, and calibration states. Cryptographically hash all raw payloads (SHA-256).

## 9. Blinding and Roles
- Control operator knows ground truth for T5/T6.
- Pipeline operator runs frozen configuration blind.
- Analyst receives sealed truth only at analysis lock.

## 10. Exclusions and Deviations
Pre-listed allowed exclusions: total cloud obscuration, device crash, reference-feed outage, safety stop. Maintain an immutable deviation log.

## 11. Freeze Checklist (Required for v1.0 Sign-Off)
- [ ] Software commit hash recorded
- [ ] T0 Monte Carlo executed on frozen seed with N = 1,000,000
- [ ] Pilot baselines (B) and target strata selected
- [ ] Hypothesis taxonomy locked:
      1. Known Conventional Match
      2. Optical / Sensor Artifact
      3. Atmospheric / Meteorological Phenomenon
      4. Uncataloged Conventional Object
      5. Physically Unresolved Residual (no speculative physics scoring)
- [ ] Pre-registration deposited in public registry (OSF)
- [ ] Principal Investigator signature affixed below

## 12. Safety, Legal, Privacy, Data Terms
Adhere to all FAA/aviation regulations. Four data tiers: Tier 0 (Raw private), Tier 1 (De-identified research), Tier 2 (Public derived telemetry), Tier 3 (Aggregate statistics).

## 13. Reporting and Formal Acknowledgment
Publish all results including failures and confusion tables.
**Formal Acknowledgment Text:**
> *"AI-Assisted Methodological Review: The experimental design and validation protocol received adversarial technical review from The Parallax Panel, consisting of Claude Sonnet 5.5 (Anthropic), Gemini 3.8 Flash (Google), and ChatGPT / OpenAI (styled 'Luna'). These systems contributed suggestions concerning geometric formulation, sensor fusion, statistical calibration, and epistemic safeguards. The AI systems did not conduct experiments, independently verify source code, or validate results. All methodological decisions and scientific responsibility reside solely with the Principal Investigator, Gregory Bryant Tafoya, MPH."*

---

## 14. Principal Investigator Sign-Off
**Principal Investigator:** Gregory Bryant Tafoya, MPH  
**Date:** October 5, 2026  
**Document Status:** FROZEN VALIDATION SPECIFICATION v1.0 (rev 5)  
**Repository Identifier:** `CSL-VAL-PROTO-v1.0-CANDIDATE-REV5`
