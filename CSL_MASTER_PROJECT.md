Check Sky Light (CSL)
Master Project Specification, Scientific Framework, Knowledge Base, and Field Validation Protocol

Project identifier: check-sky-light-v3.1-parallax-consensus
Document identifier: CSL-MASTER-PROJECT
Document type: Integrated technical and scientific project specification
Principal Investigator: Gregory Tafoya, MPH
Version: Master Draft 1.1 — Integrated PURSUE Release 07 Declassifications
Prepared: October 2026 (Updated October 29, 2026)
License: MIT for original software and open-architecture materials, subject to the licensing and redistribution terms of referenced third-party data
Status: Consolidated working draft; incorporating declassified primary defense records; not a declaration of experimental validation or final protocol freeze
Document Control
Field	Description
Project	Check Sky Light (CSL)
Primary objective	Characterize a civilian multi-sensor sky-observation and airspace-deconfliction instrument
Scientific approach	Measurement validation, uncertainty propagation, conventional-object identification, dual-lens hypothesis testing, and residual analysis
Principal Investigator	Gregory Tafoya, MPH
Primary implementation	Progressive Web Application (PWA); implementation details require source-code verification
Reference deployment	https://ais-pre-ukflj6nzej45ykwobcj43x-497180163446.us-west2.run.app
Knowledge base	CSL-KB-DB-v3.7 (Integrated US Department of War PURSUE Release 07)
Validation protocol	CSL-VAL-PROTO-v1.0-CANDIDATE-REV4
Supersession policy	Approved master revisions supersede prior working copies; frozen validation configurations remain immutable
Governing principle	An unexplained residual is a measurement and classification problem, not evidence of an exotic origin
Document Revision History & Tracked Activities
Revision	Date	Author / Role	Summary of Changes & Ingested Materials
v1.0	October 2026	Gregory Tafoya, MPH (PI)	Initial consolidated master project specification, scientific dual-lens analytical framework, mathematical vector geodesy, and field validation protocol.
v1.1	October 29, 2026	Gregory Tafoya, MPH (PI) & Scientific AI Review Panel	Ingested U.S. Department of War (DoW) PURSUE Release 07 declassified records (28 PDF reports, 1,100+ pages; URL: https://www.war.gov/ufo/?releaseDate=Release+07&release=07). Added catalog resource entry KB-T1-05. Established Section 18.2.1 incorporating case dossiers (DOW-UAP-D176 / FBI-UAP-D043, DOW-UAP-D167, DOW-UAP-D174, DOW-UAP-D155). Updated Dual-Lens classification criteria for fluid boundary-layer and acoustic decoupling.
Document Status and Precedence

This document consolidates the project architecture, analytical framework, external source registry, and proposed field-validation protocol into a single human-readable reference.

The original source materials contain several different kinds of information: scientific principles, proposed thresholds, descriptions of planned functionality, developer-reported implementation claims, and case-specific statements that have not been independently checked. These categories must remain distinguishable.

Where documents conflict, apply the following precedence:

    The signed and versioned validation protocol governs preregistered experimental methods and acceptance criteria.
    The verified software release and its configuration determine actual implementation behavior.
    Approved knowledge-base revisions govern source selection and analytical dependencies.
    This master document governs project organization, terminology, and the relationship between those components.
    Draft notes, AI-generated recommendations, and unverified case descriptions are advisory until reviewed.

A consolidated document does not itself freeze a protocol, verify a source, or establish a performance claim.
Table of Contents

    Executive Summary
    Project Purpose, Scope, and Research Questions
    Scientific Principles and Evidence Classification
    System Architecture and Five-Stage Maturity Model
    Sensor Acquisition, Calibration, and Data Integrity
    Geometric Reconstruction and Statistical Gating
    Airspace Deconfliction and Knowledge-Base Integration
    Orientation Calibration and Sensor Fusion
    Research Design and Field Validation
    Statistical Analysis Plan and Acceptance Criteria
    Operational Procedures and Quality Assurance
    Data Governance, Privacy, Safety, and Legal Compliance
    Results Reporting and Scientific Interpretation
    Project Governance, Versioning, and Release Management
    Implementation Verification and Outstanding Engineering Work
    Principal Investigator Freeze Checklist
    Limitations and Risk Register
    Knowledge Base Resource Registry
    References and Technical Reading List
    Appendices

1. Executive Summary

Check Sky Light (CSL) is a proposed civilian multi-sensor observation and airspace-deconfliction platform designed to improve the quality, reproducibility, and interpretability of reports of unidentified anomalous phenomena (UAP).

The platform follows a diagnostic-triage model analogous to an automotive warning indicator. It does not assign extraordinary explanations simply because an observation is difficult to identify. Instead, it evaluates sensor quality, tests conventional explanations, estimates geometric observability, propagates measurement uncertainty, and records the residual evidence remaining after specified tests.

The system is intended to integrate:

    Smartphone optical video and device sensor measurements.
    Camera and inertial measurement unit (IMU) calibration.
    Aircraft telemetry and ADS-B-derived observations.
    Satellite and orbital ephemerides.
    Meteorological and astronomical reference data.
    Multi-observer angular measurements.
    Statistical association, triangulation, and uncertainty estimation.
    Auditable event records and independently reproducible analysis.

The principal scientific objective is instrument characterization, not the discovery or confirmation of extraterrestrial technology.

The proposed validation program evaluates the behavior of the measurement and classification pipeline under controlled conditions. It includes simulated statistical tests, astronomical bearing references, opportunistic orientation calibration, multi-observer triangulation, deliberate mismatched-object pairs, empirical null models, and catalog-blind controls.

The program also explicitly recognizes that a low-cost smartphone observation system has finite limits. A target can be optically detected while its range remains unobservable. A calculated point of closest approach (POCA) can exist without being a reliable estimate of an object's true position. A statistically accepted pairing can still be coincidental if the pairing model, covariance assumptions, or candidate population is misspecified.

The intended scientific output is therefore a calibrated account of what the instrument can measure, what it cannot measure, and how often its analytical decisions are supported by independent reference data.
1.1 Core Scientific Axiom

    An event is considered anomalous only with respect to the tested hypothesis set; absence of a conventional identification does not constitute evidence for an exotic explanation.

1.2 Project Deliverables

    A documented, versioned sensor-acquisition and data-integrity pipeline.
    A reproducible geometric reconstruction module.
    A statistically evaluated observer-pairing gate.
    A versioned catalog-deconfliction knowledge base.
    A field-characterized sensor and timing error model.
    A preregistered validation dataset and analysis plan.
    Complete primary-endpoint results, including failures and inconclusive outcomes.
    A public report separating verified results from unresolved engineering questions.

2. Project Purpose, Scope, and Research Questions
2.1 Primary Aim

To characterize the measurement performance and error behavior of the CSL pipeline using controlled observations and independent reference truth.
2.2 Research Questions

RQ1 — Sensor performance: What are the bias, scatter, timing characteristics, and stability of the tested phone-camera and IMU configurations?

RQ2 — Geometric observability: Under what combinations of observer baseline, target range, convergence angle, and angular uncertainty can CSL provide a defensible range estimate?

RQ3 — Statistical calibration: Does the implemented pairing statistic follow its assumed null distribution under the stated noise model?

RQ4 — Association reliability: How frequently does the pipeline accept incorrect observer-object pairings, and how does that frequency compare with an empirical chance-match model?

RQ5 — Classification reliability: How frequently does the pipeline incorrectly assign a conventional catalog identity to an object whose identity is independently known but intentionally absent from the available catalogs?

RQ6 — Uncertainty calibration: Do reported confidence or uncertainty regions contain independently measured reference trajectories at their stated nominal rates?

RQ7 — Operational reliability: How do device differences, camera configuration, timing offsets, environmental conditions, and telemetry quality affect performance?
2.3 Scope

The initial characterization applies only to the devices, operating systems, browsers, sites, environmental conditions, reference feeds, and geometric strata actually tested.

Performance must not be generalized to untested phones, all civilian observers, all atmospheric conditions, or all classes of aerial objects.
2.4 Explicit Non-Objectives

This study cannot establish:

    Extraterrestrial origin.
    Metric manipulation, warp-drive operation, or any other exotic propulsion mechanism.
    The real-world prevalence of unexplained aerial observations.
    Universal sensor performance across devices and environments.
    The correctness of an identification merely because it falls within a chosen tolerance.
    The validity of an error model merely because a simulation passes.
    The negligible magnitude of an unmodeled effect without an appropriate empirical test.

An observation classified as physically unresolved remains unresolved within the tested hypothesis set.
3. Scientific Principles and Evidence Classification
3.1 Evidence Categories

Every project statement, observation, and analytical result should be assigned an appropriate evidentiary status.
Status	Meaning	Permitted interpretation
Established principle	Supported by accepted mathematics or independently documented science	May inform the design, subject to stated assumptions
Source-reported finding	A named organization or publication reports the result	Attribute the finding to the source
Developer-reported capability	The code author reports that functionality exists	Treat as an implementation claim until verified
Proposed method	Included in the architecture but not yet experimentally assessed	Describe as planned or proposed
Simulated result	Produced using specified simulated inputs and assumptions	Supports conclusions about that simulation, not automatically about field performance
Validated result	Obtained using the frozen protocol and appropriate independent references	Report with sample size, uncertainty, exclusions, and limitations
Unresolved residual	The observation remains inconsistent with the tested hypotheses or cannot be identified	No claim about exotic origin is implied
3.2 Five-Stage Scientific Maturity Model

Each event progresses through the following conceptual pipeline. An event may terminate at an earlier stage if its data are inadequate or a conventional explanation is supported.
Stage	Name	Operational definition	Expected output
0	Observation	Raw optical, motion-sensor, timing, and relevant contextual data are acquired	Original artifacts, metadata, timestamps, and integrity manifest
1	Sensor-Valid	Data pass predefined quality and calibration checks	Quality metrics and a validity decision
2	Deconflicted	Candidate observations are compared against specified conventional reference sources	Candidate associations, residuals, and match diagnostics
3	Geometrically Constrained	Independent observations support a sufficiently observable, uncertainty-qualified 3D reconstruction	Estimated trajectory, covariance or uncertainty region, and conditioning diagnostics
4	Physically Unresolved	Residual evidence remains inconsistent with the tested hypotheses after applicable uncertainty propagation	UNRESOLVED_HIGH_RESIDUAL, with limitations and unresolved alternatives documented

The stages represent scientific maturity, not certainty that an object belongs to a particular physical category.
3.2.1 Stage-Transition Rules

    A failure of data quality must not be promoted to a physical anomaly.
    A catalog match must retain its match residual and relevant false-association estimate.
    A geometrically calculated coordinate must not automatically be labeled a measured 3D position.
    A Stage 4 result must list the tested hypothesis set and known data limitations.
    No AI-generated interpretation may override a failed measurement-quality requirement.

3.3 Classification Taxonomy and Terminal Diagnostic States

The frozen validation taxonomy maps directly to operational terminal diagnostic codes:
Taxonomy Category	Terminal Diagnostic Code	Definition
Known Conventional Match	CONVENTIONAL_IDENTIFIED	Observation successfully associated with verified cataloged aircraft, satellite, or celestial body
Optical / Sensor Artifact	OPTICAL_SENSOR_ARTIFACT	Internal lens flare, sensor saturation, rolling-shutter distortion, or device reflection
Atmospheric / Meteorological Phenomenon	ATMOSPHERIC_METEOROLOGICAL	Identified cloud, ice halo, weather balloon, mirage, or anomalous radar propagation
Uncataloged Conventional Object	UNCATALOGED_CONVENTIONAL	Target exhibits conventional aerodynamic lift/propulsion but lacks active cooperative transponder
Physically Unresolved Residual	UNRESOLVED_HIGH_RESIDUAL	Observation passes sensor and geometric quality checks, remains inconsistent with tested hypotheses

Data-quality and geometric failure states produce non-substantive terminal codes: `INSUFFICIENT_TELEMETRY_DATA`, `INSUFFICIENT_PARALLAX`, `INVALID_FORWARD_RAY`, and `ILL_CONDITIONED_GEOMETRY`.

The taxonomy is operational. It does not constitute a ranking of the probability of extraterrestrial or other exotic explanations.

3.4 Disambiguated Terminology

To prevent conceptual confusion, the following terms are strictly separated:
- **Observer-to-Observer Pairing**: Cross-station matching of two or more independent observer lines of sight to attempt 3D geometric triangulation (evaluated in T5a and T5b).
- **Observation-to-Catalog Association**: Matching an individual observer's sightline or an estimated trajectory against external reference registries (ADS-B, NORAD TLE, weather balloons, astronomical ephemerides).
- **Detection**: Evidence that an optical or sensor contrast signal exceeds background noise.
- **Identification**: Supported assignment to a verified physical category.
- **Deconfliction**: The procedural testing and systematic elimination of conventional hypotheses.
- **Triangulation**: Estimation of a shared 3D point or track from intersecting or near-intersecting lines of sight.
- **POCA (Point of Closest Approach)**: The geometric midpoint of the shortest line segment connecting two skew rays in 3D space.
- **Range Observability**: The mathematical conditioning under which angular baseline and measurement noise adequately constrain target distance.
- **Residual**: The difference between an observed line of sight and a model prediction (e.g., cross-track distance along the common normal).
- **False Anomaly**: A known, cooperative cataloged object incorrectly classified as `UNRESOLVED_HIGH_RESIDUAL` (the primary failure mode the diagnostic platform exists to prevent).
- **False Exclusion**: An uncataloged or blind-control object incorrectly matched to a conventional catalog identity.
- **True-Pair Recall**: The empirical fraction of true intersecting lines of sight accepted by the statistical gate (bounded nominally at ~99% for a $\chi^2_{0.99}(1)$ gate).
- **Insufficient Telemetry**: Sensor data inadequate to support valid diagnostic evaluation.
- **Reference Truth**: Independently verified target coordinates and timing, including their own explicit error budgets.

4. System Architecture and Five-Stage Processing
4.1 Logical Architecture

CSL should be implemented as a sequence of independently testable modules.

    Acquisition layer: Original camera recordings, sensor events, timestamps, device information, and environmental metadata.
    Integrity layer: Artifact hashing, manifests, software versioning, and provenance records.
    Calibration layer: Camera geometry, IMU alignment, timing characterization, and device-specific uncertainty.
    Candidate-generation layer: Optical detections and candidate object tracks.
    Reference-data layer: Aircraft, satellites, astronomical objects, weather, and other approved catalogs.
    Association layer: Candidate matching, statistical gating, and empirical chance-match estimation.
    Geometric layer: Multi-observer ray construction, POCA computation, observability checks, and uncertainty estimation.
    Classification layer: Quality status, conventional associations, artifacts, and unresolved residuals.
    Reporting layer: Reproducible outputs, audit records, confidence-region information, and validation metrics.

Each layer should expose documented inputs, outputs, failure conditions, and version identifiers.
4.2 Proposed Processing Sequence with Geometric Feedback

Raw Observation
       |
       v
Artifact Preservation and Hashing (SHA-256 + External RFC 3161 Timestamp)
       |
       v
Sensor Quality and Calibration Checks
       |
       +---- Failed quality checks ---> INSUFFICIENT_TELEMETRY_DATA
       |
       v
Optical Detection and Candidate Generation
       |
       v
Reference Feed Retrieval and Provenance Checks
       |
       v
Conventional-Object Association (Single-Observer Bearing/Ephemeris Match)
       |
       +---- High-confidence match ---> Preliminary CONVENTIONAL_IDENTIFIED
       |
       v
Multi-Observer Geometric Pairing and Observability Assessment
       |
       +---- Inadequate parallax / near-collinear ---> INSUFFICIENT_PARALLAX / ILL_CONDITIONED_GEOMETRY
       |
       v
3D POCA / Trajectory Estimation and Covariance Propagation
       |
       v
Geometric Feedback Loop to Catalog Deconfliction:
       Does the triangulated 3D position contradict the preliminary catalog candidate?
       (e.g., POCA range 3.8 km vs. catalog airliner slant range 34 km)
       |
       +---- Spatial contradiction ---> Reject candidate catalog match; re-open investigation
       |
       v
Residual Analysis Against Frozen Hypotheses
       |
       +---- Supported artifact -------> OPTICAL_SENSOR_ARTIFACT
       +---- Supported meteorology ----> ATMOSPHERIC_METEOROLOGICAL
       +---- Supported uncataloged ----> UNCATALOGED_CONVENTIONAL
       +---- Supported match ----------> CONVENTIONAL_IDENTIFIED
       +---- Unresolved ---------------> UNRESOLVED_HIGH_RESIDUAL

This diagram is conceptual. The shipped implementation must be audited to confirm its actual control flow and terminal states.
4.3 Candidate Event Record

Each processed event should contain, at minimum:

    Unique event and session identifiers.
    Original artifact references and cryptographic hashes.
    Device model, operating system, browser, and application version.
    Camera settings and calibration state.
    Raw sensor timestamps and timing uncertainty.
    Observer position and its uncertainty.
    Bearing and elevation estimates with uncertainty.
    Reference-data source, version, retrieval time, and validity interval.
    Candidate identities and association residuals.
    Geometry and observability diagnostics.
    POCA, if computed, and its uncertainty representation.
    Gate statistic, degrees of freedom, and threshold version.
    Classification and rejection reason codes.
    Software commit, configuration hash, and processing timestamp.

The system must preserve the distinction between a value that was measured, a value that was inferred, and a value that was assumed.
5. Sensor Acquisition, Calibration, and Data Integrity
5.1 Optical Acquisition

The browser-based camera pipeline must preserve the original recorded video or encoded media chunks where supported.

Canvas frames re-encoded for analysis are derived artifacts, not substitutes for the original recording.

For each session, record:

    Camera device and browser-reported settings.
    Frame timestamps and available frame-callback metadata.
    Exposure, focus, white balance, zoom, crop, stabilization, and HDR settings where available.
    Optical detection quality and centroid uncertainty.
    Device orientation and the source of that orientation estimate.
    Changes to camera settings during the observation.
    Data gaps and inferred sampling irregularities.

The proposed optical-contrast threshold and minimum stable-observation duration must be established from pilot data and frozen before validation.
5.2 IMU Acquisition

The reported implementation target of 30 Hz requires direct verification on every tested device.

The application should record every sensor event delivered by the browser, without discarding events before archival. Display and fusion processing may operate at a lower or fixed target cadence.

Record:

    Delivered event rate.
    Inter-event interval distribution.
    Long gaps and inferred missing-sample intervals.
    Available event timestamps.
    Device orientation and motion measurements.
    Sensor coordinate conventions.
    Calibration status and known limitations.

Browser event APIs do not necessarily expose the true physical sampling time or every dropped or coalesced sample. A missing-event flag must therefore be labeled as inferred when it is derived from timestamp intervals.

Approved operational wording: Sensor observations are processed at a target rate of up to 30 Hz. Actual delivery cadence, latency, and gaps are measured and logged.
5.3 Timing Architecture

performance.now() provides a monotonic time source within its execution context, but its relation to UTC depends on the device clock and the implementation of performance.timeOrigin.

A high-resolution timestamp is not proof of high absolute-time accuracy.

For every device, record:

    monotonic_timestamp
    estimated_utc_offset
    offset_uncertainty
    sync_timestamp
    sync_rtt
    event_interval_reported, where available
    inter_sample_gap_ms
    gap_flag
    Timing-calibration version

Inter-device clock offsets must be compared with an independent reference clock under T7. Round-trip-time estimation alone is not sufficient to establish a known one-way timing error.

Furthermore, during rapid handheld slewing or high angular velocity tracking, any inter-device timing offset $\Delta t$ induces an effective angular variance proportional to the object's angular rate $\omega$:
$$\sigma^2_{\text{ang, slew}} \approx (\omega \cdot \Delta t)^2.$$
This timing-induced variance inflation must be dynamically computed and combined with the sensor covariance before statistical gating.
5.4 Camera and IMU Calibration

T8 characterizes the relative orientation of the camera and IMU, camera intrinsics, field of view, lens distortion, and time offset between camera frames and sensor samples.

Where possible, use:

    Plate-solved star fields (astrometric reduction of nocturnal star passes to lock camera boresight to sub-arcminute precision, sidestepping magnetometer biases).
    Surveyed terrestrial targets.
    Controlled timed motion.
    Flash or equivalent timing events.
    Repeated observations across device poses.

The camera-to-IMU rotation matrix must be represented using an explicitly documented mathematical convention, such as $\mathbf{R}_{\text{camera} \leftarrow \text{IMU}}$. The transformation direction, coordinate handedness, axis definitions, and units must be consistent across modules.

A nominal camera field of view must not be treated as an exact intrinsic calibration.
5.5 Optical Centroid Characterization

T9 measures centroid bias and scatter against a known-direction point source while varying brightness, focus, exposure, and motion.

Centroid error should be characterized in angular units and propagated into the relevant bearing covariance.

Saturated, defocused, blurred, or partially obscured observations must be evaluated under prespecified quality rules rather than assigned artificially precise bearings.
5.6 Artifact Integrity and Provenance

For every event, preserve:

    Original video or encoded recording.
    Raw delivered sensor events.
    Timestamps and timing uncertainty.
    Device metadata and camera settings.
    Calibration parameters.
    Software commit and configuration.
    Reference-data versions.
    Reference snapshots or permitted pointers to those snapshots.
    Derived detections, trajectories, and uncertainty estimates.
    Processing logs and rejection records.

Use SHA-256 hashes for raw artifacts and the manifest.

A cryptographic hash establishes that the bytes match the hashed content. However, internal SHA-256 hashes alone prove only bit integrity, not proof of existence at a specific historical time. To provide verifiable legal and scientific chain of custody, every captured session manifest must be anchored by an external cryptographic timestamp (RFC 3161 compliant trusted timestamp authority or OpenTimestamps on the Bitcoin blockchain) exported off-device at capture time.
6. Geometric Reconstruction and Statistical Gating
6.1 Coordinate Systems

The system uses geodetic WGS84 coordinates for observer locations and Earth-Centered, Earth-Fixed (ECEF) coordinates for global geometric calculations.

Local East-North-Up (ENU) coordinates provide a convenient representation of bearing and elevation at each observer.

Every implementation must document:

    Geodetic datum and ellipsoid.
    Latitude and longitude units.
    Height reference, including ellipsoidal versus orthometric height.
    ENU axis orientation.
    Azimuth convention.
    Elevation convention.
    ECEF origin and axis orientation.
    Angular units and uncertainty representation.

Mixing ellipsoidal and orthometric heights without conversion can introduce systematic position errors.
6.2 Local ENU Line of Sight

For azimuth $az$ measured clockwise from true north and elevation $el$ measured above the local horizontal datum, the local East-North-Up (ENU) unit direction vector $\mathbf{\hat{u}}_{\text{ENU}}$ is:
$$\mathbf{\hat{u}}_{\text{ENU}} = \begin{bmatrix} 
\sin(az)\cos(el) \\ 
\cos(az)\cos(el) \\ 
\sin(el) 
\end{bmatrix}.$$

The line of sight is transformed into global Earth-Centered, Earth-Fixed (ECEF) coordinates using the observer's geodetic position (geodetic latitude $\phi$, longitude $\lambda$) via the standard orthogonal rotation matrix $\mathbf{R}_{\text{ENU}\to\text{ECEF}}$:
$$\mathbf{R}_{\text{ENU}\to\text{ECEF}} = \begin{bmatrix} 
-\sin\lambda & -\sin\phi\cos\lambda & \cos\phi\cos\lambda \\ 
\cos\lambda & -\sin\phi\sin\lambda & \cos\phi\sin\lambda \\ 
0 & \cos\phi & \sin\phi 
\end{bmatrix}.$$

Thus, the unit ray direction in ECEF coordinates is:
$$\mathbf{\hat{d}}_{\text{ECEF}} = \mathbf{R}_{\text{ENU}\to\text{ECEF}} \mathbf{\hat{u}}_{\text{ENU}}.$$

The implemented transformation must be verified against independent geodetic test vectors before field deployment.

6.3 Two-Observer Ray Geometry

Let the two observer ECEF positions be $\mathbf{p}_1$ and $\mathbf{p}_2$, with corresponding unit direction vectors $\mathbf{\hat{d}}_1$ and $\mathbf{\hat{d}}_2$.

The parametric equations of the two optical sightlines are:
$$\mathbf{L}_1(s) = \mathbf{p}_1 + s \mathbf{\hat{d}}_1, \quad \mathbf{L}_2(t) = \mathbf{p}_2 + t \mathbf{\hat{d}}_2,$$
subject to the physical forward-ray constraints:
$$s > 0, \quad t > 0.$$

Let the baseline vector connecting Observer 1 to Observer 2 be $\mathbf{b} = \mathbf{p}_2 - \mathbf{p}_1$, and define the ray direction dot product:
$$c = \mathbf{\hat{d}}_1 \cdot \mathbf{\hat{d}}_2 = \cos\alpha.$$

The closest-approach ray parameters $s^*$ and $t^*$ that minimize the Euclidean distance $\|\mathbf{L}_1(s) - \mathbf{L}_2(t)\|$ satisfy the least-squares normal equations:
$$\begin{aligned}
\frac{\partial}{\partial s} \|\mathbf{L}_1(s) - \mathbf{L}_2(t)\|^2 = 0 &\implies s - c t = \mathbf{b} \cdot \mathbf{\hat{d}}_1 \\
\frac{\partial}{\partial t} \|\mathbf{L}_1(s) - \mathbf{L}_2(t)\|^2 = 0 &\implies c s - t = \mathbf{b} \cdot \mathbf{\hat{d}}_2.
\end{aligned}$$

Solving this linear system yields the exact closed-form solution:
$$s^* = \frac{(\mathbf{b} \cdot \mathbf{\hat{d}}_1) - c (\mathbf{b} \cdot \mathbf{\hat{d}}_2)}{1 - c^2}, \quad t^* = \frac{c (\mathbf{b} \cdot \mathbf{\hat{d}}_1) - (\mathbf{b} \cdot \mathbf{\hat{d}}_2)}{1 - c^2}.$$

The denominator reveals the fundamental geometric singularity:
$$1 - c^2 = 1 - \cos^2\alpha = \sin^2\alpha = \|\mathbf{\hat{d}}_1 \times \mathbf{\hat{d}}_2\|^2.$$
As convergence angle $\alpha \to 0$, $1 - c^2 \to 0$, causing range uncertainty to diverge.

If either solved parameter violates the forward constraint ($s^* \le 0$ or $t^* \le 0$), the geometric intersection lies behind one or both observers. The pipeline rejects the candidate pairing with terminal code `INVALID_FORWARD_RAY`.

6.4 Convergence, Conditioning, and Angular Regimes

Define the angular separation (convergence angle) between the two unit rays as:
$$\alpha = \arccos\left(\operatorname{clamp}\left(\mathbf{\hat{d}}_1 \cdot \mathbf{\hat{d}}_2, -1, 1\right)\right).$$

Small convergence angles produce severe range ill-conditioning. To first order with independent angular noise $\sigma$, relative range uncertainty scales as:
$$\frac{\sigma_R}{R} \approx \frac{\sqrt{2} \cdot \sigma}{\alpha}.$$
For representative smartphone sensor noise $\sigma = 0.5^\circ$ ($8.7\text{ mrad}$):
- At $\alpha = 8^\circ$, $\sigma_R / R \approx 8.8\%$. On a $2\text{ km}$ baseline, $8^\circ$ caps usable range at roughly $14\text{ km}$ ($R \approx B / \alpha$).
- At $\alpha = 20^\circ$, $\sigma_R / R \approx 3.5\%$.

Consequently, convergence angle $\alpha$ functions as a geometric floor, not an autonomous range gate. The pipeline enforces a two-tiered conditioning protocol:
1. **$\alpha < 10^\circ$**: Immediate rejection with terminal code `INSUFFICIENT_PARALLAX`.
2. **$10^\circ \le \alpha < 20^\circ$**: Non-linear transition zone. Monte Carlo simulations confirm that near-collinear rays exhibit heavy-tailed departure from linearized Gaussian assumptions ($\operatorname{Var} \approx 3.2\text{--}80$). Trajectory estimates must be flagged with `WIDE_UNCERTAINTY` status and evaluated using non-linear empirical bounds.
3. **$\alpha \ge 20^\circ$**: Well-conditioned linear Gaussian regime where standard POCA covariance propagation is robust.

6.5 Point of Closest Approach

The closest points along the two rays are:
$$\mathbf{q}_1 = \mathbf{p}_1 + s^* \mathbf{\hat{d}}_1, \quad \mathbf{q}_2 = \mathbf{p}_2 + t^* \mathbf{\hat{d}}_2.$$

The Point of Closest Approach (POCA) position estimate is the midpoint:
$$\mathbf{X}_{\text{POCA}} = \frac{\mathbf{q}_1 + \mathbf{q}_2}{2},$$
and the closest-approach cross-track miss distance is:
$$m = \|\mathbf{q}_1 - \mathbf{q}_2\| = |(\mathbf{p}_1 - \mathbf{p}_2) \cdot \mathbf{\hat{n}}|,$$
where $\mathbf{\hat{n}}$ is the unit common normal vector.

POCA is a geometric construction, not an assumption of truth. Separation $m$ must be evaluated against a rigorous covariance model, and the estimated point must be reported with its uncertainty ellipsoid and conditioning diagnostics.

6.6 Epipolar Coplanarity Pre-Filter and Singularity Guards

Define the unit baseline vector from Station 2 to Station 1:
$$\mathbf{\hat{b}} = \frac{\mathbf{p}_1 - \mathbf{p}_2}{\|\mathbf{p}_1 - \mathbf{p}_2\|}.$$

For a non-degenerate configuration, define the epipolar normal plane:
$$\mathbf{\hat{n}}_{\text{epi}} = \frac{\mathbf{\hat{b}} \times \mathbf{\hat{d}}_1}{\|\mathbf{\hat{b}} \times \mathbf{\hat{d}}_1\|}.$$

The second ray's out-of-plane angular residual is:
$$\epsilon = \arcsin\left(\operatorname{clamp}\left(\mathbf{\hat{d}}_2 \cdot \mathbf{\hat{n}}_{\text{epi}}, -1, 1\right)\right).$$

**Critical Singularity Guard**: If the observer baseline $\mathbf{\hat{b}}$ and line of sight $\mathbf{\hat{d}}_1$ are near-collinear:
$$\|\mathbf{\hat{b}} \times \mathbf{\hat{d}}_1\| < 0.05,$$
$\mathbf{\hat{n}}_{\text{epi}}$ is ill-defined (Observer 1 sights directly along the baseline toward Observer 2). The pipeline traps this condition and outputs `ILL_CONDITIONED_GEOMETRY`.

**Relationship to the $\chi^2$ Gate**: Coplanarity of two rays is mathematically equivalent to zero cross-track distance ($m = 0$). Applying both an epipolar pre-filter and a subsequent $\chi^2$ gate tests the identical physical residual twice. Conditioning the second test on passing the first alters the nominal distribution. Therefore:
- The epipolar pre-filter is designated strictly as a coarse computational bounding-box pre-check.
- The primary statistical decision rests entirely on the directional $\chi^2(1)$ gate along the common normal.
- Simulation validation (T0) must be executed on the composite gate pipeline exactly as shipped.

6.7 Directional Covariance Projection and the 1-DOF Chi-Square Gate

The statistical gate tests whether the observed cross-track separation along the common normal:
$$\mathbf{\hat{n}} = \frac{\mathbf{\hat{d}}_1 \times \mathbf{\hat{d}}_2}{\|\mathbf{\hat{d}}_1 \times \mathbf{\hat{d}}_2\|}$$
is consistent with propagated angular measurement uncertainties.

To first order, the signed scalar residual:
$$\delta = (\mathbf{p}_1 - \mathbf{p}_2) \cdot \mathbf{\hat{n}}$$
has propagated variance:
$$\sigma_\delta^2 = s^2 \sigma_{1n}^2 + t^2 \sigma_{2n}^2 + \sigma^2_{\text{time}},$$
where
$$\sigma_{in}^2 = \mathbf{\hat{n}}^T \mathbf{\Sigma}_i \mathbf{\hat{n}}$$
represents each ray's 3D angular covariance matrix $\mathbf{\Sigma}_i$ projected directly onto the common normal $\mathbf{\hat{n}}$, and $\sigma^2_{\text{time}} = (\omega \cdot \Delta t)^2$ accounts for timing jitter during angular slew.

**Important Mathematical Distinction**:
- The range-scaled formula $\sigma_\delta^2 = s^2 \sigma_{1n}^2 + t^2 \sigma_{2n}^2$ is the **exact first-order linearization** if and only if $\sigma_{1n}^2$ and $\sigma_{2n}^2$ are directional projected variances along $\mathbf{\hat{n}}$.
- It is **mathematically invalid** if scalar isotropic sigmas are substituted. Because smartphone magnetometer azimuth noise is typically $3\times\text{--}5\times$ larger than accelerometer/gyro elevation noise, $\mathbf{\Sigma}_i$ must be anisotropic in ENU coordinates with proper $\cos(el)$ scaling:
$$\mathbf{\Sigma}_{i,\text{ENU}} = \begin{bmatrix} 
\sigma_{az}^2 \cos^2(el) & \sigma_{az,el} \cos(el) & 0 \\ 
\sigma_{az,el} \cos(el) & \sigma_{el}^2 & 0 \\ 
0 & 0 & 0 
\end{bmatrix}.$$

The normalized test statistic is:
$$\chi^2 = \frac{\delta^2}{\sigma_\delta^2}.$$

Under the linearized null hypothesis (rays originate from a single point source with Gaussian angular errors), $\chi^2 \sim \chi^2(1)$. At the nominal 99% acceptance threshold:
$$\chi^2_{1, 0.99} \approx 6.635.$$

**Linearization Limits**: As $\alpha \to 0$, this linearization degrades because $\mathbf{\hat{n}}$ becomes numerically unstable and slant ranges $s$ and $t$ become noisy, non-linear functions of the observations. The gate is strictly restricted to $\alpha \ge 10^\circ$.

6.8 Range Observability Gate

Rather than relying on angular separation alone, the pipeline gates 3D reconstruction directly on the predicted relative range uncertainty:
$$\frac{\sigma_R}{R} \le \tau_{\text{range}},$$
where $\tau_{\text{range}}$ is frozen before Phase 1 (candidate setting: $\tau_{\text{range}} \le 0.20$, or 20% $1\sigma$ relative range error).

If $\sigma_R / R > \tau_{\text{range}}$, the pipeline automatically declines to output a constrained 3D coordinate, setting terminal status to `INSUFFICIENT_PARALLAX` and falling back to a bearing-only observation record. This prevents false claims of 3D target tracking when baseline parallax is inadequate.
7. Airspace Deconfliction and Knowledge-Base Integration
7.1 General Rule

The knowledge base supplies candidate explanations and reference observations. It does not independently prove an object's identity.

Every candidate match should retain:

    Source and feed version.
    Observation and reference timestamps.
    Position and timing uncertainty.
    Predicted-versus-observed angular residual.
    Relevant covariance or uncertainty model.
    Candidate count and search window.
    Association threshold.
    Estimated chance-match probability, where a defensible estimate exists.
    Alternative candidates and rejection reasons.

A close match is not necessarily unique, and an absent match is not proof that the object is physically exotic.
7.2 Aircraft Telemetry and Latency Correction

Potential sources include ADS-B Exchange, OpenSky Network, and other approved aviation telemetry services.

**Aircraft Velocity and Timestamp Alignment**:
At typical cruise velocities of 200–260 m/s (approx. 400–500 kts), an uncorrected position latency of even 1.0 second introduces 200–260 m of along-track displacement, which completely overwhelms multi-station triangulation geometry. Therefore:
- The pipeline must time-align aircraft positions directly to the raw transponder message reception timestamp, interpolating or extrapolating linearly using the broadcast groundspeed vector only over sub-second intervals ($\Delta t < 1.0$ s).
- Reference aircraft data must be filtered on high-integrity transponder broadcasts: requiring Navigation Accuracy Category for Position ($\text{NAC}_p \ge 8$, $EPU < 92.6$ m) and Navigation Integrity Category ($\text{NIC} \ge 7$, $Rc < 370.4$ m).
- The transponder uncertainty volume must be formally propagated into the reference ground-truth error budget under T4.
- Differences between barometric pressure altitude and geometric GPS ellipsoidal height (WGS84) must be corrected using the nearest NOAA barometric altimeter setting.

7.3 Satellite and Orbital Deconfliction

Potential sources include CelesTrak, Space-Track, and NASA/JPL resources where appropriate.

For each propagated orbit, preserve:

    Element-set source and epoch.
    Propagation model and version.
    Observation time and time scale.
    Estimated positional uncertainty or limitations.
    Observer coordinates.
    Predicted topocentric azimuth and elevation.
    Satellite illumination and relevant viewing geometry.

TLE-derived positions are model estimates, not exact ground truth. Propagation accuracy depends on element age, orbit characteristics, and other conditions.

For the ISS and Starlink, field tests must distinguish optical-bearing validation from range triangulation validation.
7.4 Weather and Balloon Deconfliction

Potential sources include NOAA/National Weather Service data and SondeHub.

Weather information can support hypotheses involving cloud, atmospheric propagation, biological targets, balloons, or optical effects. Radar and weather products must be interpreted within their spatial coverage, temporal resolution, and measurement limitations.

Weather feed absence or low-quality coverage must not be treated as proof that a meteorological explanation is impossible.
7.5 Astronomical Deconfliction and Atmospheric Refraction

NASA/JPL Horizons and other documented ephemeris services can provide reference positions for the Sun, Moon, planets, and selected stars.

The pipeline must use appropriate observer location, observation time, time scale, coordinate frame, and atmospheric assumptions.

**Atmospheric Refraction Correction**:
Optical sightlines below $20^\circ$ elevation suffer non-negligible atmospheric refraction (approx. 1.7 arcmin at $15^\circ$, 3.5 arcmin at $10^\circ$, and over 28 arcmin near the horizon). Refraction must not be left unmodeled:
- For low-elevation sightlines, the pipeline applies the Saemundsson / Bennett standard atmospheric refraction model:
$$R_{\text{refr}} \approx \frac{1.02}{\tan\left(el + \frac{10.3}{el + 5.11}\right)} \cdot \frac{P}{1010} \cdot \frac{283}{273 + T} \quad [\text{arcminutes}].$$
- For all baseline validation tests (T1–T6), a strict minimum elevation floor of $el \ge 10^\circ$ is enforced to prevent low-horizon atmospheric mirages and anomalous ducting from contaminating geometric benchmarks.

7.6 Chance-Match Estimation and Pairing Permutations

The pipeline should not report an unsupported coincidence probability.

Chance-match analysis should consider:

    Candidate density.
    Observation duration.
    Search-window width.
    Angular and timing tolerances.
    Elevation and sky-density distributions.
    Geometry stratum.
    Correlations among candidate tracks.
    Number of candidate identities tested.

T5b uses an empirical null model that permutes observer and object identities within predefined strata while preserving relevant characteristics of the recorded sessions.

The pipeline's reported false-pair estimate must be compared with the empirical null results.
7.7 Reference-Data Governance and Knowledge Base Partitioning

The knowledge base is strictly partitioned into two operational categories:
1. **Operational Telemetry and Ephemeris Feeds (Active Compute)**: External feeds (ADS-B, NORAD TLE, SondeHub, NOAA NEXRAD, JPL Horizons) that directly feed algorithmic matching, spatial deconfliction, and statistical gating.
2. **Background Theoretical and Contextual Literature (Quarantined Reference)**: Observational archives, investigative methodology papers, and theoretical general-relativity literature (e.g., Alcubierre/Lentz solitons). This material is strictly quarantined from real-time operational decision algorithms and unprimed AI inference prompts to prevent speculative confirmation bias or hallucination.

Maintain an audit registry for each external dependency:
Field	Required information
Resource code	Stable identifier
Organization	Publisher or operator
Official URL	Documented source address
Operational category	Operational Compute vs. Quarantined Background Context
Data type	Live feed, archive, publication, or theoretical reference
Retrieval policy	API, scheduled download, manual retrieval, or other method
Version policy	How the source snapshot or publication version is recorded
Uncertainty	Known limitations and relevant measurement errors
Licensing	Access, attribution, and redistribution requirements
Validation status	Verified, pending verification, unavailable, or deprecated
Dependencies	Modules that use the resource
Review date	Last documented source review

A source's presence in the registry does not imply that CSL has operational access to it, has ingested it, or has independently validated its contents.
8. Orientation Calibration and Sensor Fusion
8.1 Opportunistic Calibration and Stellar Astrometry

The proposed calibration method compares the measured bearing to a known reference object:
$$\Delta\theta = \text{wrap}(\theta_{\text{observed}} - \theta_{\text{reference}}).$$

The wrap operation normalizes angular differences across the $0^\circ / 360^\circ$ boundary.

**Sensor Degradation & Sidestepping Magnetometer Noise**:
Smartphone compasses rely on internal magnetometers that are highly vulnerable to local electromagnetic interference, vehicular chassis distortion, and building steel. To achieve sub-degree angular ground truth:
- **Nocturnal Astrometric Plate-Solving (T8)**: Camera boresight orientation is calibrated by plate-solving star fields against the Gaia/Hipparcos catalog from short optical recordings. Stellar plate-solving establishes camera pointing to arcminute accuracy, completely bypassing magnetometer biases.
- **Terrestrial & Opportunistic Calibration**: Distinguishes true-north vs magnetic-north declination, device tilt, and dynamic sensor fusion drift before applying any heading offset.

8.2 Calibration Procedure

    Select a known reference with an adequately constrained position and observation time (surveyed landmark, astronomical ephemeris, or plate-solved star field).
    Compute topocentric azimuth using documented coordinate, time, and atmospheric refraction conventions.
    Record measured bearing, IMU quaternions, and calibration metadata.
    Estimate bias and anisotropic angular covariance.
    Apply the correction only within the verified validity time window and orientation envelope.
    Evaluate performance against independent, held-out objects not used during calibration.
    Report before-and-after bearing errors with exact confidence intervals.

8.3 Sensor Fusion and Dynamic Covariance

The fusion model documents the sources of state estimates, assumptions of independence or cross-correlation, and uncertainties associated with each input.

Correlated camera, IMU, timing, and calibration errors must not be treated as independent merely because they originate from different software modules.

The dynamic covariance matrix $\mathbf{\Sigma}_i$ must explicitly include:
- Sensor noise (optical centroid jitter, accelerometer/gyro stability, magnetometer bias).
- Calibration residual uncertainty from T8 plate-solving.
- Atmospheric refraction residual uncertainty.
- Angular motion slew inflation: $\sigma^2_{\text{ang, slew}} = (\omega \cdot \Delta t)^2$.
9. Research Design and Field Validation
9.1 Study Design

The validation program is a staged characterization study with separate development and validation datasets.
Phase	Purpose	Data policy
Phase 0	Simulation and implementation testing	Synthetic data; assumptions documented
Phase 1	Development and pilot characterization	Data may be inspected and used to select candidate parameters
Freeze	Lock software, thresholds, analysis, and sample-size decisions	Versioned, hashed, timestamped
Phase 2	Independent validation	Fresh data; sealed against interim analysis
Phase 3	Final analysis and reporting	Run the frozen analysis against the sealed validation data

Validation data must not be used to select devices, tune thresholds, modify the covariance model, redefine strata, or alter the hypothesis taxonomy.

Any material modification following a primary-endpoint failure constitutes a new candidate version and requires new validation data.
9.2 Test Matrix
Test	Purpose	Reference	Endpoint	Priority
T0	Validate pairing-gate implementation under the assumed noise model	Simulation truth (composite gate)	Statistic moments, distribution, quantiles, and rejection rates ($N \ge 10^6$ per stratum)	Primary
T0b	Stress-test pairing gate against misspecified noise (heavy tails, shared clock jitter, azimuth bias)	Misspecified simulation	Gate robustness, false-rejection inflation, and breakdown envelope	Primary
T1	Characterize astronomical and satellite bearing measurements	Ephemerides & Gaia/Hipparcos	Azimuth/elevation bias and scatter; residuals by elevation; refraction behavior	Secondary
T2	Evaluate opportunistic orientation calibration	Held-out references	Paired reduction in bearing error and anisotropic covariance	Secondary
T3	Test refusal to claim range when parallax is inadequate (boundary testing)	ADS-B near $\sigma_R/R \approx \tau_{\text{range}}$ & Ephemerides	Count of unsupported range-constrained outputs ($n \ge 60$ boundary trials; target = 0)	Primary
T4	Validate geometric reconstruction (3D ECEF ellipsoid $\chi^2_3 = 7.815$)	Time-aligned ADS-B ($NAC_p \ge 8, NIC \ge 7$) & GPS logs	Confidence-region coverage ($\ge C_{\min}$) and range-error scaling ($n \ge 100$ per stratum)	Primary for coverage
T5a	Test deliberate mismatched-object pairings (statistical power against alternatives)	Known disparate targets	Empirical false-acceptance rate compared against preregistered bounds $\beta_{\text{FA}}(\text{stratum})$	Primary
T5b	Estimate chance-coincidence matches	Empirical permutation null	Expected accidental matches, analytic bounds, and permutation confidence intervals	Primary
T6	Test catalog-blind ground-truth controls (withheld GPS-logged target)	Withheld GPS logger	False-exclusion rate (misidentification as cataloged object; exact Clopper–Pearson)	Primary
T7	Characterize inter-device timing and synchronization jitter	Independent reference clock (PPS/NTP)	Offset error, RTT distribution, and adequacy of temporal variance inflation $\sigma^2_{\text{time}}$	Secondary
T8	Characterize camera/IMU boresight alignment via plate-solving	Star fields (Gaia catalog) & surveyed targets	Boresight attitude bias, optical focal length/distortion, and temporal drift	Secondary
T9	Characterize optical centroid error	Collimated point sources / bright beacons	Centroid bias and scatter by SNR, focus, exposure, and angular velocity $\omega$	Secondary
T10	Measure False Anomaly Rate on known, cataloged air traffic	Continuous ADS-B / commercial flight stream	Rate at which verifiable cataloged aircraft are erroneously classified as `UNRESOLVED_HIGH_RESIDUAL`	Primary
Recall	Measure True-Pair Recall on verified simultaneous multi-station tracks	Verified coincident aircraft tracks	Proportion of true physical pairs successfully admitted by the $\chi^2_{0.99}(1)$ gate (nominal $\ge 99\%$)	Primary
9.3 Field Sites and Baselines

The pilot should select surveyed baselines in the low-kilometer range where practical, with the baseline chosen according to the intended range and predicted angular observability.

The baseline-survey uncertainty should be at least an order of magnitude smaller than the position uncertainty associated with the tested bearing measurements, where feasible.

Record:

    Baseline length and uncertainty.
    Observer positions and height references.
    Surveying method and instrument.
    Baseline orientation.
    Target range and reference uncertainty.
    Predicted convergence angle.
    Predicted range uncertainty.
    Environmental and observation conditions.

A baseline of two kilometers is a candidate configuration, not a universal optimum.
9.4 ISS and Starlink Benchmark

The ISS and bright satellite passes are useful references for bearing characterization, timing, optical centroid behavior, and deconfliction.

They do not ordinarily provide meaningful smartphone-baseline range validation at orbital distances.

For a transverse baseline $B_\perp = 2\text{ km}$ and an orbital target at range $R \approx 420\text{ km}$ (e.g., International Space Station in Low Earth Orbit), the small-angle geometric parallax $\gamma$ is:
$$\gamma \approx \frac{B_\perp}{R}.$$

Substituting $B_\perp = 2\text{ km}$ and $R = 420\text{ km}$:
$$\gamma \approx \frac{2\text{ km}}{420\text{ km}} \approx 0.00476\text{ rad} \approx 0.273^\circ \approx 16.4\text{ arcmin}.$$

This angular difference is comparable to or smaller than the effective bearing uncertainty of a mobile smartphone sensor suite ($\sigma \approx 0.5^\circ = 30\text{ arcmin}$). Actual observability depends on the transverse baseline and the complete error budget.

Consequently:
- **T1** evaluates bearing accuracy, optical centroiding, and residual patterns against ephemerides.
- **T3** tests whether the software correctly declines to claim a constrained range on orbital targets (`INSUFFICIENT_PARALLAX`).
- **T4** must use nearer targets and geometry selected to make range uncertainty meaningful.

9.5 T0 and T0b: Statistical Simulation and Robustness Stress-Testing

T0 tests the actual shipped pairing-gate module using synthetic rays and known noise distributions. Because the epipolar pre-filter and the $\chi^2$ gate evaluate the same underlying coplanarity residual ($m = 0$), T0 evaluates the composite pipeline as shipped.

The simulation must include a preregistered range of geometries, including near-parallel rays, weak convergence angles ($10^\circ \le \alpha \le 20^\circ$), and ill-conditioned baselines.

Sample size requirement: $N \ge 1,000,000$ simulated trials **per stratum**.

Primary checks:
- Mean statistic against the expected value under the null model:
  $$|\bar{T} - 1| < 3\sqrt{\frac{2}{N}},$$
  where $T = \delta^2 / \sigma_\delta^2$ is the test statistic, $E[T] = 1$, and $\text{Var}(T) = 2$ under the central $\chi^2(1)$ distribution.
- Multiplicity control: A $3\sigma$ test across multiple geometry strata incurs family-wise error inflation ($\approx 0.27\%$ per stratum). A preregistered Bonferroni or Holm–Bonferroni correction across the $K$ strata must be applied.
- Full statistic distribution against the theoretical $\chi^2(1)$ CDF via the Kolmogorov–Smirnov test. Because the null distribution is fully specified with fixed degrees of freedom (no fitted parameters), the standard one-sample KS critical value ($D_{\text{crit}} \approx 1.36/\sqrt{N}$ at $\alpha = 0.05$) applies directly.
- Quantile and rejection-rate behavior at the 90%, 95%, 99%, and 99.9% thresholds with exact binomial confidence intervals.
- Correct rejection or observability labeling for degenerate and ill-conditioned cases ($\|\mathbf{\hat{b}} \times \mathbf{d}_1\| < 0.05 \implies \text{ILL\_CONDITIONED\_GEOMETRY}$).

T0b: Robustness and Noise Misspecification Protocol:
T0 establishes implementation fidelity under its idealized Gaussian assumptions. To evaluate gate breakdown under realistic sensor degradation, T0b injects misspecified error models:
- Heavy-tailed angular errors: Student-$t$ distributions ($\nu = 3$ to $5$) simulating unmodeled optical distortion or outlier centroiding.
- Correlated shared-clock errors and cross-station timing jitter ($\Delta t \sim \mathcal{N}(0, \sigma^2_{\text{jitter}})$ with burst correlation).
- Unmodeled magnetometer azimuth bias (systematic offsets of $2^\circ$ to $5^\circ$ between stations).
T0b records the gate's false-rejection inflation rate, true-pair recall loss, and determines the operational breakdown envelope where the nominal $\chi^2(1)$ model fails.

9.6 T1: Bearing Characterization

Collect observations of suitable ISS passes, bright satellites, planets, and bright stars where practical.

For each observation, record:
- Device and camera configuration.
- Reference azimuth and elevation.
- Observed azimuth and elevation.
- Angular residuals and uncertainty.
- Optical centroid quality.
- Temperature, pressure, and humidity when available.
- Time offset and uncertainty.
- Elevation and atmospheric conditions.
- Whether refraction is modeled (using Saemundsson / Bennett formulation for $el < 20^\circ$, or applying a strict minimum elevation floor $el \ge 10^\circ$).

Analyze residual bias and scatter by device, pose, elevation, and relevant quality strata.

Atmospheric refraction must be described as unmodeled unless the preregistered analysis demonstrates that its contribution is negligible within the tested conditions.

9.7 T2: Orientation Calibration

Use one set of known references to estimate the correction and a separate held-out set to measure its performance.

Report:
- Before-calibration error.
- After-calibration error.
- Paired error differences.
- Confidence intervals.
- Number and quality of usable observations.
- Device-specific results.
- Evidence of drift or limited calibration validity.

9.8 T3: Inadequate-Parallax Control (Boundary Testing)

T3 tests whether the software correctly declines to claim an unconstrained or false range when optical parallax is geometrically inadequate.

Target Selection: Testing against orbital satellites alone (e.g., ISS at 420 km) is nearly trivial because predicted range uncertainty $\sigma_R/R \gg 100\%$ easily triggers any threshold. Therefore, T3 mandates **boundary testing**:
- Targets must include real aircraft flying at ranges where predicted relative range uncertainty $\sigma_R/R \approx \frac{\sqrt{2}\sigma}{\alpha}$ is near the frozen threshold $\tau_{\text{range}}$ (typically 12–25 km on a 2 km baseline), in addition to high-altitude and orbital passes.
- Sample Size: A minimum of $n \ge 60$ independent boundary trials is required. Under the zero-failure rule, $n = 60$ establishes a one-sided 95% upper confidence bound on the failure rate of $\le 5\%$ ($3/n \approx 0.05$). Achieving a 1% upper bound requires $n \ge 299$ boundary trials.

The primary requirement is zero outputs claiming a geometrically constrained range in $n$ applicable boundary trials. Any unsupported constrained-range output is a protocol failure. A POCA coordinate with an explicit `INSUFFICIENT_PARALLAX` or `WIDE_UNCERTAINTY` status is required.

9.9 T4: Triangulation Validation and Error Scaling

Use ADS-B aircraft tracks and GPS-logged controlled targets with rigorously verified reference accuracy.

Reference Truth Error Budget:
- Aircraft Position Latency: Aircraft cruising at 250 m/s travel 250 meters in a single second. ADS-B reference truth must be time-aligned to the exact broadcast message epoch ($\Delta t \le 0.1\text{ s}$).
- Integrity Filtering: ADS-B data must be filtered on Navigation Accuracy Category for Position ($NAC_p \ge 8$, corresponding to $EPU < 92.6\text{ m}$) and Navigation Integrity Category ($NIC \ge 7$, $R_c < 370.4\text{ m}$).
- Altitude Correction: Geometric GPS altitude must be distinguished from barometric pressure altitude, with local barometric altimeter settings ($QNH$) from NOAA weather feeds applied to eliminate vertical datum offsets.

Region Dimension and Coverage Endpoint:
- The principal metric is empirical coverage of nominal 95% uncertainty regions.
- Region Dimension: The confidence region must be evaluated as a **3D ECEF covariance ellipsoid** at the $\chi^2_3 = 7.815$ contour ($p = 0.05$ for 3 degrees of freedom), or as a range-only 1D interval ($\chi^2_1 = 3.841$) when explicitly noted. The dimensionality must be unambiguously recorded.
- Sample Size Planning: To demonstrate that true coverage $\ge 95\%$ exceeds a lower confidence bound $C_{\min} = 0.90$ at $\alpha = 0.05$, a minimum of $n \ge 50\text{--}60$ clean events per stratum is required; preregistering $n \ge 100$ events per stratum is recommended for robust statistical power.

Range-error behavior must be evaluated against the theoretical first-order geometric scaling:
$$\sigma_R \approx \frac{R^2}{B_\perp} \sqrt{\sigma_1^2 + \sigma_2^2},$$
where $B_\perp = \|\mathbf{p}_2 - \mathbf{p}_1\| \sin\alpha$ represents the baseline component transverse to the line of sight, and $\sigma_1, \sigma_2$ are the 1D angular measurement errors.

9.10 T5a and T5b: False Pairings and Empirical Null

T5a and T5b evaluate observer-to-observer ray pairing discrimination:

T5a: Statistical Power Against Non-Coincident Ray Alternatives:
The null hypothesis of the pairing gate is $H_0$: "Rays from Station 1 and Station 2 originate from the same physical target." Deliberately pairing mismatched observations of different known targets observed at similar times constitutes testing against alternative hypotheses ($H_1$).
- The acceptance rate in T5a measures the gate's statistical power to reject false geometric crossings, which depends strongly on crossing angle and target distance.
- It is not an accidental count to compare with an empirical null; rather, the PI must preregister explicit per-stratum upper bounds on false-acceptance rates $\beta_{\text{FA}}(\text{stratum})$.

T5b: Empirical Permutation Null:
T5b permutes observer and object identities across independent temporal windows within predefined strata, preserving sky density, elevation distribution, time-of-night characteristics, angular error properties, and candidate track counts.
- Reports empirical expected accidental matches, exact confidence intervals, and compares them with the pipeline's analytic chance-match Poisson model.

9.11 T6: Catalog-Blind Ground-Truth Control

Operate a known GPS-logged target (e.g., drone or light aircraft with differential GPS logger) while withholding its identity from the pipeline and ensuring that the target is strictly absent from every catalog used by the deconfliction service.

Any conventional identification assigned to the target counts as a false exclusion for this test, even if it falls within a chosen association tolerance.

Report the false-exclusion rate using both:
- **One-sided 95% Upper Bound** (exact Binomial / Rule of Succession for zero observed failures in $n$ independent trials):
  $$p_{\text{upper, 95\%}} = 1 - (0.05)^{1/n} \approx \frac{-\ln(0.05)}{n} \approx \frac{2.996}{n} \approx \frac{3}{n}.$$
- **Two-sided 95% Clopper–Pearson Upper Bound** ($\alpha/2 = 0.025$ upper tail):
  $$p_{\text{CP, upper, 95\%}} = 1 - (0.025)^{1/n} \approx \frac{-\ln(0.025)}{n} \approx \frac{3.689}{n} \approx \frac{3.7}{n}.$$

Sample Size Planning:
- For a one-sided 95% upper bound of 5% ($p \le 0.05$), $n \ge 59$ clean trials with 0 failures are required ($3 / 59 \approx 0.0508$).
- For a one-sided 95% upper bound of 1% ($p \le 0.01$), $n \ge 299$ clean trials with 0 failures are required ($2.996 / 299 \approx 0.0100$).

9.12 T7–T9: Timing, Alignment, and Centroid Tests

T7 measures actual inter-device timing error against an independent reference clock (GNSS-PPS or disciplined NTP).

T8 characterizes camera/IMU boresight alignment, focal length, lens distortion, and IMU-to-shutter latency via nocturnal star-field plate-solving against the Gaia catalog.

T9 characterizes optical centroid performance (bias, jitter, point-spread function asymmetry) under controlled image-quality conditions as a function of SNR, focus, exposure, and angular slew rate $\omega$.

9.13 T10: False Anomaly Rate on Known Traffic & True-Pair Recall

A "check-engine light" instrument lives or dies by its false-alarm rate. False anomalies corrupt scientific credibility and waste scarce analytical resources.

T10: False Anomaly Rate on Cataloged Air Traffic:
- Continuous streams of verified commercial and general aviation traffic (ADS-B with $NAC_p \ge 8$) are tracked by the dual-station optical pipeline under nominal atmospheric conditions.
- Endpoint: Measure the proportion of verified, cataloged flights that erroneously fail deconfliction and are classified as `UNRESOLVED_HIGH_RESIDUAL`.
- The false anomaly rate must be bounded below a preregistered maximum allowable threshold (e.g., $FAR \le 0.001$). Every false anomaly must undergo forensic failure analysis (e.g., timing dropout, unmodeled glare, ephemeris latency).

True-Pair Recall:
- Measure the empirical recall on verified coincident multi-station detections of real aircraft.
- At a nominal $\chi^2_{0.99}(1)$ gate threshold ($\chi^2 \le 6.635$), exactly $1.0\%$ of true physical pairs are expected to be rejected in a theoretically perfect Gaussian model.
- Empirical True-Pair Recall must be quantified across geometry strata to confirm that actual sensor noise does not induce catastrophic under-recall (target recall $\ge 98.5\%$).
10. Statistical Analysis Plan and Acceptance Criteria
10.1 Primary Endpoints

The following primary endpoints are assessed separately as independent engineering gates:
- **T0 & T0b**: Pairing-gate statistical calibration and robustness under noise misspecification.
- **T3**: Refusal to claim unobservable range (zero failures in $n \ge 60$ boundary trials).
- **T4**: Coverage of nominal 95% 3D geometric uncertainty regions ($\chi^2_3 = 7.815$) meeting or exceeding $C_{\min}$.
- **T5a**: False-acceptance rate on deliberately mismatched pairs bounded below preregistered $\beta_{\text{FA}}(\text{stratum})$.
- **T5b**: Coincidence matching rate consistent with the empirical permutation null and analytic Poisson model.
- **T6**: False-exclusion rate for catalog-blind ground-truth controls meeting preregistered Clopper–Pearson upper bound.
- **T10**: False anomaly rate on known, cataloged air traffic bounded below $FAR_{\max}$.
- **Recall**: True-pair recall on verified simultaneous tracks meeting or exceeding $R_{\min} \ge 98.5\%$.

Passing one endpoint does not compensate for failing another.

10.2 Pilot Parameters and Author Decisions

The following values remain unresolved until the pilot and independent review are complete.
Parameter	Decision source	Required action
Optical contrast and stable-duration thresholds	Pilot	Estimate from development data and freeze
Angular covariance model ($\mathbf{\Sigma}_i$)	Pilot & Human Reviewer	Specify axes, anisotropic ENU scaling ($\cos(el)$), units, correlations, and T8 plate-solving estimation method
Minimum convergence angle floor ($\alpha$)	Pilot & Human Reviewer	Validate numerical conditioning and freeze threshold ($\alpha \ge 10^\circ$)
Range observability threshold ($\tau_{\text{range}}$)	Pilot	Define relative range uncertainty cutoff ($\sigma_R/R \le \tau_{\text{range}}$) for constrained range claim
Geometry-stratum boundaries	Pilot	Pre-register bins (baseline, range, elevation, slew rate)
Minimum sample size per stratum, $n_{\min}$	Pilot & Protocol	Set $n_{\min} \ge 60$ (recommended $n \ge 100$) before validation
Minimum coverage bound, $C_{\min}$	Principal Investigator	Choose before validation (nominal 95% coverage; $C_{\min} \ge 0.90$)
Maximum acceptable false-exclusion bound	Principal Investigator	Choose before validation (e.g., upper 95% bound $\le 0.05$)
Maximum false anomaly rate, $FAR_{\max}$	Principal Investigator	Choose before validation (e.g., $FAR_{\max} \le 0.001$) on cataloged traffic
Minimum true-pair recall, $R_{\min}$	Principal Investigator	Choose before validation ($R_{\min} \ge 0.985$ at $\chi^2_{0.99}(1)$ gate)
Mismatched false-accept bounds, $\beta_{\text{FA}}(\text{stratum})$	Principal Investigator	Preregister per-stratum upper bounds based on crossing geometry
Gate thresholds and degrees of freedom	Human Reviewer	Validate 1-DOF Jacobian linearization and composite gate implementation
Statistical significance levels	Protocol	Fix family-wise multiplicity corrections ($\alpha = 0.05$) before validation
Exclusion and deviation rules	Protocol	Freeze before validation

10.3 T4 Coverage Requirement

For every preregistered stratum with $n \ge n_{\min}$ (where $n_{\min} \ge 60$ is preregistered), the one-sided lower 95% confidence bound on nominal 95% 3D uncertainty region coverage must be at least $C_{\min}$.

The 3D uncertainty region must be mathematically evaluated as an ECEF covariance ellipsoid ($\chi^2_3 = 7.815$). Range-only 1D intervals must be designated separately and not substituted for 3D coverage.

The value of $C_{\min}$ is an explicit author decision. It must not be selected after the validation data are opened.

Strata below $n_{\min}$ are reported as not characterized and excluded from the associated performance claim.

10.4 T5 Acceptance Rule

T5 separates alternative power testing from accidental background hazard modeling:
- **T5a (Power Against False Intersections)**: The observed false-acceptance rate for deliberately mismatched tracks must not exceed the preregistered stratum-specific bound $\beta_{\text{FA}}(\text{stratum})$ at the $\alpha = 0.05$ significance level. This confirms the gate has adequate statistical power to reject non-coincident trajectories.
- **T5b (Empirical Null Consistency)**: The empirical permutation false-match rate must be statistically consistent with the pipeline's reported analytic Poisson chance-coincidence estimate, with empirical counts falling within the predicted 95% Poisson interval.

The exact statistical test and acceptance bounds must be specified in the preregistration document before validation data are opened.
10.5 General Statistical Reporting

For each primary endpoint, report:

    Numerator and denominator.
    Point estimate.
    Confidence interval.
    Data-quality distribution.
    Device and geometry strata.
    Missing data and exclusions.
    Deviations from protocol.
    Reference uncertainty.
    Calibration diagnostics.
    Failure cases and their implications.

Avoid presenting a single aggregate accuracy percentage that conceals weak geometries or poorly performing devices.
10.6 Multiple Endpoints

The protocol assesses multiple primary endpoints. The report must specify whether the acceptance framework is a collection of independent engineering gates or a formal family of inferential claims.

If family-wise inferential error control is intended, its method must be preregistered. If the endpoints are treated as separate instrument acceptance gates, report them separately without implying a single composite statistical conclusion.
11. Operational Procedures and Quality Assurance
11.1 Before Each Session

    Verify software release and configuration hash.
    Verify device identity, browser version, and camera settings.
    Confirm calibration status.
    Confirm the independent timing-reference procedure.
    Survey or verify observer positions.
    Record environmental conditions.
    Verify reference-feed availability and version.
    Confirm recording and manifest-export procedures.
    Confirm required safety permissions.
    Assign the control operator and pipeline operator roles.

11.2 During Each Session

    Preserve original recordings and all delivered sensor events.
    Avoid changing camera settings without recording the change.
    Record unexpected interruptions and data gaps.
    Keep the control operator's ground-truth records separate from the pipeline operator.
    Record deviations with timestamps and explanations.
    Do not alter frozen thresholds in response to apparent results.

11.3 After Each Session

    Export raw artifacts and integrity manifests.
    Verify artifact hashes.
    Record missing files and failed transfers.
    Preserve reference-data versions and retrieval times.
    Confirm that the dataset contains the required timing and calibration metadata.
    Store the control truth separately when blinding applies.
    Document every exclusion and deviation.

11.4 Exclusion Rules

Permitted predefined exclusion reasons are:

    Total cloud obscuration.
    Device crash or data corruption.
    Reference-feed outage.
    Safety stop.

Other events remain in the dataset and are flagged unless a documented deviation procedure authorizes a different treatment.

Never delete an event merely because its result is inconvenient or unexpected.
12. Data Governance, Privacy, Safety, and Legal Compliance
12.1 Data Tiers
Tier	Contents	Access
Tier 0	Raw private data, identifiable video, precise observer positions, and restricted metadata	Restricted
Tier 1	De-identified research dataset	Approved research access
Tier 2	Public derived measurements with appropriate location and time coarsening	Public, subject to disclosure risk
Tier 3	Aggregate statistics, validation metrics, and summaries	Public where permitted

Video may remain identifiable even when names and direct identifiers are removed. Background landmarks, audio, timestamps, and track geometry can reveal a participant's location.
12.2 Consent and Privacy

    Obtain informed consent for each intended data tier.
    Minimize collection of bystanders and private property.
    Avoid publishing unnecessary precise observer coordinates.
    Apply location and timestamp coarsening before public release where re-identification is plausible.
    Establish retention, deletion, access-control, and incident-response procedures.
    Review whether location, device, or video data trigger additional legal obligations.

12.3 Safety

    Comply with applicable aviation rules and local regulations.
    Obtain required permissions for controlled targets.
    Do not direct lasers or other potentially distracting lights toward aircraft.
    Avoid test configurations that interfere with aircraft operations.
    Do not launch drones or balloons without the required authorization and safety controls.
    Maintain a safety-stop procedure independent of experimental objectives.

12.4 Reference-Data Licensing

Before redistribution, review the terms governing ADS-B aggregators, Space-Track, commercial feeds, weather archives, and other third-party sources.

Where redistribution is prohibited, publish permitted source pointers, retrieval metadata, and hashes instead of the restricted data.

The MIT license for original project code does not override third-party data licenses or grant rights to materials owned by other organizations.
13. Results Reporting and Scientific Interpretation
13.1 Required Results

The final validation report must include:

    All primary-endpoint results, including failures.
    Every tested device and its relevant configuration.
    Per-stratum results and explicit not-characterized strata.
    All exclusions and protocol deviations.
    Confusion tables with plain-language labels.
    Reference-data versions and uncertainty assumptions.
    Gate-statistic distribution plots and QQ plots.
    Coverage and uncertainty-region-size summaries.
    False-pair and false-exclusion analyses.
    Timing, camera/IMU, and centroid characterization.
    Software commit and frozen configuration hashes.
    Analysis code and reproducibility instructions, subject to privacy and licensing restrictions.

13.2 Confusion-Matrix Categories

At minimum, distinguish:

    Correct conventional identification.
    False conventional identification.
    False anomaly.
    Insufficient telemetry.
    Uncataloged conventional object.
    Physically unresolved residual.

These categories must be defined before validation and applied consistently.

A case that lacks adequate data must not be counted as either a successful identification or an anomalous detection.
13.3 Interpreting Unresolved Cases

A physically unresolved residual means that the available measurements remain inconsistent with the tested explanations, or that the data are insufficient to discriminate among the remaining hypotheses.

It does not independently establish:

    Non-human origin.
    Novel propulsion.
    Violation of known physics.
    Absence of all conventional explanations.
    Correctness of the sensor model.

The appropriate scientific response is to identify the measurement gap, state the tested hypotheses, and specify what additional observation would discriminate among them.
13.4 AI-Assisted Review Disclosure

AI systems may assist with literature organization, mathematical review, code review, experimental design, and editorial work.

AI agreement is not independent empirical validation.

Publications should disclose AI-assisted design or writing according to the target venue's requirements. Reviewers should not be described as having audited source code or reproduced experiments unless they actually did so.
14. Project Governance, Versioning, and Release Management
14.1 Roles

Principal Investigator: Gregory Tafoya, MPH, responsible for research priorities, ethics, protocol preregistration, final acceptance decisions, and publication approval.

Implementation author: Responsible for code provenance, build reproducibility, implementation documentation, and correction of identified defects.

Independent Technical Reviewer (Mandatory Human Sign-Off): A qualified external human geodesist, aerospace engineer, or mathematical statistician. The reviewer independently audits the vector geodesy derivations, directional Jacobian linearizations, anisotropic covariance propagation matrices, statistical gate implementations, and T0 simulations before the pilot. (The AI advisory panel—Gregory Tafoya, MPH [PI], Claude Sonnet 5.5 [Vector Geodesy & Covariance], Gemini 3.8 Flash [Production Build & Web Architecture], and Luna/ChatGPT-4o [Statistical Architecture]—functions strictly in a consultative, peer-dialogue capacity; AI consensus does not constitute independent validation).

Control operator: Maintains ground-truth information for blinded tests (T6) without access to pipeline execution.

Pipeline operator: Runs the frozen pipeline without access to withheld control identities and timings.

Analyst: Receives the sealed truth after the frozen analysis lock.

Where one person must fill multiple roles, the limitation and its likely consequences must be disclosed.
14.2 Versioning Policy

    Development revisions: Parameters and implementation may change; results are exploratory.
    Candidate validation revision: Protocol and thresholds are specified but not frozen.
    Frozen validation release: Software, configuration, hypotheses, analysis code, and acceptance criteria are versioned and hashed.
    Corrective release: Any material change after a primary-endpoint failure receives a new version and is evaluated with new validation data.
    Knowledge-base revision: Changes to a reference source, association rule, or source weighting are documented independently of the frozen experimental configuration.

14.3 Resource Change Control

Every knowledge-base change must include:

    Resource code.
    Change type: add, remove, disable, or adjust weighting.
    Reason for change.
    Affected analytical modules.
    Effective version.
    Validation implications.
    Review and approval record.

Removing a source from a registry does not automatically remove its effects from compiled software, cached data, prompts, or deployed services. Each dependent component must be identified and tested.
15. Implementation Verification and Outstanding Engineering Work
15.1 Developer-Reported Status

The following claims originate from the implementation description and remain subject to independent verification.
Component	Reported status	Verification required
IMU acquisition	30 Hz capture target met	Measure delivered rate, interval distribution, and gaps on each device
Timestamping	Monotonic timestamps with UTC-offset and RTT logging	Measure actual offset error and jitter against an independent reference clock (GNSS-PPS)
Hashing & Integrity	SHA-256 through Web Crypto; IndexedDB vault	Confirm exact hashed artifacts, manifest completeness, and RFC 3161 / OpenTimestamps anchoring
Statistical gate	One-degree-of-freedom composite gate implemented	Independent human derivation review and T0/T0b against shipped code
Observability threshold	Convergence angle floor ($10^\circ$) and range gate ($\sigma_R/R \le \tau_{\text{range}}$)	Review geometric conditioning, error scaling, and validate threshold
Timing uncertainty	Angular-rate/timing variance inflation implemented	Derive $\sigma^2_{\text{time}}$ model and evaluate it against T7
Camera control	Partially implemented	Characterize camera settings, intrinsics, and platform-specific behavior
Peer-to-peer pairing	Pending field pilot	Document signaling, connectivity, failure behavior, and synchronization
Baseline survey	Pending pilot	Verify survey method, height reference, and uncertainty
Camera/IMU boresight	Pending pilot	Complete T8 star-field plate-solving characterization against Gaia catalog

These statuses should not be represented as independent test results.
15.2 Mandatory Pre-Pilot Verification

Before Phase 1:

    Obtain the actual source code and identify the shipped triangulation module.
    Independent human geodesist / statistician review of the mathematical derivation, directional Jacobians, and sign conventions.
    Confirm the production code uses the reviewed directional covariance formulation.
    Run T0 and T0b against the exact module used by the PWA.
    Verify raw-data preservation, manifest export, and external cryptographic timestamping.
    Test timing metadata and failure modes on every planned device.
    Confirm that unobservable range is represented explicitly with appropriate terminal status codes.
    Document WebRTC signaling and pairing failure behavior.
    Verify source-feed retrieval and provenance recording.
    Resolve all safety and privacy prerequisites.

A separately written simulation or reference implementation is useful for comparison but does not replace testing the actual shipped module.
16. Principal Investigator Freeze Checklist

The validation protocol becomes frozen only after all required items have been completed, reviewed, and recorded.

    Software commit and version identified.
    Configuration hash generated.
    Calibration parameters documented.
    Covariance assumptions and correlations documented.
    Camera-intrinsics model specified.
    Pairing thresholds and gate levels fixed.
    Observability threshold fixed.
    Hypothesis taxonomy locked.
    Geometry strata and boundaries defined.
    $n_{\min}$ selected for each applicable stratum.
    $C_{\min}$ selected for T4 (3D coverage bound).
    Maximum acceptable T6 false-exclusion bound selected.
    Maximum acceptable T10 false anomaly rate ($FAR_{\max}$) selected.
    Minimum true-pair recall ($R_{\min}$) selected.
    All remaining pilot and author parameters resolved.
    Ephemeris, ADS-B, and weather sources and version policies specified.
    Device models, operating systems, browser versions, and camera settings listed.
    Baseline survey results documented.
    Synchronization procedure documented.
    Analysis code hashed.
    Sample sizes and stopping rules specified.
    Exclusion rules and deviation procedures approved.
    Independent mathematical and code review completed.
    T0 implementation verification completed.
    No validation data used to select parameters or hypotheses.
    Preregistration deposited in a timestamped registry before validation collection.
    Principal Investigator approval and date recorded.

Freeze declaration: This checklist is not complete merely because it appears in this document. The responsible individuals must record completion and supporting evidence for each item.
17. Limitations and Risk Register
Risk	Consequence	Mitigation
Smartphone bearing noise	Poor range estimates or false geometric associations	Characterize angular errors and propagate uncertainty
Near-parallel rays	Ill-conditioned range estimates	Explicit observability checks and rejection states
Camera/IMU misalignment	Systematic bearing bias	T8 calibration and versioned correction
Timing offset	Incorrect association of moving objects	T7 characterization and timing-uncertainty propagation
Reference-feed latency or gaps	Incorrect deconfliction	Record feed versions, snapshots, latency, and coverage limitations
Catalog coincidence	False conventional identity	Empirical null model, residual reporting, and T6 controls
Incorrect covariance model	Miscalibrated statistical gates	Independent derivation review and T0–T9 characterization
Atmospheric refraction	Elevation-dependent bearing bias	T1 residual analysis; model if materially non-negligible
Device variability	Overgeneralized performance claims	Report per-device and per-stratum results
Browser event loss	Incomplete sensor records	Preserve delivered events and infer gaps from timestamps
Re-encoded-only video	Loss of original sensor evidence	Preserve original recordings and derived artifacts separately
Unverified case descriptions	Incorrect training or evaluation assumptions	Source verification and provenance labels
AI-generated assertions	Unwarranted confidence in unverified claims	Independent review and explicit disclosure
Privacy leakage	Participant or site identification	Data-tier controls, location coarsening, and access restrictions
Post hoc tuning	Inflated apparent performance	Sealed validation data and frozen analysis
18. Knowledge Base Resource Registry
18.1 Registry Policy

The following registry consolidates the external source families proposed for CSL. It is an intended source inventory, not a certification that every named document exists, that every URL resolves, or that every feed has been integrated.

Resource status must be updated following an actual source review. Detailed case-level assertions must be checked against the underlying primary documents before they are used as experimental ground truth.
Tier I — Government, Defense, and Aerospace Sources
Code	Resource	URL	Intended role
KB-T1-01	DoD All-domain Anomaly Resolution Office (AARO)	https://www.aaro.mil/	Official reports, case resolutions, and UAP records
KB-T1-02	Proposed PURSUE / UAP disclosure materials	https://www.war.gov/ufo/	Candidate government disclosure source; verify initiative name, domain, and individual records
KB-T1-03	NASA UAP research	https://science.nasa.gov/uap/	Scientific methods and sensor-data recommendations
KB-T1-04	CNES / GEIPAN	https://www.cnes-geipan.fr/	French UAP case investigations and classification
KB-T1-05	Office of the Director of National Intelligence	https://www.dni.gov/	Intelligence assessments and historical reports
KB-T1-06	Defense Visual Information Distribution Service	https://www.dvidshub.net/	Publicly available defense imagery and associated metadata
KB-T1-07	National Archives and Records Administration	https://www.archives.gov/	Government archival records and collection provenance

Source-review requirement: Verify case identifiers, publication dates, quoted confidence assessments, resolutions, and exact titles against the primary records. Do not assume that a case described as unresolved is a positive control for novel physics. An unresolved classification may reflect limited information, attribution uncertainty, or other investigative limitations.
Tier II — Academic and Institutional Sources
Code	Resource	URL	Intended role
KB-T2-01	Americans for Safe Aerospace	https://www.safeaerospace.org/	Aviation safety and reporting context
KB-T2-02	Americans for Safe Aerospace media channel	https://www.youtube.com/@safeaerospace	Interviews and testimony; secondary source material
KB-T2-03	American Institute of Aeronautics and Astronautics	https://www.aiaa.org/	Aerospace engineering and aviation safety literature
KB-T2-04	Scientific Coalition for UAP Studies	https://www.explorescu.org/	Published UAP case analyses and technical papers
KB-T2-05	Society for UAP Studies	https://www.societyforuapstudies.org/	Interdisciplinary research and publications
KB-T2-06	The Galileo Project	https://projects.iq.harvard.edu/galileo	Instrumented observation and scientific measurement concepts
KB-T2-07	The Sol Foundation	https://thesolfoundation.org/	Research, policy, and governance materials

Institutional affiliation does not automatically establish that an individual analysis is peer reviewed or that its conclusions have been independently reproduced. Record the publication type and review status for each ingested item.
Tier III — Autonomous Observation Networks
Code	Resource	URL	Intended role
KB-T3-01	Skywatcher.ai	https://skywatcher.ai/research	Candidate automated sky-observation and tracking research
KB-T3-02	Sky360 Network	https://www.sky360.org/	Open-source automated optical observatory architecture
KB-T3-03	UFO Data Acquisition Project (UFODAP)	https://ufodap.com/	Candidate multi-sensor observation hardware and software
KB-T3-04	Project Hessdalen	https://www.hessdalen.org/	Field observation and instrumentation references

For each network, verify actual hardware configurations, sensor specifications, published data, and operational status before treating its output as an authoritative reference.
18. Vetted Empirical Knowledge Base and Operational Partitioning

To maintain epistemological rigor and prevent confirmation bias, the knowledge base is formally partitioned into **Operational Data (Active Compute)**, **Institutional & Observational Context**, and **Quarantined Background Theoretical Literature**.

18.1 Operational Telemetry & Active Deconfliction (Compute Feeds)

These resources feed active computational algorithms (ephemeris lookup, trajectory deconfliction, SGP4 propagation, barometric altitude correction). Every feed must record exact retrieval epochs, latency, covariance, and versioning.
Code	Resource	URL	Intended role	Compute status
KB-T4-01	CelesTrak	https://celestrak.org/	NORAD TLE element sets and orbital propagation (SGP4)	Active Compute
KB-T4-02	Space-Track	https://www.space-track.org/	Authoritative 18th Space Defense Squadron TLE catalog	Active Compute
KB-T4-03	ADS-B Exchange	https://www.adsbexchange.com/	Unfiltered aviation transponder stream (velocity time-aligned, $NAC_p \ge 8$)	Active Compute
KB-T4-04	OpenSky Network	https://opensky-network.org/	Academic aircraft telemetry and historical trajectory database	Active Compute
KB-T4-05	Flightradar24	https://www.flightradar24.com/	Supplementary aviation feed (subject to filtering terms)	Supplementary
KB-T4-06	SondeHub	https://sondehub.org/	Radiosonde telemetry and meteorological balloon tracking	Active Compute
KB-T4-07	NOAA / National Weather Service	https://www.weather.gov/	NEXRAD radar, pressure altimeter ($QNH$), and atmospheric refraction inputs	Active Compute
KB-T4-08	NASA/JPL Horizons	https://ssd.jpl.nasa.gov/horizons/	High-precision solar-system ephemerides for planets and bright stars	Active Compute
KB-AST-01	Gaia / Hipparcos Astrometric Catalog	https://www.cosmos.esa.int/gaia	Stellar astrometric references for T8 nocturnal boresight plate-solving	Active Compute

18.2 Institutional, Scientific & Observational Context (Reference Baseline)

These repositories provide official case histories, instrument calibration methods, and aerospace baseline context. They represent institutional context and advocacy/investigative reporting; they do **not** directly execute in computational geometric pipelines.
Code	Resource	URL	Intended role
KB-T1-01	All-domain Anomaly Resolution Office (AARO)	https://www.aaro.mil/	DoD baseline reporting standards, unclassified case resolutions, and reporting parameters
KB-T1-02	NASA UAP Independent Study Team	https://science.nasa.gov/uap/	Data collection frameworks, sensor calibration guidelines, and atmospheric roadmap
KB-T1-03	CNES / GEIPAN	https://www.cnes-geipan.fr/	French Space Agency 40-year field database and Category A–D methodology
KB-T1-04	Office of the Director of National Intelligence (ODNI)	https://www.dni.gov/	Annual threat assessments and Five Observables criteria baseline
KB-T1-05	U.S. Department of War (DoW) / PURSUE	https://www.war.gov/ufo/?releaseDate=Release+07&release=07	Presidential Unsealing and Reporting System for UAP Encounters (PURSUE); Release 07 multi-agency declassified investigative dossiers
KB-T2-01	AIAA UAP Integration & Outreach Committee	https://www.aiaa.org/	Aerospace engineering, aviation flight safety, and technical measurement parameters
KB-T2-04	Scientific Coalition for UAP Studies (SCU)	https://www.explorescu.org/	Kinematic radar reconstruction and peer-reviewed acceleration studies
KB-T2-05	Society for UAP Studies (SUAPS)	https://www.societyforuapstudies.org/	Interdisciplinary peer-reviewed academic publications (*Limina*)
KB-T2-06	The Galileo Project (Harvard University)	https://projects.iq.harvard.edu/galileo	Multispectral observatory designs, sensor architectures, and instrumented search
KB-T2-07	The Sol Foundation	https://thesolfoundation.org/	Academic policy and scientific research framework
KB-T3-01	Skywatcher.ai	https://skywatcher.ai/research	AI-driven computer vision and atmospheric anomaly discrimination
KB-T3-02	Sky360 Network	https://www.sky360.org/	Global citizen-science automated sky observatory network
KB-T3-03	UFODAP	https://ufodap.com/	Multispectral optical tracking hardware stations
KB-T3-04	Project Hessdalen	https://www.hessdalen.org/	Long-running automated electromagnetic, optical, and radar field station (Norway)

18.2.1 U.S. Department of War PURSUE Release 07 Ingestion (October 23, 2026)

On October 23, 2026, the United States Department of War published Release 07 under the Presidential Unsealing and Reporting System for UAP Encounters (PURSUE) at `https://www.war.gov/ufo/?releaseDate=Release+07&release=07`. This tranche consists of 28 PDF reports encompassing over 1,100 pages of multi-agency documentation (bringing the cumulative defense portal repository to 478 declassified records).

The Check Sky Light (CSL) knowledge base absorbs these primary defense records into its diagnostic baseline, specifically updating empirical cross-validation requirements, optical-kinematic correlation matrices, and fluid-interaction metrics.

#### Key Case Studies & Technical Dossiers Ingested:

1. **Contemporary Tactical Encounter: DOW-UAP-D176 (AARO Memorandum for Record) & FBI-UAP-D043 (FBI FD-302 Interview Report)**
   - **Chronology & Geospatial Setting**: 2026 multi-witness sighting by federal law enforcement special agents and defense contractors adjacent to a secure test range facility in the western United States.
   - **Target Morphology & Optical Signatures**: Symmetrical equilateral triangle, estimated wingspan 13–15 feet, matte non-reflective black finish, razor-sharp geometric edges with zero visible control surfaces, flight surfaces, rotor assemblies, seams, or exhaust apertures.
   - **Kinematic & Boundary-Layer Dynamics**: Executed a controlled vertical ascent, established a stationary silent hover at ~300 ft AGL for approximately 20 seconds directly above observer coordinates, followed by an abrupt rapid pitch-axis reorientation and high-velocity ingress through an undulating canyon corridor at high subsonic/supersonic speeds without acoustic shockwave (sonic boom) or thermal signature.
   - **Critical Physical Observables**:
     - *Zero Barometric Downwash*: Ground observers and vegetation directly underneath the stationary 300-ft hover reported zero air disturbance, rotor wash, dust displacement, or barometric micro-pressure drops.
     - *Absence of Thermal Exhaust Plume*: Mid-wave and long-wave infrared sensors registered ambient thermal uniformity across the airframe, with no convective heating or rocket/turbine exhaust discharge.
   - **CSL Dual-Lens Classification Mapping**:
     - *Lens A (Classical Aerospace Baseline)*: Evaluates target against classified tactical sUAS / black-project low-observable airframes. Identifies anomalous non-compliance with Navier-Stokes momentum transfer: an object of 13–15 ft hovering in a gravitational field must displace air mass ($F = \dot{m} v_e = mg$) unless supported by non-aerodynamic reactionless or metric mechanisms. Flags the absence of sonic booms during canyon dash as an aerodynamic paradox under classical compressible fluid dynamics.
     - *Lens B (Theoretical Metric Manipulation)*: Fully aligns with metric decoupling phenomenology (Alcubierre / Lentz / Bobrick & Martire). A localized metric contraction/expansion field isolates the craft within a comoving spacetime pocket, preventing ambient fluid shear, shockwave creation, and downward atmospheric momentum transfer. Satisfies ODNI/AARO Five Observables: instantaneous acceleration, hypersonic velocity without signatures, low observability, and positive lift without aerodynamic surfaces.

2. **Historical Defense Intelligence & Material Evaluation: DOW-UAP-D167 (Project Capella / BAASS)**
   - **Historical Context**: December 2008 technical memorandum produced under Defense Intelligence Agency (DIA) contract for the Advanced Aerospace Weapon System Applications Program (AAWSAP) / Bigelow Aerospace Advanced Space Studies (BAASS).
   - **Physical Facilities Specification**: Documents architectural engineering parameters for a dedicated 5,000 sq ft, 3-foot thick reinforced high-density concrete subterranean laboratory vault designed for secure containment, non-destructive isotopic assay, and electromagnetic shielding of recovered anomalous aerospace materials and metamaterials.
   - **CSL Ingestion Note**: Provides contextual evidence of formal defense-sector programs establishing specialized containment infrastructure for anomalous artifacts.

3. **Multispectral Sensor Surveillance & Physical Soil Assay: DOW-UAP-D174 (Skinwalker Ranch Field Logs)**
   - **Operational Scope**: Field sensor deployments across the Uintah Basin / Skinwalker Ranch anomaly corridor under defense intelligence contract.
   - **Empirical Measurements**: Documents transient radiofrequency (RF) spectrum anomalies (abrupt narrowband spikes across 1.4–1.6 GHz), localized micro-magnetic field deflections, and physical topsoil spectroscopy following nocturnal anomalous luminous phenomena encounters.
   - **CSL Ingestion Note**: Informs CSL's multi-modal sensor requirements, specifically supporting magnetometer/compass deviation logging and RF environmental monitoring alongside optical tracking.

4. **Historical High-Altitude Intercept & Fire-Control Radar: DOW-UAP-D155 (1957 USAF AIIR)**
   - **Historical Setting**: 1957 USAF Air Intelligence Information Report (AIIR) documenting an encounter by a Strategic Air Command (SAC) B-52 crew over Saudi Arabia.
   - **Sensor Corroboration**: Simultaneous multi-crew optical acquisition and onboard AN/APG fire-control radar tracking. An unidentified high-speed radar target maintained parallel formation at high altitude, executing non-ballistic turns, rapid rate-of-climb escalations, and extreme velocity shifts exceeding performance envelopes of known aircraft.
   - **CSL Ingestion Note**: Serves as a historical baseline for dual-modality validation (visual observation confirmed by simultaneous active radar tracking).

#### Operational Heuristics Derived from Release 07 for CSL Protocol:
1. **Fluid-Boundary Interaction Metric ($I_{fluid}$)**: In addition to tracking angular rates and kinematic vectors, CSL field operators and automated sky stations must record ground-level environmental indicators (tree limb deflection, dust perturbation, surface water disturbance) whenever target altitude is estimated under 500 m AGL.
2. **Acoustic Shockwave Gate**: High-speed angular crossing events without acoustic transients must be flagged with a dual-lens marker (D-LENS-AERO-01), recording whether optical track speed indicates Mach $\ge 1.0$ without acoustic pressure signature.
3. **Multi-Station Triangulation Invariance**: Emphasizes CSL's core consensus architecture—no single sensor or single observer report can constitute conclusive identification without independent baseline parallax, time-synchronized ephemeris deconfliction, and cryptographic tamper-evident hashing.

18.3 Quarantined Background Theoretical Literature (Never Ingested by Compute or Unprimed AI)

The peer-reviewed General Relativity and metric manipulation literature is retained purely as theoretical context regarding potential propulsion mechanisms.
**Strict Quarantine Safeguard**: These references **never** enter the computational deconfliction algorithms, coordinate transformations, or unprimed AI diagnostic prompts. Ingesting speculative physics into active classification prompts violates the "unprimed evidence" principle and risks inducing confirmation bias or halluncinated anomalies.
Code	Reference	Publication	Intended role	Quarantine status
KB-T5-01	Alcubierre, M. (1994). The warp drive: hyper-fast travel within general relativity.	Classical and Quantum Gravity, 11, L73–L77	Theoretical spacetime metric solutions	Quarantined Background Literature
KB-T5-02	Lentz, E. W. (2021). Breaking the warp barrier: hyper-fast solitons in Einstein–Maxwell-plasma theory.	Classical and Quantum Gravity, 38, 075001	Positive-energy hyperbolic metric solutions	Quarantined Background Literature
KB-T5-03	Bobrick, A., & Martire, G. (2021). Introducing physical warp drives.	Classical and Quantum Gravity, 38, 105009	General physical warp geometry constraints	Quarantined Background Literature

These papers are theoretical mathematical solutions in General Relativity. Their presence in the project bibliography does not imply that such metrics are technologically realized or present in any observed event.

18.4 Regulatory References
Code	Resource	URL	Intended role
KB-REG-01	14 CFR § 91.209, aircraft lights	https://www.ecfr.gov/	Aircraft-lighting regulatory context (anti-collision strobes, position lights)
KB-REG-02	14 CFR Part 107, small unmanned aircraft systems	https://www.ecfr.gov/	Drone-operation regulatory context (altitude ceilings, line-of-sight rules)

18.5 AI and Analytical Systems
Code	Resource	Intended role	Required safeguard
KB-AI-01	In-app analytical model	Candidate optical interpretation and analytical assistance	Pin model ID; evaluate solely on unprimed telemetry without narrative bias
KB-AI-02	External review models	Advisory review panel (Claude, Gemini, Luna)	Advisory dialogue only; human geodesist/statistician required for formal sign-off
18.6 Resource Deactivation

To deactivate a resource, record the resource code, reason, affected modules, effective release, and validation consequences.

A resource should not be removed solely because it produces an inconvenient result. Source-quality concerns should be documented and evaluated against prespecified criteria.
19. References and Technical Reading List

The following list identifies foundational materials relevant to the proposed architecture. It is not a substitute for a completed reference audit.
19.1 Scientific and Institutional Sources

    All-domain Anomaly Resolution Office. Official publications and UAP records. https://www.aaro.mil/
    NASA. Unidentified Anomalous Phenomena research and study materials. https://science.nasa.gov/uap/
    Centre National d'Études Spatiales, GEIPAN. UAP case records and methodology. https://www.cnes-geipan.fr/
    U.S. Department of War (DoW). Presidential Unsealing and Reporting System for UAP Encounters (PURSUE), Release 07 Declassified Archive (28 PDF Reports). https://www.war.gov/ufo/?releaseDate=Release+07&release=07
    National Archives and Records Administration. Archival collections and records guidance. https://www.archives.gov/
    NASA/JPL. Horizons system documentation. https://ssd.jpl.nasa.gov/horizons/
    CelesTrak. Orbital data and satellite tracking resources. https://celestrak.org/
    OpenSky Network. Aircraft tracking research resources. https://opensky-network.org/
    NOAA/National Weather Service. Weather observations and reference products. https://www.weather.gov/

19.2 Theoretical Physics

    Alcubierre, M. (1994). The warp drive: hyper-fast travel within general relativity. Classical and Quantum Gravity, 11, L73–L77.
    Lentz, E. W. (2021). Breaking the warp barrier: hyper-fast solitons in Einstein–Maxwell-plasma theory. Classical and Quantum Gravity, 38, 075001.
    Bobrick, A., & Martire, G. (2021). Introducing physical warp drives. Classical and Quantum Gravity, 38, 105009.

19.3 Standards and Regulatory Materials

    Electronic Code of Federal Regulations. Title 14, including § 91.209 and Part 107. https://www.ecfr.gov/
    World Geodetic System 1984 documentation and relevant geodetic transformation references.
    SGP4 orbital propagation references and the documentation applicable to the selected orbital data implementation.
    Statistical references for chi-square goodness-of-fit, confidence-interval coverage, binomial inference, and empirical permutation tests.

19.4 Bibliographic Verification Requirements

Before publication, verify:

    Exact publication titles and author names.
    Journal, volume, issue, pages, and DOI where applicable.
    Whether each paper is peer reviewed.
    Whether the cited result supports the specific statement made.
    Current institutional source URLs.
    The existence and exact wording of every cited government case resolution or technical bulletin.

The project should not cite a purported institutional technical bulletin merely because its title appears in a draft registry. Locate the original publication or mark the item as unverified.
20. Appendices
Appendix A. Minimum Event Manifest

A suggested manifest structure is shown below. Field names are proposed and must be aligned with the actual implementation.

{
  "project_id": "check-sky-light",
  "event_id": "unique-event-id",
  "session_id": "unique-session-id",
  "software_commit": "commit-hash",
  "configuration_hash": "sha256",
  "device": {
    "model": "recorded-device-model",
    "os_version": "recorded-os-version",
    "browser_version": "recorded-browser-version"
  },
  "timing": {
    "monotonic_timestamp": null,
    "estimated_utc_offset": null,
    "offset_uncertainty": null,
    "sync_rtt": null
  },
  "observer": {
    "position_reference": "restricted-reference",
    "position_uncertainty": null,
    "height_reference": "documented-height-datum"
  },
  "measurement": {
    "azimuth": null,
    "elevation": null,
    "angular_covariance": null,
    "quality_status": "pending"
  },
  "reference_data": [],
  "derived_results": [],
  "artifacts": [],
  "deviations": []
}

Null fields indicate that the value has not been populated. They must not be interpreted as zero.

The production schema should include units, coordinate conventions, version identifiers, validation rules, and a distinction between missing, unavailable, and not-applicable values.
Appendix B. Required Terminal Diagnostic and Rejection Codes
Code	Classification	Operational Definition
CONVENTIONAL_IDENTIFIED	Terminal Class	A conventional catalog identity (ADS-B aircraft, TLE satellite, planet/star, weather balloon) is confirmed within approved spatial, temporal, and kinematic tolerances.
OPTICAL_SENSOR_ARTIFACT	Terminal Class	Diagnosed as an internal optical or sensor artifact (lens flare, internal reflection, sensor hot pixel, CMOS rolling-shutter tearing, compression macroblocking).
ATMOSPHERIC_METEOROLOGICAL	Terminal Class	Diagnosed as an atmospheric optical phenomenon, temperature inversion ducting, cloud light scatter, ball lightning, or sub-horizon mirage.
UNCATALOGED_CONVENTIONAL	Terminal Class	Physical object confirmed in local airspace (birds, bats, insects, uncoordinated hobby drones, untracked ultralights) without an active catalog transponder.
UNRESOLVED_HIGH_RESIDUAL	Terminal Class	Multi-station physical track passing all quality, parallax, and timing gates, conclusively decoupled from conventional catalogs, and exhibiting anomalous kinematics or metric residuals.
INSUFFICIENT_TELEMETRY_DATA	Rejection Code	Data do not meet frozen measurement quality (SNR, duration, contrast, or IMU stability thresholds).
INSUFFICIENT_PARALLAX	Rejection Code	Baseline-to-target convergence angle or relative range uncertainty fails the observability gate ($\alpha < 10^\circ$ or $\sigma_R/R > \tau_{\text{range}}$).
WIDE_UNCERTAINTY	Advisory Gate	Weak convergence geometry ($10^\circ \le \alpha < 20^\circ$) admitted only with explicit non-linear covariance bounds; range is loosely constrained.
INVALID_FORWARD_RAY	Rejection Code	Geometric solution violates the forward-pointing ray requirement ($s \le 0$ or $t \le 0$; target located behind one or both observers).
ILL_CONDITIONED_GEOMETRY	Rejection Code	Baseline and ray vectors are collinear or coplanarity is numerically degenerate ($\|\mathbf{\hat{b}} \times \mathbf{d}_1\| < 0.05$).
TIMING_UNCERTAINTY_EXCEEDED	Rejection Code	Inter-station timestamp offset uncertainty or synchronization jitter exceeds the frozen maximum tolerance.
REFERENCE_FEED_UNAVAILABLE	Rejection Code	Required reference data (ADS-B, TLE, weather) are offline or feed latency exceeds freshness criteria.
REFERENCE_MATCH_REJECTED	Rejection Code	Candidate catalog association rejected due to geometric or kinematic contradiction with triangulated POCA.
PROTOCOL_DEVIATION	Audit Code	The event departed from the frozen preregistered procedure; logged for audit and excluded from primary claims.

Codes must be accompanied by measured quantities, applicable thresholds, and the version of the rule that produced the decision.
Appendix C. Required Per-Event Reporting

For every analyzed event, report:

    Data-quality status.
    Original artifact references and integrity status.
    Observer geometry and its uncertainty.
    Bearing estimates and covariance.
    Timing uncertainty.
    Candidate reference associations.
    Residuals and chance-match diagnostics.
    Range observability decision.
    POCA or trajectory estimate, if applicable.
    Uncertainty-region definition.
    Final classification.
    Rejection reasons and protocol deviations.
    Software and reference-data versions.

Appendix D. Publication Readiness Checklist

    Abstract and objectives finalized.
    Methods match the actual frozen implementation.
    All primary sources verified.
    Statistical analysis code reviewed.
    All primary endpoints reported.
    All failed and inconclusive results included.
    Device-level and geometry-level results presented.
    Reference uncertainty propagated or justified as negligible.
    Privacy review completed.
    Third-party licensing reviewed.
    AI-assisted work disclosed.
    Limitations and untested assumptions explicitly stated.
    Code and data availability statements prepared.
    Protocol registration linked.
    Principal Investigator sign-off recorded.

Final Project Statement

Check Sky Light is intended to improve the empirical quality of civilian sky observations through reproducible measurement, uncertainty-aware geometric analysis, conventional-object deconfliction, and transparent reporting.

The platform's credibility depends on its willingness to reject unsupported range estimates, disclose data limitations, measure false associations, preserve original artifacts, and publish unsuccessful tests alongside successful ones.

The governing principle remains:

An unexplained residual is a reason to improve the measurement, test the model, or collect additional evidence—not a conclusion about the origin of the object.