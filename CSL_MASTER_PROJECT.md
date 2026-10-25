Check Sky Light (CSL)
Master Project Specification, Scientific Framework, Knowledge Base, and Field Validation Protocol

Project identifier: check-sky-light-v3.1-parallax-consensus
Document identifier: CSL-MASTER-PROJECT
Document type: Integrated technical and scientific project specification
Principal Investigator: Gregory Tafoya, MPH
Version: Master Draft 1.0 — Consolidated, Pending Technical and Scientific Review
Prepared: October 2026
License: MIT for original software and open-architecture materials, subject to the licensing and redistribution terms of referenced third-party data
Status: Consolidated working draft; not a declaration of experimental validation or final protocol freeze
Document Control
Field	Description
Project	Check Sky Light (CSL)
Primary objective	Characterize a civilian multi-sensor sky-observation and airspace-deconfliction instrument
Scientific approach	Measurement validation, uncertainty propagation, conventional-object identification, and residual analysis
Principal Investigator	Gregory Tafoya, MPH
Primary implementation	Progressive Web Application (PWA); implementation details require source-code verification
Reference deployment	https://ais-pre-ukflj6nzej45ykwobcj43x-497180163446.us-west2.run.app
Knowledge base	CSL-KB-DB-v3.5 and subsequent approved revisions
Validation protocol	CSL-VAL-PROTO-v1.0-CANDIDATE-REV4
Supersession policy	Approved master revisions supersede prior working copies; frozen validation configurations remain immutable
Governing principle	An unexplained residual is a measurement and classification problem, not evidence of an exotic origin
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

3.3 Classification Taxonomy

The frozen validation taxonomy is:

    Known Conventional Match
    Optical / Sensor Artifact
    Atmospheric / Meteorological Phenomenon
    Uncataloged Conventional Object
    Physically Unresolved Residual

The taxonomy is operational. It does not constitute a ranking of the probability of extraterrestrial or other exotic explanations.
3.4 Terminology

    Detection: Evidence that a measurable signal exists.
    Identification: Assignment to a supported object or phenomenon category.
    Association: A candidate correspondence between observations and a reference track.
    Deconfliction: Testing whether known conventional explanations account for an observation.
    Triangulation: Estimation of a shared 3D location or trajectory from multiple lines of sight.
    POCA: The point representing the midpoint of the shortest connecting segment between two geometric lines or rays.
    Observability: The degree to which the available measurements constrain the desired quantity.
    Residual: A difference between a measurement or model prediction and an observed or reference quantity.
    False anomaly: A known object incorrectly left in the unresolved category.
    False exclusion: A known object incorrectly assigned a conventional identity when that identity is absent from the tested catalogs.
    Insufficient telemetry: Data inadequate to support the intended analytical decision.
    Reference truth: An independently derived reference estimate, including its own uncertainty.

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
4.2 Proposed Processing Sequence

Raw Observation
       |
       v
Artifact Preservation and Hashing
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
Conventional-Object Association and Statistical Gating
       |
       +---- Supported association ---> CONVENTIONAL_IDENTIFIED
       |
       v
Multi-Observer Observability Assessment
       |
       +---- Inadequate geometry ----> INSUFFICIENT_PARALLAX
       |
       v
POCA / Trajectory Estimation and Uncertainty Propagation
       |
       v
Residual Analysis Against Frozen Hypotheses
       |
       +---- Unresolved -------------> UNRESOLVED_HIGH_RESIDUAL

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
5.4 Camera and IMU Calibration

T8 characterizes the relative orientation of the camera and IMU, camera intrinsics, field of view, lens distortion, and time offset between camera frames and sensor samples.

Where possible, use:

    Plate-solved star fields.
    Surveyed terrestrial targets.
    Controlled timed motion.
    Flash or equivalent timing events.
    Repeated observations across device poses.

The camera-to-IMU rotation matrix must be represented using an explicitly documented convention, such as Rcamera←IMU. The transformation direction, coordinate handedness, axis definitions, and units must be consistent across modules.

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

A cryptographic hash establishes that the bytes match the hashed content. It does not prove that the original observation was genuine, correctly timed, or free from manipulation before hashing.

