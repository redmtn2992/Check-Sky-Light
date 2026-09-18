export interface CentroidDetectionResult {
  detected: boolean;
  deltaScreenX: number; // offset in % of viewport width (-5% to +5%)
  deltaScreenY: number; // offset in % of viewport height (-5% to +5%)
  contrastRatio: number; // 0 to 100
  peakLuminance: number; // 0 to 255
  confidence: number; // 0 to 100
  centroidPixelX: number;
  centroidPixelY: number;
}

let analysisCanvas: HTMLCanvasElement | null = null;
let analysisCtx: CanvasRenderingContext2D | null = null;

function getAnalysisContext(width: number, height: number): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!analysisCanvas) {
    analysisCanvas = document.createElement('canvas');
    analysisCanvas.width = width;
    analysisCanvas.height = height;
    analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  } else if (analysisCanvas.width !== width || analysisCanvas.height !== height) {
    analysisCanvas.width = width;
    analysisCanvas.height = height;
    analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  }
  return analysisCtx;
}

export function sampleOpticalCentroid(
  video: HTMLVideoElement,
  screenXPct: number,
  screenYPct: number,
  boxSizePx: number = 96
): CentroidDetectionResult {
  const defaultRes: CentroidDetectionResult = {
    detected: false,
    deltaScreenX: 0,
    deltaScreenY: 0,
    contrastRatio: 0,
    peakLuminance: 0,
    confidence: 0,
    centroidPixelX: boxSizePx / 2,
    centroidPixelY: boxSizePx / 2
  };

  if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
    return defaultRes;
  }

  const vWidth = video.videoWidth;
  const vHeight = video.videoHeight;
  const centerX = (screenXPct / 100) * vWidth;
  const centerY = (screenYPct / 100) * vHeight;
  const halfBox = boxSizePx / 2;
  const srcX = Math.max(0, Math.min(vWidth - boxSizePx, centerX - halfBox));
  const srcY = Math.max(0, Math.min(vHeight - boxSizePx, centerY - halfBox));

  const ctx = getAnalysisContext(boxSizePx, boxSizePx);
  if (!ctx) return defaultRes;

  try {
    ctx.drawImage(video, srcX, srcY, boxSizePx, boxSizePx, 0, 0, boxSizePx, boxSizePx);
    const imgData = ctx.getImageData(0, 0, boxSizePx, boxSizePx);
    const data = imgData.data;

    let totalWeight = 0;
    let sumX = 0;
    let sumY = 0;
    let maxLum = 0;
    let minLum = 255;
    let sumLum = 0;
    const pixelCount = boxSizePx * boxSizePx;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      sumLum += lum;
      if (lum > maxLum) maxLum = lum;
      if (lum < minLum) minLum = lum;
    }

    const meanLum = sumLum / pixelCount;
    const contrastRange = maxLum - minLum;
    const brightThreshold = Math.max(meanLum + 22, meanLum + contrastRange * 0.45);
    const isDarkTargetMode = meanLum > 175 && (meanLum - minLum) > 35;
    const darkThreshold = meanLum - contrastRange * 0.45;

    for (let y = 0; y < boxSizePx; y++) {
      for (let x = 0; x < boxSizePx; x++) {
        const idx = (y * boxSizePx + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        let weight = 0;
        if (!isDarkTargetMode) {
          if (lum > brightThreshold) {
            weight = Math.pow((lum - brightThreshold) / Math.max(1, maxLum - brightThreshold), 2);
          }
        } else {
          if (lum < darkThreshold) {
            weight = Math.pow((darkThreshold - lum) / Math.max(1, darkThreshold - minLum), 2);
          }
        }
        if (weight > 0) {
          totalWeight += weight;
          sumX += x * weight;
          sumY += y * weight;
        }
      }
    }

    if (totalWeight > 4 && contrastRange > 24) {
      const centroidX = sumX / totalWeight;
      const centroidY = sumY / totalWeight;
      const deltaPxX = centroidX - (boxSizePx / 2);
      const deltaPxY = centroidY - (boxSizePx / 2);
      const deltaScreenX = (deltaPxX / vWidth) * 100;
      const deltaScreenY = (deltaPxY / vHeight) * 100;
      const confidence = Math.min(99, Math.round(35 + (contrastRange / 255) * 45 + Math.min(20, totalWeight / 3)));
      return {
        detected: true,
        deltaScreenX,
        deltaScreenY,
        contrastRatio: Math.round((contrastRange / 255) * 100),
        peakLuminance: Math.round(isDarkTargetMode ? minLum : maxLum),
        confidence,
        centroidPixelX: centroidX,
        centroidPixelY: centroidY
      };
    }
  } catch {
    // ignore
  }
  return defaultRes;
}

export class AlphaBetaOrientationFilter {
  private smoothedAz: number = 180;
  private smoothedPitch: number = 35;
  private smoothedRoll: number = 0;
  private isInitialized: boolean = false;

  public filter(rawAz: number, rawPitch: number, rawRoll: number): { az: number; pitch: number; roll: number } {
    if (!this.isInitialized) {
      this.smoothedAz = rawAz;
      this.smoothedPitch = rawPitch;
      this.smoothedRoll = rawRoll;
      this.isInitialized = true;
      return { az: rawAz, pitch: rawPitch, roll: rawRoll };
    }

    let dAz = ((rawAz - this.smoothedAz + 540) % 360) - 180;
    let dPitch = rawPitch - this.smoothedPitch;
    let dRoll = rawRoll - this.smoothedRoll;
    const panMagnitude = Math.hypot(dAz, dPitch);

    let alpha = 0.22;
    if (panMagnitude > 6) {
      alpha = 0.88;
    } else if (panMagnitude > 2) {
      alpha = 0.45;
    }

    this.smoothedAz = (this.smoothedAz + dAz * alpha + 360) % 360;
    this.smoothedPitch = Math.max(-15, Math.min(90, this.smoothedPitch + dPitch * alpha));
    this.smoothedRoll = this.smoothedRoll + dRoll * alpha;

    return {
      az: Math.round(this.smoothedAz * 10) / 10,
      pitch: Math.round(this.smoothedPitch * 10) / 10,
      roll: Math.round(this.smoothedRoll * 10) / 10
    };
  }

  public reset(az: number, pitch: number, roll: number = 0) {
    this.smoothedAz = az;
    this.smoothedPitch = pitch;
    this.smoothedRoll = roll;
    this.isInitialized = true;
  }
}
