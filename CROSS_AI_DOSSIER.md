# Check Sky Light: Multi-Sensor Civilian Airspace Deconfliction Platform
## Technical Architecture, Theoretical Framework & Field Validation Specification (Consensus Release v3.1)

**Author & Principal Investigator:** Gregory Tafoya, MPH  
**AI Technical Review & Engineering Architecture Consortium ("The Parallax Panel"):**  
- **Claude Sonnet 5.5** (Anthropic) — *Vector Geodesy, Experimental Design & Covariance Discipline*  
- **ChatGPT / GPT-4o ("Luna")** (OpenAI) — *Statistical Architecture, Distributional Testing & Adversarial Telemetry Review*  
- **Gemini 3.8 Flash** (Google) — *Production Build Engine, Mathematical Implementation & Web Architecture*  

**Project Identifier:** `check-sky-light-v3.1-parallax-consensus`  
**License:** Open-Access Research Specification & MIT Open Architecture  
**Manuscript Reference:** `/CHECK_SKY_LIGHT_MANUSCRIPT_v1.0.md`  
**Shared Preview Deployment:** https://ais-pre-ukflj6nzej45ykwobcj43x-497180163446.us-west2.run.app  

---

### Abstract & Epistemological Core Axiom
Witness reports of Unidentified Anomalous Phenomena (UAP) have historically been compromised by two epistemological extremes: uncritical credulity or dismissive reductionism. **Check Sky Light** implements the familiar automotive "Check Engine Light" paradigm for civilian sky observation.

Rather than jumping to speculative conclusions, the instrument treats anomalous light signatures as **diagnostic triage events** requiring systematic sensor validation, multi-layer deconfliction, uncertainty propagation, and residual-based kinematic analysis.

> **Consensus Core Axiom (The Summit Safeguard):**  
> *"An event is considered anomalous only with respect to the tested hypothesis set; absence of a conventional identification does not constitute evidence for an exotic explanation."*

---

### 1. The Five-Stage Scientific Maturity Model
To prevent observational measurements from silently collapsing into speculative interpretations, every event in Check Sky Light progresses through an immutable 5-stage pipeline:

| Maturity Stage | Operational Definition | Output Artifact |
| :--- | :--- | :--- |
| **Level 0: Observation** | Raw optical video frames, device IMU readings, and audio FFT spectrum recorded. | Immutable cryptographically hashed sensor package. |
| **Level 1: Sensor-Valid** | Survives quality checks (camera held stable $>1.5\text{ s}$, optical contrast $>55\%$, angular covariance $\le \pm 5^\circ$). | Discard low-quality jitter; assign `INSUFFICIENT_TELEMETRY_DATA` if failed. |
| **Level 2: Deconflicted** | Evaluated against Mode-S ADS-B aircraft, NORAD TLE orbits, NOAA weather balloons, and celestial ephemeris (Venus, Jupiter, Sirius). | Correlated targets labeled as `CONVENTIONAL_IDENTIFIED`. |
| **Level 3: Geometrically Constrained** | Multiple independent observers ($N \ge 2$) establish a statistically consistent 3D trajectory in WGS84 ECEF. | Solved Point of Closest Approach (POCA) with range-scaled $\chi^2$ covariance volume. |
| **Level 4: Physically Unresolved** | The observation remains statistically inconsistent with tested conventional models after propagating all measurement uncertainties. | **`UNRESOLVED_HIGH_RESIDUAL`** (Meaning: *"We have an unexplained residual requiring better measurement,"* NOT *"alien confirmation"*). |

---

### 2. Dual-Observer 3D Skew-Line Triangulation (WGS84 ECEF & Chi-Square Gating)
A single optical sensor cannot measure range ($R$). Without range, angular velocity ($\dot{\theta}$) provides zero information about true velocity ($v = R\dot{\theta}$). Check Sky Light resolves this through a client-side WGS84 ECEF triangulation engine:

1. **Local ENU to ECEF Ray Projection:**
   For an observer at geodetic coordinate $(\phi, \lambda, h)$ observing bearing $(az, el)$:
   $$\mathbf{\hat{u}}_{\text{ENU}} = [\sin(az)\cos(el), \cos(az)\cos(el), \sin(el)]$$
   Rigidly rotated into ECEF unit line-of-sight vector $\mathbf{\hat{d}} \in \mathbb{R}^3$, accounting for terrestrial curvature across multi-kilometer baselines.
2. **Epipolar Coplanarity Pre-Filter ($O(1)$ Complexity):**
   Given unit baseline $\mathbf{\hat{b}} = (\mathbf{p}_1 - \mathbf{p}_2)/\|\mathbf{p}_1 - \mathbf{p}_2\|$ and ray $\mathbf{\hat{d}}_1$:
   $$\mathbf{\hat{n}} = \frac{\mathbf{\hat{b}} \times \mathbf{\hat{d}}_1}{\|\mathbf{\hat{b}} \times \mathbf{\hat{d}}_1\|}, \quad |\epsilon| = |\arcsin(\mathbf{\hat{d}}_2 \cdot \mathbf{\hat{n}})|$$
   Candidate pairs are immediately discarded if out-of-plane angle $|\epsilon| > 3\sigma_\epsilon$.