Export the manifest off-device at capture time when practicable. Hashes stored only beside the source data are weaker evidence of chain of custody than independently timestamped manifests.
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

For azimuth az measured clockwise from north and elevation el measured above the local horizontal, the ENU unit direction is
u^ENU=[sin⁡(az)cos⁡(el)cos⁡(az)cos⁡(el)sin⁡(el)].

The direction must be transformed into ECEF using the observer's geodetic position and the documented ENU-to-ECEF rotation.

For an observer at latitude ϕ and longitude λ, the standard ENU-to-ECEF rotation is
RENU→ECEF=[−sin⁡λ−sin⁡ϕcos⁡λcos⁡ϕcos⁡λcos⁡λ−sin⁡ϕsin⁡λcos⁡ϕsin⁡λ0cos⁡ϕsin⁡ϕ].

Thus,
d^ECEF=RENU→ECEFu^ENU.

The implemented transformation should be checked against independent test vectors before field use.
6.3 Two-Observer Ray Geometry

Let the two observer positions be p1 and p2, with unit directions d^1 and d^2.

The corresponding forward rays are
L1(s)=p1+sd^1,L2(t)=p2+td^2,

with the physical ray constraints
s>0,t>0.

The shortest segment between the two infinite lines can be calculated analytically when the lines are not parallel. The constrained ray solution must additionally verify that the resulting parameters are positive.

If the unconstrained solution falls behind an observer, the implementation must not silently treat it as a valid forward-ray intersection.
6.4 Convergence and Conditioning

Define the angular separation between the two unit rays as
α=cos⁡−1(clamp⁡(d^1⋅d^2,−1,1)).

Small convergence angles produce poor range conditioning. As α approaches zero, small bearing errors can produce very large range errors.

The proposed hard threshold of α≥8∘ is a development setting that requires independent review and pilot justification. Passing this threshold alone does not establish adequate observability.

The system must also evaluate:

    Predicted range uncertainty.
    Baseline orientation relative to the line of sight.
    Sensitivity to angular perturbations.
    Reference uncertainty.
    Whether the result is physically compatible with the forward rays.
    Whether the uncertainty model is valid in the current geometry.

6.5 Point of Closest Approach

Let the solved closest points be
q1=p1+s∗d^1,q2=p2+t∗d^2.

Then the midpoint estimate is
XPOCA=q1+q22,

and the closest-approach separation is
m=∥q1−q2∥.

POCA is a geometric construction. It is not automatically the true object position.

The separation m must be evaluated against a defensible uncertainty model, and the estimated point must be reported with its uncertainty and conditioning diagnostics.
6.6 Epipolar Coplanarity Pre-Filter

A proposed geometric pre-filter uses the observer baseline and the first ray to define an epipolar plane.

Let
b^=p1−p2∥p1−p2∥.

For a nondegenerate configuration, define
n^=b^×d^1∥b^×d^1∥.

The second ray's out-of-plane angular residual is
ϵ=arcsin⁡(clamp⁡(d^2⋅n^,−1,1)).

The gate compares ∣ϵ∣ with an uncertainty-derived threshold.

Degenerate configurations, including a baseline nearly parallel to the first ray, require an explicit rejection or alternate calculation. The pre-filter's claimed computational complexity and rejection behavior should be verified against the implementation.
6.7 Residual Uncertainty and the Chi-Square Gate

The proposed statistical gate tests whether the observed cross-track separation is consistent with the propagated angular measurement uncertainty.

For a scalar residual δ with a correctly specified standard uncertainty σδ, a normalized statistic can be written as
χ2=δ2σδ2.

Under an appropriate Gaussian linearized model, with one independently tested residual and no additional fitted parameters consuming degrees of freedom, this statistic may be compared with a one-degree-of-freedom chi-square distribution.

At the 99% threshold,
χ1,0.992≈6.635.

This threshold is valid only if the residual, covariance, and degrees-of-freedom assumptions are justified.

