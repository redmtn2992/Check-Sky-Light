# Check Sky Light: Validation Protocol v1.0 (CANONICAL CANDIDATE rev 4, NOT FROZEN)

**Status:** Candidate rev 4. Incorporates the statistical and sensor-fusion review of rev 1 (ChatGPT, "Luna"). Also incorporates Gemini's engineering answers, which are the code author's self-reported status and are unverified until Section 6A is completed. Becomes v1.0 only when the Principal Investigator signs the freeze checklist (Section 11).  
**Drafted:** October 2026, with AI-assisted design input (Claude, Anthropic). The AI reviewers have not seen the source code and have run no experiments.  
**Principal Investigator:** Gregory Tafoya, MPH  
**Convention:** **[PILOT]** = set from development-set data, then frozen. **[AUTHOR]** = a human decision this draft deliberately leaves open.  

---

## 1. Purpose

Characterize the measurement performance and error model of the Check Sky Light pipeline (sensor fusion, deconfliction, multi-observer triangulation, pairing gate, rejection states) under controlled conditions with independent ground truth.

This is a **characterization study of the instrument**. It does not search for anomalous phenomena.

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

## 4. Phases and Rules

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

## 5. Tests and Endpoints

| ID | Test | Reference | Endpoint | Role |
|---|---|---|---|---|
| T0 | Simulate rays with known noise through the pairing gate, across a pre-registered range of geometries including near-parallel and ill-conditioned cases | Simulation truth | (a) moments; (b) full distribution of the gate statistic vs χ²₁ | Primary |
| T1 | Bearing characterization on ISS, bright Starlink, planets, bright stars; record temperature, pressure, humidity | Ephemerides | Az and el residual bias and scatter per device and pose, and residual vs elevation (refraction check) | Secondary |
| T2 | Opportunistic orientation calibration | Held-out references | Paired reduction in bearing error on objects not used for calibration | Secondary |
| T3 | Negative control: two devices observe the same ISS or satellite pass | Ephemeris | No output asserting that range is constrained when predicted parallax is below the observability threshold | Primary |
| T4 | Triangulation of ADS-B aircraft and GPS-logged targets, stratified by geometry | ADS-B, GPS logger | Coverage of the reported 95% region per stratum; range error vs predicted δR = R²σ_γ/B_perp | Primary (coverage), Secondary (range) |
| T5a | Deliberate mismatched pairs (different known objects, same time) | Known identities | False-acceptance rate | Primary |
| T5b | Sky-scramble empirical null: permute observer and object identities within strata in real recordings | Recorded sessions | Expected accidental matches E[N] with CI | Primary (with T5a) |
| T6 | Catalog-blind ground-truth control | GPS logger | False-exclusion rate | Primary |
| T7 | Inter-device clock offset vs independent reference | Reference clock | Offset error; adequacy of the (ω·Δt)² noise inflation | Secondary |
| T8 | Camera/IMU boresight, camera-intrinsics, and camera-to-IMU time-offset characterization | Plate-solved star fields, surveyed targets, timed motion or flash events | Stability of R_camera←IMU, field of view, distortion, and temporal offset between video frames and sensor samples | Secondary |
| T9 | Optical centroid / point-source characterization | Surveyed known-direction light | Centroid bias and scatter vs brightness, focus, exposure, motion | Secondary |

## 6. Pre-Specified Criteria and Analysis

**T0 (implementation check under the assumed noise model).**
- (a) |mean(statistic) − 1| < 3·√(2/N).
- (b) Kolmogorov–Smirnov distance to the χ²₁ CDF below the critical value at α = 0.01. Rejection rates at the 90%, 95%, 99%, and 99.9% gate levels each within the exact binomial 99% interval around nominal. Publish the QQ plot. N ≥ 1,000,000.
- Results are reported per geometry stratum. A linearized Gaussian model may fail at small convergence angles, and the gate must flag those cases through the observability threshold [PILOT].
- T0 checks the *implementation*. It cannot validate the real-world noise model; T1, T4, T7, T8, and T9 do that. T0 must run against the shipped triangulation code (the same module the PWA executes), not a reimplementation.

**T3.** Zero outputs claiming a geometrically constrained range when predicted σ_R/R exceeds the observability threshold [PILOT], in n trials. Any exception is a protocol failure. A computable POCA coordinate that carries an honest "unobservable" or wide-uncertainty status is not a failure. Secondary: any reported range interval must contain truth at its nominal rate.

**T4.**
- Strata (pre-registered before freeze): baseline B, range R, convergence angle α, elevation, angular rate, with bins [PILOT]. Also record predicted range uncertainty.
- Primary: in each stratum with n ≥ n_min [PILOT], the one-sided lower 95% confidence bound on coverage of the nominal-95% region must be ≥ C_min [AUTHOR]. C_min is fixed before validation data are seen.
- Strata with n < n_min are "not characterized" and fall outside any performance claim. Do not pool them into favorable strata.
- Over-coverage and region size are reported (they measure informativeness) and are not gated, unless [AUTHOR] sets a maximum median region volume.
- Secondary: normalized-residual calibration compared across strata; range error vs the predicted δR scaling.
- Reference uncertainty (ADS-B latency and accuracy, GPS logger accuracy) must be propagated or shown to be small relative to the tested quantity.