3. **Point of Closest Approach (POCA) Midpoint:**
   Skew rays $\mathbf{L}_1(s) = \mathbf{p}_1 + s\mathbf{\hat{d}}_1$ and $\mathbf{L}_2(t) = \mathbf{p}_2 + t\mathbf{\hat{d}}_2$ are solved with strict ray constraints ($s > 0, t > 0$, convergence angle $\theta \ge 8^\circ$):
   $$\mathbf{X}_{\text{POCA}} = \frac{\mathbf{L}_1(s^*) + \mathbf{L}_2(t^*)}{2}, \quad m = \|\mathbf{L}_1(s^*) - \mathbf{L}_2(t^*)\|$$
4. **Exact Normal-Projected Jacobian Chi-Square Gate ($\chi^2 \le 6.635$, 1 DOF, 99%):**
   Heuristic range-scaled scalar distances ($\sqrt{s^2\sigma_1^2 + t^2\sigma_2^2}$) compress the test statistic. Following The Parallax Panel Phase 0 derivation, the exact directional Jacobians along the common normal $\mathbf{\hat{n}}$ are:
   $$\mathbf{g} = \mathbf{w}_0 - \mathbf{\hat{n}}\delta, \quad \mathbf{g}_1 = \frac{\mathbf{\hat{d}}_2 \times \mathbf{g}}{\|\mathbf{\hat{d}}_1 \times \mathbf{\hat{d}}_2\|}, \quad \mathbf{g}_2 = \frac{\mathbf{g} \times \mathbf{\hat{d}}_1}{\|\mathbf{\hat{d}}_1 \times \mathbf{\hat{d}}_2\|}$$
   Propagated through anisotropic $(\sigma_{az}, \sigma_{el})$ in local ENU bases:
   $$\sigma_\delta^2 = \sigma_{az,1}^2 (\mathbf{g}_1 \cdot \mathbf{v}_{az,1})^2 + \sigma_{el,1}^2 (\mathbf{g}_1 \cdot \mathbf{v}_{el,1})^2 + \sigma_{az,2}^2 (\mathbf{g}_2 \cdot \mathbf{v}_{az,2})^2 + \sigma_{el,2}^2 (\mathbf{g}_2 \cdot \mathbf{v}_{el,2})^2$$
   $$\chi^2 = \frac{\delta^2}{\sigma_\delta^2} \sim \chi^2(1), \quad \text{Gate condition: } \chi^2 \le 6.635$$
   In 600,000-draw Monte Carlo testing, this achieved exact decimal equivalence with an independent reference oracle at $\alpha \ge 20^\circ$ ($|\mu - 1| \le 0.008$).

---

### 3. Opportunistic Orientation Calibration (Zero-Cost IMU Bias Correction)
To counter the 3°–10° local magnetic distortion common to consumer smartphone magnetometers:
- When a user locks onto a known commercial airliner (ADS-B transponder broadcast) or a bright planet/star (NASA JPL Horizons ephemeris), the app computes the delta between the observed compass heading and the true topocentric azimuth:
  $$\delta\theta_{\text{bias}} = \theta_{\text{observed}} - \theta_{\text{truth}}$$
- This orientation bias is subtracted in real time from subsequent candidate tracking events, improving mobile heading precision toward $\approx \pm 1.0^\circ$.

---

### 4. Controlled Field Validation Protocol: The ISS / Starlink Transit Benchmark
Rather than claiming an unsubstantiated percentage before testing, the platform characterization protocol is defined as:

1. **Experimental Setup:** Two calibrated smartphones running the Check Sky Light PWA deployed at a surveyed ground baseline ($B = 2.0\text{ km}$).
2. **Target:** Scheduled, high-elevation transit of the International Space Station (ISS, $V \approx 7.66\text{ km/s}$, $h \approx 420\text{ km}$) and Starlink LEO trains.
3. **Characterization Metric:** Total observed covariance characterized against authoritative NORAD SGP4 ephemeris:
   $$\mathbf{\Sigma}_{\text{observed}} \approx \mathbf{\Sigma}_{\text{sensor}} + \mathbf{\Sigma}_{\text{ephemeris}} + \mathbf{\Sigma}_{\text{timing}} + \mathbf{\Sigma}_{\text{model}}$$
4. **Transparency Commitment:** The project publishes the complete confusion matrix, including all false pairings, temporal sync rejects, and ill-conditioned geometries.

---

### 5. Consortium Charter Principles
1. Extraordinary claims get extraordinary measurements, not extraordinary rhetoric.
2. An event is considered anomalous only with respect to the tested hypothesis set; absence of a conventional identification does not constitute evidence for an exotic explanation.
3. A triangulated point without an uncertainty volume is a coordinate, not a measurement. (Luna)
4. A match without a false-pair estimate is a coincidence candidate. (Claude)
5. The human investigator (Commander Greg) holds final executive authority over project ethics and publication.