The original directional-Jacobian formulation must undergo independent mathematical review before its implementation is treated as authoritative. The reviewer must establish:

    The exact residual definition and sign convention.
    The derivatives with respect to each observer's azimuth and elevation.
    The mapping between local angular perturbations and ECEF direction perturbations.
    Whether the residual covariance includes all relevant correlated terms.
    Whether the linearization is adequate in each geometry stratum.
    Whether shared timing, calibration, or environmental errors create covariance between observers.
    Whether the statistic remains correctly calibrated near the observability boundary.

The simplified range-scaled expression
σδ,approx2=s2σ12+t2σ22

must not be substituted for a verified residual covariance merely because it is convenient.

The proposed one-degree-of-freedom gate remains a candidate implementation until T0 and the independent code review are complete.
6.8 Range Observability

For a simplified geometry with transverse baseline B⊥, range R, and effective angular uncertainty σγ, a first-order range-uncertainty approximation is
σR≈R2σγB⊥.

This relationship illustrates why range becomes poorly constrained at long distances and why a small baseline cannot compensate for limited angular precision.

It is an approximation, not a universal range-error guarantee. The appropriate uncertainty model must account for the actual geometry, measurement covariance, and reference uncertainties.

The pipeline must be permitted to return a bearing-only result or an unobservable-range status when the data do not constrain range sufficiently.
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
7.2 Aircraft Telemetry

Potential sources include ADS-B Exchange, OpenSky Network, and other permitted aviation data services.

The system should account for:

    Position and altitude uncertainty.
    Track latency and update cadence.
    Timestamp alignment.
    Aircraft transponder coverage.
    Unreported or noncooperative traffic.
    Differences between pressure altitude, geometric altitude, and observer-relative elevation.
    Source licensing and access restrictions.

No feed should be described as complete coverage of all aircraft.
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
7.5 Astronomical Deconfliction

NASA/JPL Horizons and other documented ephemeris services can provide reference positions for the Sun, Moon, planets, and selected stars.

The pipeline must use appropriate observer location, observation time, time scale, coordinate frame, and atmospheric assumptions.

A stellar or planetary match should be evaluated using the expected angular uncertainty, optical centroid uncertainty, and any known refraction effects.
7.6 Chance-Match Estimation

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
7.7 Reference-Data Governance

Maintain a registry for each external dependency:
Field	Required information
Resource code	Stable identifier
Organization	Publisher or operator
Official URL	Documented source address
Intended use	Specific analytical role
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
8.1 Opportunistic Calibration Concept

The proposed calibration method compares the measured bearing to a known reference object.

For an object with a sufficiently accurate reference azimuth,
Δθ=wrap⁡(θobserved−θreference).

The wrap operation must normalize angular differences across the zero-degree/360-degree boundary.

The method may help estimate a heading bias. However, it must distinguish among:

    Magnetic compass bias.
    True-north versus magnetic-north conventions.
    Local magnetic declination.
    Local magnetic disturbance.
    Device tilt and sensor fusion errors.
    Camera-to-IMU misalignment.
    Time offset and target motion.
    Reference-object position uncertainty.

A single calibration observation does not establish a universal heading correction.
8.2 Calibration Procedure

    Select a known reference with an adequately constrained position and observation time.
    Compute its topocentric azimuth using the documented coordinate and time conventions.
    Record the measured bearing and all available calibration metadata.
    Estimate the bias and uncertainty.
    Apply the correction only within a defined validity scope.
    Evaluate performance against held-out objects not used for calibration.
    Report before-and-after bearing errors with confidence intervals.

The proposed target of approximately one-degree precision is a hypothesis to test, not a performance commitment.
8.3 Sensor Fusion

The fusion model should document the sources of its state estimates, the assumptions of independence or correlation, and the uncertainty associated with each input.

Correlated camera, IMU, timing, and calibration errors must not be treated as independent merely because they originate from different software modules.