**T5.** Observed false-acceptance count in T5a ≤ the upper 95% bound of E[N] from T5b and from the analytic model [PILOT]. The pipeline's own reported expected-false-pair estimate must also agree with the T5b empirical null. Permutations preserve sky density, elevation distribution, time of night, angular-error characteristics, and candidate count per stratum.

**T6.** The question: "When the pipeline does not know the object's identity, does it assign a catalog explanation?" Any conventional identification output counts as a false exclusion, even if it looks plausible within tolerance. For each, record the match residual and the coincidence probability the pipeline reported, to check whether its false-pair estimate was honest. Report the false-exclusion rate with an exact (Clopper–Pearson) 95% CI. Maximum acceptable upper bound = [AUTHOR]. Rule of three: zero failures in n trials gives an upper 95% bound of about 3/n, so a 10% bound needs n ≥ 30.

**T1, T2, T7, T8, T9** are reported descriptively with CIs. Parameters shown to be unstable beyond [PILOT] limits must be added to the covariance model in v1.1.

**General.**
- Primary endpoints (T0, T3, T4 coverage, T5, T6) are each judged separately, and none may be promoted or demoted after unsealing.
- Report effect sizes, not only pass or fail.
- Report telemetry quality alongside every rate. Never pool low-quality and high-quality data silently.
- Exclusions only for the reasons in Section 10.
- Refraction: the manuscript says "not modeled" unless the T1 residual-vs-elevation analysis meets a pre-specified negligibility criterion [PILOT], in which case it says "demonstrated negligible within tested conditions."

## 6A. Implementation Verification (before Phase 1)

The status below was reported by Gemini, the AI engine that generated the code. A code author's attestation is not independent verification, so each item is a claim to test.

| Item | Developer-reported | Verification required before pilot |
|---|---|---|
| 30 Hz IMU capture | Met | Log delivered event rate, interval distribution, and dropouts on every test device. Confirm raw events are recorded (Section 8). |
| Timestamps | `performance.timeOrigin + performance.now()` with RTT offset logging | Treat as precise but not necessarily accurate. Measure true offset error and jitter per device (T7). |
| Hashing | SHA-256 via Web Crypto; IndexedDB vault | Confirm what is hashed (original recording vs re-encoded canvas frames). Export the manifest externally at capture time. |
| 1-DOF gate | Met | Independent code review of the derivation; T0 against shipped code. |
| Observability threshold; (ω·Δt)² inflation | Met | Hard lower bound $\theta \ge 8.0^\circ$ and $(\omega \cdot \Delta t)^2$ variance inflation in `triangulationMath.ts`. |
| Camera-setting control (stabilization, crop, zoom) | Partially Met | Programmatic on Android Chrome (`applyConstraints()`); locked gesture + telemetry logging on iOS Safari. Assume intrinsics variable unless characterized via T8. |
| Peer-to-peer WebRTC pairing | Pending field pilot | Document signaling and NAT traversal. Signaling server requirement explicitly recognized. |
| Baseline survey; boresight matrix | Pending Phase 1 | Completed during the pilot. |

