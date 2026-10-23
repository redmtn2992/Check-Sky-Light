# Check Sky Light (v3.7)
> **Empirical Civilian Aerospace Diagnostics & Multi-Sensor Sky Deconfliction Platform**  
> *Modeled after the automotive Check Engine Light with OBD-III diagnostic protocols.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-3.7.0-amber.svg)](https://github.com/redmtn2992/Check-Sky-Light)
[![Deconfliction Feeds](https://img.shields.io/badge/ADS--B%20%7C%20NOAA%20%7C%20NORAD-Active-cyan.svg)](https://github.com/redmtn2992/Check-Sky-Light)
[![Parallax Panel](https://img.shields.io/badge/Panel-Gemini%20%C2%B7%20Claude%20%C2%B7%20Luna-emerald.svg)](https://github.com/redmtn2992/Check-Sky-Light)
[![Domain Integrity](https://img.shields.io/badge/Domain%20Integrity-Zero%20Tolerance%20Active-emerald.svg)](https://github.com/redmtn2992/Check-Sky-Light)

---

## Overview

**Check Sky Light** is an empirical civilian sky diagnostics and aerospace deconfliction platform. Taking inspiration from the universal automotive **"Check Engine" light**, Check Sky Light acts as an instrument panel warning light for the sky—monitoring anomalies with structured **Diagnostic Trouble Codes (DTCs)** and eliminating false alarms before evaluating non-conventional aerospace physics.

The platform's paramount strength is its **unyielding empirical discipline**: systematically eliminating conventional air traffic, meteorological balloons, low-Earth-orbit satellites, astronomical mirages, camera lens artifacts, and synthetic AI/CGI hoaxes before admitting genuine anomalous signatures.

---

## The 4 Core Features

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CHECK SKY LIGHT PLATFORM                        │
├──────────────┬──────────────────┬───────────────────┬──────────────────┤
│  1. TARGET   │    2. RADAR      │    3. ANALYZE     │    4. REPORT     │
│ Optical AR   │ Airspace Feed    │ Dual-Lens AI      │ Field Dossiers   │
│ IMU Sensors  │ ADS-B / Celestrak│ DTC P3012 Verdict │ Standard Export  │
└──────────────┴──────────────────┴───────────────────┴──────────────────┘
```

### 1. TARGET: Optical AR Tracking & Sensor HUD
* **Real-Time AR Sky Scanner**: Full-screen optical tracking with live device gyro IMU stabilization (azimuth, elevation pitch, and bank roll).
* **Crosshair Reticle Modes**: Four selectable optical reticle styles matched to cockpit instrument archetypes.
* **Rapid Multi-Sensor Capture**: Optical burst photo and high-speed video capture paired with real-time sensor metadata embedding.

### 2. RADAR: Multi-Layer Airspace Deconfliction
* **Live ADS-B Flight Tracking**: Queries civilian and military aircraft in sector airspace to match squawks, flight plans, and FAA transponders.
* **NOAA Weather Balloon Feeds**: Tracks radiosonde launches and meteorological balloon drift trajectories across sectors.
* **NORAD Two-Line Element (TLE) Satellites**: Computes live orbital passes for Starlink constellations, ISS, Tiangong, and known orbital debris.
* **JPL Planetary Ephemeris**: Calculates real-time celestial azimuth and elevation to deconflict Venus, Jupiter, and bright stars from reported anomalies.

### 3. ANALYZE: Dual-Lens Intelligence & DTC Diagnostic Engine
* **The Dual-Lens Analytical Framework**:
  * **Lens A (Classical Aerospace Baseline)**: Evaluates targets against Newtonian aerodynamics, atmospheric lift surfaces, combustion plumes, sonic shockwaves, and FAA 1.2 Hz anti-collision strobes.
  * **Lens B (Theoretical Metric Manipulation)**: Evaluates authentic physical decoupling, absence of barometric downwash/rotor wash, cavitation-free transmedium travel, and instantaneous acceleration without acoustic shockwaves.
* **The Five Observables Baseline (ODNI / AARO)**: Instantaneous acceleration, hypersonic velocity without signatures, low observability, transmedium travel, and positive lift without aerodynamic surfaces.
* **Synthetic Media & CGI Discrimination**: Identifies neural diffusion artifacts, motion-blur inconsistencies, and digital VFX to prevent synthetic fakes.
* **Zero-Tolerance Safety Guardrails & Domain Integrity**: Automated pre-flight regex and multimodal semantic audits preventing pornographic, sexually explicit, or harm-related media, dropping violating payloads in-flight with zero storage.
* **Parallax Panel Consensus (DTC P3012)**: Multi-model verification integrating Gemini, Claude, and Luna to prevent single-model hallucinations and enforce rigorous cross-examination.

### 4. REPORT: Standardized Field Dossiers
* **Vetted Field Records**: Generates cryptographically verifiable, timestamped investigation dossiers.
* **Multi-Sensor Timeline**: Correlates optical evidence, radar squawk logs, gyro telemetry, and atmospheric weather conditions.
* **Export & Archival**: Produces clean PDF and structured JSON reports ready for submission to civilian and institutional repositories (SCU, SUAPS, GEIPAN).

---

## 4 Cockpit Archetype Themes

Tapping the top-left Check Engine logo opens the **Themes** selector, allowing users to customize their visual instrument panel:

| Theme | Archetype | Lore & Accent | Optical Purpose |
|---|---|---|---|
| 🟡 **Black Project** *(Default)* | Special Access Program Avionics | Incandescent Amber (`#FF9500`) + Obsidian | Clandestine aerospace interceptor HUD |
| 🔵 **Retro OBD-III** | 1980s VFD Diagnostic Dash | Electric Cyber Cyan (`#00F2FE`) + Digital Orange | Vintage concept cluster & diagnostic fault codes |
| 🟢 **Gen-3 NVG & FLIR** | 530nm Monochromatic Phosphor | Monochromatic Phosphor Green (`#39FF14`) | PVS-14 night vision & thermal sensor chain |
| 🔴 **Observatory** | Astronomy Starlight Mode | Pure OLED Black + Crimson Red (`#FF3B30`) | Preserves human rhodopsin for night-sky stargazing |

---

## Vetted Knowledge Base Tiers

Check Sky Light rejects unverified internet folklore and grounds its heuristics in five authoritative tiers:

1. **Tier I (Government & Defense Declassification)**: AARO, NASA UAP Independent Study Team, CNES/GEIPAN, ODNI Preliminary & Annual Assessments.
2. **Tier II (Institutional Scientific Bodies)**: Society for UAP Studies (Limina Journal), Scientific Coalition for UAP Studies (SCU), The Galileo Project (Harvard University), AIAA UAP Integration Committee.
3. **Tier III (Autonomous Sky Observation Networks)**: Skywatcher.ai, Sky360 Network, UFODAP, Project Hessdalen.
4. **Tier IV (Airspace & Ephemeris Telemetry)**: ADS-B Exchange, Space-Track / Celestrak (18th Space Defense Squadron), NOAA NEXRAD, NASA JPL Horizons.
5. **Tier V (Theoretical Metric Physics)**: Alcubierre (1994), Lentz (2021 positive-energy solitons), Bobrick & Martire (2021 physical warp drive geometries).

---

## Tech Stack

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Leaflet Maps
* **Sensors**: HTML5 DeviceOrientation API, MediaDevices Camera/Microphone, Geolocation API
* **Backend**: Node.js, Express, tsx
* **Data & Persistence**: Firebase Firestore, Browser LocalStorage, IndexedDB Media Vault

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/redmtn2992/Check-Sky-Light.git
cd Check-Sky-Light

# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

---

## License

MIT © Gregory Tafoya, MPH. Check Sky Light Platform.