Any uncertainty-inflation model associated with angular motion and inter-device timing must be derived and empirically checked under T7 and relevant geometric tests.
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
T0	Validate pairing-gate implementation under the assumed noise model	Simulation truth	Statistic moments, distribution, quantiles, and rejection rates	Primary
T1	Characterize astronomical and satellite bearing measurements	Ephemerides	Azimuth/elevation bias and scatter; residuals by elevation	Secondary
T2	Evaluate opportunistic orientation calibration	Held-out references	Paired reduction in bearing error	Secondary
T3	Test refusal to claim range when parallax is inadequate	Ephemerides	Count of unsupported range-constrained outputs	Primary
T4	Validate geometric reconstruction	ADS-B and GPS-logged targets	Confidence-region coverage and range-error behavior	Primary for coverage
T5a	Test deliberate mismatched-object pairings	Known identities	False-acceptance rate	Primary
T5b	Estimate chance matches	Empirical permutation null	Expected accidental matches and confidence interval	Primary
T6	Test catalog-blind controls	GPS logger and withheld identity	False-exclusion rate	Primary
T7	Characterize inter-device timing	Independent reference clock	Offset error, jitter, and adequacy of timing inflation	Secondary
T8	Characterize camera/IMU alignment and timing	Star fields, surveyed targets, controlled timing events	Calibration stability and temporal offset	Secondary
T9	Characterize optical centroid error	Known-direction point source	Bias and scatter by brightness, focus, exposure, and motion	Secondary
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

For a 2 km baseline and an object approximately 420 km away, the small-angle parallax is approximately
γ≈B⊥R

when the baseline is approximately transverse to the line of sight.

With B⊥=2 km and R=420 km,
γ≈0.00476 rad≈0.273∘.

This angular difference can be smaller than the effective bearing uncertainty of a smartphone observation. Actual observability depends on the transverse baseline and the complete error budget.

Consequently:

    T1 evaluates bearing accuracy and residual patterns.
    T3 tests whether the software correctly declines to claim a constrained range.
    T4 must use nearer targets and geometry selected to make range uncertainty meaningful.

9.5 T0: Statistical Simulation

T0 tests the actual shipped pairing-gate module using synthetic rays and known noise distributions.

The simulation should include a preregistered range of geometries, including near-parallel rays, weak convergence, and ill-conditioned configurations.

The proposed minimum is N≥1,000,000 simulated trials.

Primary checks:

    Mean statistic against the expected value under the null model.
    Full statistic distribution against the assumed χ12 distribution.
    Quantile and rejection-rate behavior at the 90%, 95%, 99%, and 99.9% thresholds.
    QQ plots and distributional diagnostics.
    Results reported separately for each geometry stratum.
    Correct rejection or observability labeling for degenerate and ill-conditioned cases.

The proposed mean criterion is
∣Tˉ−1∣<32N,

where T denotes the statistic under the stated model.

The proposed Kolmogorov–Smirnov distance criterion must be implemented using the correct critical value for the selected sample size and significance level. If distribution parameters are estimated from the simulation, the ordinary one-sample KS critical value may not be appropriate.

The rejection-rate criteria must use exact binomial intervals or another preregistered method suitable for the nominal probability and sample size.

T0 establishes implementation behavior under its assumptions. It does not establish that real sensor errors follow those assumptions.
9.6 T1: Bearing Characterization

Collect observations of suitable ISS passes, bright satellites, planets, and bright stars where practical.

For each observation, record:

    Device and camera configuration.
    Reference azimuth and elevation.
    Observed azimuth and elevation.
    Angular residuals and uncertainty.
    Optical centroid quality.
    Temperature, pressure, and humidity when available.
    Time offset and uncertainty.
    Elevation and atmospheric conditions.
    Whether refraction is modeled.

Analyze residual bias and scatter by device, pose, elevation, and relevant quality strata.

Atmospheric refraction must be described as unmodeled unless the preregistered analysis demonstrates that its contribution is negligible within the tested conditions.
9.7 T2: Orientation Calibration

Use one set of known references to estimate the correction and a separate held-out set to measure its performance.

Report:

    Before-calibration error.
    After-calibration error.
    Paired error differences.
    Confidence intervals.
    Number and quality of usable observations.
    Device-specific results.
    Evidence of drift or limited calibration validity.

9.8 T3: Inadequate-Parallax Control

Use satellite or other reference observations whose predicted range uncertainty exceeds the frozen observability threshold.

The primary requirement is zero outputs claiming a geometrically constrained range in n applicable trials.