An independent reviewer (someone other than the code's author) audits the triangulation module before Phase 1.

## 7. Procedures

- **Baseline survey:** GNSS survey to an uncertainty at least an order of magnitude below the bearing-limited position uncertainty [PILOT]. Record method and result.
- **Baselines and targets:** T4 uses [PILOT] baselines in the low-km range, chosen so predicted δR is meaningful. Record R and B per trial.
- **Devices:** list every phone model, OS version, and browser/PWA version. Test fixed (tripod) mounts and a handheld arm separately. Record and fix camera settings that change effective intrinsics (digital stabilization, zoom, crop, HDR, exposure mode).
- **Time sync:** record method, estimated offset, and uncertainty per device. Browsers do not expose GNSS-disciplined time. `performance.now()` is monotonic but its resolution is deliberately coarsened by browsers, and `performance.timeOrigin + performance.now()` is only as accurate as the device wall clock at page start, so precision must not be confused with accuracy. Use RTT-based offset estimation against a documented server, log `event.timeStamp` and frame-callback metadata where available, and note that sensor-event timestamps may reflect delivery time rather than true sample time. Measure the real offset error and jitter against an independent reference (T7).
- **Reference data:** record fetch time and version for every feed: element-set epoch, ADS-B source and snapshot time, weather source, WMM version.
- **Conditions log:** cloud cover, moon phase and position, seeing and transparency, temperature, pressure, humidity, nearby magnetic sources (vehicles, buildings, power lines).
- **Controls (T6):** the control operator logs GPS positions at a fixed rate. The control's identity must be removed from every catalog the pipeline consults.

## 8. Data Capture and Integrity

For every event preserve: original video, raw sensor streams, timestamps with uncertainty, device metadata, camera settings, calibration state, software commit, reference-data versions, ADS-B snapshot, weather inputs, derived trajectory, and uncertainty estimates. Hash all raw artifacts (SHA-256). Hashing proves a file is unchanged since it was hashed, not that it was genuine. Reprocessing rule: raw data + algorithm version + reference data → result.

**Raw capture rule:** record every sensor event the browser delivers, with its timestamps, unthrottled. Any 30 Hz throttling applies only to display and fusion, because discarding events before storage makes the stored stream non-raw and adds sampling jitter to the timing budget. Preserve the original recorded video (or its encoded chunks), not only canvas frames re-encoded for analysis, and record the camera `getSettings()` and `getCapabilities()` output. Export the hash manifest off the device at capture time (for example to the project repository or a trusted timestamp service), because a hash stored beside the data cannot show a third party that the data were unaltered, and browser storage can be evicted or lost.

**Timing and delivery fields (per sensor event and per device):** `monotonic_timestamp`, `estimated_utc_offset`, `offset_uncertainty`, `sync_timestamp`, `sync_rtt`, `event_interval_reported` (where the browser provides it), and `inter_sample_gap_ms`, plus a derived `gap_flag` (nominal, late, or gap) using thresholds [PILOT]. Browsers do not report dropped or coalesced samples, so `gap_flag` is inferred from timestamp intervals, not observed, and the dataset labels it as inferred. No document, code comment, or UI text may state timing performance as a guarantee. Approved wording for processing rate: sensor observations are processed at a target rate of up to 30 Hz, and actual delivery cadence, latency, and gaps are measured and logged. Approved wording for time: timestamps are monotonic, with an independently estimated UTC offset and its uncertainty.

Rejection records use reason codes plus measured quantities (for example `INSUFFICIENT_PARALLAX`, `convergence_angle: X`). Numeric confidence values are added only after a validation set exists to calibrate them.

## 9. Blinding and Roles

- **Control operator** knows the truth for T5 and T6 and does not run the pipeline.
- **Pipeline operator** runs the frozen configuration and does not know control identities or timings.
- **Analyst** receives sealed truth only at analysis lock.
- If one person must fill several roles, record that as a limitation.

## 10. Exclusions and Deviations

Allowed exclusion reasons (pre-listed): total cloud obscuration, device crash or data corruption, reference-feed outage, safety stop. Anything else requires a logged, timestamped deviation, and the event stays in the dataset, flagged. Maintain a deviation log. Never delete.

## 11. Freeze Checklist (all items required)

- [ ] Software commit and version, plus config hash
- [ ] Calibration parameters, covariance assumptions, and camera-intrinsics model
- [ ] Pairing thresholds, gate levels, and observability threshold
- [ ] **Hypothesis taxonomy** locked:
      1. Known Conventional Match
      2. Optical / Sensor Artifact
      3. Atmospheric / Meteorological Phenomenon
      4. Uncataloged Conventional Object
      5. Physically Unresolved Residual (no speculative physics scoring)
- [ ] Geometry strata, n_min, C_min, and all other Section 6 values with every [PILOT] and [AUTHOR] item filled in
- [ ] Ephemeris, ADS-B, and weather sources with version policy
- [ ] Device models, OS/browser versions, and camera settings
- [ ] Baseline survey results
- [ ] Synchronization procedure
- [ ] Analysis code hash and sample sizes
- [ ] Written confirmation that no validation data were used to choose any of the above
- [ ] Pre-registration deposited in a timestamped registry (for example OSF) before validation data collection

## 12. Safety, Legal, Privacy, Data Terms

- Follow all local aviation rules for any drone, balloon, or other control object. Obtain required permissions. Stay away from airports and flight paths.
- Controls must not emit lasers or any light that could distract pilots.
- Collect only participant data under informed consent that covers each data tier below.
- **Data tiers:** Tier 0, raw private data (restricted access). Tier 1, de-identified research dataset. Tier 2, public derived measurements. Tier 3, aggregate statistics. Avoid imaging bystanders and private property. Coarsen locations before Tier 2, because timestamped tracks plus terrain can re-identify a site, and de-identifying video is hard (backgrounds, audio).
- Check the terms of each reference-data source (ADS-B aggregators, Space-Track, and others) before redistributing snapshots. Publish pointers and hashes where redistribution is not permitted.

## 13. Reporting and Disclosure

Publish all primary-endpoint results including failures, all excluded events with reasons, results for every tested device including poor performers, confusion tables with plain class names (false anomaly, false exclusion, insufficient data), and the code and frozen configuration. Disclose AI-assisted design review in the methods or acknowledgments, state that AI agreement is not validation, and follow the target venue's AI-disclosure policy.

---

## 14. Principal Investigator Freeze Sign-Off

**Principal Investigator:** Gregory Tafoya, MPH  
**Date:** October 5, 2026  
**Document Status:** FROZEN VALIDATION SPECIFICATION v1.0  
**Repository Identifier:** `CSL-VAL-PROTO-v1.0-CANDIDATE-REV4`