Any unsupported constrained-range output is a protocol failure.

A POCA coordinate with an explicit unobservable or wide-uncertainty status is acceptable.

Zero failures do not prove that the failure probability is zero. Report the trial count and confidence interval.
9.9 T4: Triangulation Validation

Use ADS-B aircraft tracks and GPS-logged controlled targets with suitable reference accuracy.

Pre-register strata for:

    Baseline length.
    Target range.
    Convergence angle.
    Elevation.
    Angular rate.
    Predicted range uncertainty.

The principal metric is the coverage of nominal 95% uncertainty regions.

A confidence region must be defined mathematically and generated by the frozen algorithm. It must not be retroactively enlarged to capture reference truth.

The study must report region size and over-coverage alongside under-coverage. A very large uncertainty region can achieve good coverage while providing little useful information.

Range-error behavior should be compared with the predicted first-order scaling, while accounting for reference uncertainty.
9.10 T5a and T5b: False Pairings and Empirical Null

T5a deliberately pairs observations of different known objects observed at similar times.

T5b permutes observer and object identities within predefined strata, preserving relevant sky density, elevation distribution, time-of-night characteristics, angular-error properties, and candidate counts.

Report:

    Number of tested pairs.
    Accepted false pairs.
    Empirical expected accidental matches.
    Confidence intervals.
    Analytic chance-match estimate.
    Pipeline-reported chance-match estimate.
    Results by geometry and quality stratum.

A valid comparison must account for how the empirical permutation distribution was generated and whether its assumptions adequately represent the null pairing process.
9.11 T6: Catalog-Blind Ground-Truth Control

Operate a known GPS-logged target while withholding its identity from the pipeline and ensuring that the target is absent from every catalog used by the pipeline.

Any conventional identification assigned to the target counts as a false exclusion for this test, even if it falls within a chosen association tolerance.

For each event, retain:

    Independently established identity.
    Catalog-withholding verification.
    Pipeline-assigned identity.
    Match residual.
    Reported coincidence probability.
    Final classification.
    Data-quality state.

Report the false-exclusion rate with an exact Clopper–Pearson 95% confidence interval.

The maximum acceptable upper confidence bound must be chosen before validation data are examined.

For orientation, zero failures in n independent trials gives an approximate upper 95% bound of 3/n when the rare-event approximation is appropriate. A more exact calculation should be used for the formal report.
9.12 T7–T9: Timing, Alignment, and Centroid Tests

T7 measures actual inter-device timing error against an independent reference.

T8 characterizes camera/IMU alignment, camera intrinsics, and camera-to-IMU timing.

T9 characterizes optical centroid performance under controlled image-quality conditions.

These tests are secondary but can reveal deficiencies requiring changes to the covariance model.

If a significant source of uncertainty is found to be unstable or missing, it must be addressed in a new version before making broader performance claims.
10. Statistical Analysis Plan and Acceptance Criteria
10.1 Primary Endpoints

The following endpoints are assessed separately:

    T0: Statistical implementation calibration.
    T3: Refusal to claim unobservable range.
    T4: Coverage of nominal 95% geometric uncertainty regions.
    T5: False-pair performance relative to the empirical null.
    T6: False-exclusion rate for catalog-blind controls.

Passing one endpoint does not compensate for failing another.
10.2 Pilot Parameters and Author Decisions

The following values remain unresolved until the pilot and independent review are complete.
Parameter	Decision source	Required action
Optical contrast and stable-duration thresholds	Pilot	Estimate from development data and freeze
Angular covariance model	Pilot and independent review	Specify axes, units, correlations, and estimation method
Minimum convergence angle	Pilot and geometric review	Test conditioning and freeze threshold
Range observability threshold	Pilot	Define using uncertainty and intended use
Geometry-stratum boundaries	Pilot	Pre-register bins
Minimum sample size per stratum, nmin⁡	Pilot	Set before validation
Minimum coverage bound, Cmin⁡	Principal Investigator	Choose before validation
Maximum acceptable false-exclusion bound	Principal Investigator	Choose before validation
Maximum acceptable uncertainty-region size, if applicable	Principal Investigator	Decide whether to gate informativeness
Gate thresholds and degrees of freedom	Independent review	Validate derivation and implementation
Statistical significance levels	Protocol	Fix before validation
Exclusion and deviation rules	Protocol	Freeze before validation
10.3 T4 Coverage Requirement

For every preregistered stratum with n≥nmin⁡, the one-sided lower 95% confidence bound on nominal-95% region coverage must be at least Cmin⁡.

The value of Cmin⁡ is an explicit author decision. It must not be selected after the validation data are opened.

Strata below nmin⁡ are reported as not characterized and excluded from the associated performance claim.
10.4 T5 Acceptance Rule

The observed false-acceptance count in T5a must not exceed the preregistered upper 95% bound of the expected accidental matches from the empirical null and the approved analytic model.

The pipeline's reported expected-false-pair estimate must also be compared with T5b.

The analysis must state whether the acceptance rule concerns expected counts, confidence bounds, or both. The exact statistical comparison must be specified before validation to prevent post hoc reinterpretation.
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

Principal Investigator: Gregory Tafoya, MPH, responsible for research priorities, ethics, final protocol decisions, and publication approval.

Implementation author: Responsible for code provenance, build reproducibility, implementation documentation, and correction of identified defects.

Independent technical reviewer: Reviews the triangulation derivation, covariance propagation, statistical gates, and implementation before the pilot.

Control operator: Maintains ground-truth information for blinded tests without running the pipeline.

Pipeline operator: Runs the frozen pipeline without access to withheld control identities and timings.

Analyst: Receives the sealed truth after the analysis lock.

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
Timestamping	Monotonic timestamps with UTC-offset and RTT logging	Measure actual offset error and jitter against an independent reference
Hashing	SHA-256 through Web Crypto; IndexedDB vault	Confirm exact hashed artifacts, manifest completeness, and external export
Statistical gate	One-degree-of-freedom gate implemented	Independent derivation review and T0 against shipped code
Observability threshold	Minimum convergence angle of 8 degrees reported	Review geometric conditioning and validate threshold
Timing uncertainty	Angular-rate/timing variance inflation reported	Derive the model and evaluate it against T7
Camera control	Partially implemented	Characterize camera settings, intrinsics, and platform-specific behavior
Peer-to-peer pairing	Pending field pilot	Document signaling, connectivity, failure behavior, and synchronization
Baseline survey	Pending pilot	Verify survey method, height reference, and uncertainty
Camera/IMU boresight	Pending pilot	Complete T8 characterization

These statuses should not be represented as independent test results.
15.2 Mandatory Pre-Pilot Verification

Before Phase 1:

    Obtain the actual source code and identify the shipped triangulation module.
    Independently review the mathematical derivation and sign conventions.
    Confirm the production code uses the reviewed formulation.
    Run T0 against the same module used by the PWA.
    Verify raw-data preservation and manifest export.
    Test timing metadata and failure modes on every planned device.
    Confirm that unobservable range is represented explicitly.
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
    nmin⁡ selected for each applicable stratum.
    Cmin⁡ selected for T4.
    Maximum acceptable T6 false-exclusion bound selected.
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
Tier IV — Telemetry and Reference Data
Code	Resource	URL	Intended role
KB-T4-01	CelesTrak	https://celestrak.org/	Orbital element sets and satellite tracking resources
KB-T4-02	Space-Track	https://www.space-track.org/	Orbital data, subject to access and use terms
KB-T4-03	ADS-B Exchange	https://www.adsbexchange.com/	Aircraft tracking and available historical data
KB-T4-04	OpenSky Network	https://opensky-network.org/	Aircraft tracking research and historical datasets
KB-T4-05	Flightradar24	https://www.flightradar24.com/	Supplementary aviation observations subject to access restrictions
KB-T4-06	SondeHub	https://sondehub.org/	Radiosonde tracking and balloon telemetry
KB-T4-07	NOAA / National Weather Service	https://www.weather.gov/	Weather observations and meteorological context
KB-T4-08	NASA/JPL Horizons	https://ssd.jpl.nasa.gov/horizons/	Solar-system ephemerides and observer-relative positions

Required operational metadata: Source, retrieval time, data epoch, time scale, feed version, position uncertainty, latency where known, and licensing restrictions.

Do not describe crowdsourced or commercial feeds as universally complete or perfectly accurate.
Tier V — Theoretical Physics Literature
Code	Reference	Publication	Intended role
KB-T5-01	Alcubierre, M. (1994). The warp drive: hyper-fast travel within general relativity.	Classical and Quantum Gravity, 11, L73–L77	Theoretical spacetime metric
KB-T5-02	Lentz, E. W. (2021). Breaking the warp barrier: hyper-fast solitons in Einstein–Maxwell-plasma theory.	Classical and Quantum Gravity, 38, 075001	Theoretical metric solutions; assumptions and energy conditions require careful review
KB-T5-03	Bobrick, A., & Martire, G. (2021). Introducing physical warp drives.	Classical and Quantum Gravity, 38, 105009	Theoretical classification and physical constraints

These papers are theoretical references. Their existence does not establish that the proposed mechanisms are physically realizable, technologically available, or evidenced by any CSL observation.

The claim that a particular model removes all relevant energy-condition problems, eliminates downwash or acoustic effects, or explains an observed trajectory must not be adopted without a source-specific technical analysis.
Regulatory References
Code	Resource	URL	Intended role
KB-REG-01	14 CFR § 91.209, aircraft lights	https://www.ecfr.gov/	Aircraft-lighting regulatory context
KB-REG-02	14 CFR Part 107, small unmanned aircraft systems	https://www.ecfr.gov/	Drone-operation regulatory context

Regulations must be checked in their current form. Lighting requirements, exemptions, operating conditions, altitude limits, and speed limitations should not be reduced to universal identification rules.

An aircraft's lighting configuration is a useful observation feature but does not independently establish or falsify its identity.
AI and Review Systems
Code	Resource	Intended role	Required safeguard
KB-AI-01	In-app analytical model	Candidate optical interpretation and analytical assistance	Pin the actual model and version; validate its outputs
KB-AI-02	External review models	Independent second-opinion analysis	Export unprimed evidence; prevent AI agreement from being treated as ground truth

Model names, version numbers, and capabilities must reflect the actual deployed configuration. Product names in draft project notes are not proof of deployment.
18.2 Resource Deactivation

To deactivate a resource, record the resource code, reason, affected modules, effective release, and validation consequences.

A resource should not be removed solely because it produces an inconvenient result. Source-quality concerns should be documented and evaluated against prespecified criteria.
19. References and Technical Reading List

The following list identifies foundational materials relevant to the proposed architecture. It is not a substitute for a completed reference audit.
19.1 Scientific and Institutional Sources

    All-domain Anomaly Resolution Office. Official publications and UAP records. https://www.aaro.mil/
    NASA. Unidentified Anomalous Phenomena research and study materials. https://science.nasa.gov/uap/
    Centre National d'Études Spatiales, GEIPAN. UAP case records and methodology. https://www.cnes-geipan.fr/
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
Appendix B. Required Rejection Codes
Code	Meaning
INSUFFICIENT_TELEMETRY_DATA	Data do not meet the frozen measurement-quality requirements
INSUFFICIENT_PARALLAX	Available geometry does not constrain range adequately
INVALID_FORWARD_RAY	Geometric solution violates the forward-ray constraints
ILL_CONDITIONED_GEOMETRY	Numerical or statistical conditioning is inadequate
TIMING_UNCERTAINTY_EXCEEDED	Timing uncertainty exceeds the frozen acceptance rule
REFERENCE_FEED_UNAVAILABLE	Required reference data are unavailable
REFERENCE_MATCH_REJECTED	Candidate reference association fails the approved gate
CONVENTIONAL_IDENTIFIED	A conventional identity is supported under the defined association procedure
UNRESOLVED_HIGH_RESIDUAL	Residual evidence remains unresolved within the tested hypothesis set
PROTOCOL_DEVIATION	The event departed from the frozen procedure and requires a deviation record

Codes should be accompanied by measured quantities, applicable thresholds, and the version of the rule that produced the decision.
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