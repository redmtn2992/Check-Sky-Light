import React, { useState, useEffect, useRef } from 'react';
import { Mic, Radio, ShieldAlert, Play, Square, Activity, Volume2 } from 'lucide-react';

interface AudioSonicMonitorProps {
  onSendToGemini?: (acousticData: { peakFreqHz: number; ambientDb: number; hasUltrasonic: boolean }) => void;
}

export const AudioSonicMonitor: React.FC<AudioSonicMonitorProps> = ({ onSendToGemini }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [peakFreqHz, setPeakFreqHz] = useState<number>(0);
  const [ambientDb, setAmbientDb] = useState<number>(0);
  const [hasUltrasonic, setHasUltrasonic] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const startMic = async () => {
    setMicError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicError('Microphone API unavailable in this browser. Switching to real-time acoustic simulator.');
        startSimulation();
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {
            // ignore
          }
        });
        return;
      }
      streamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        setMicError('AudioContext unavailable. Switching to simulator.');
        startSimulation();
        return;
      }
      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        try {
          await audioCtx.resume();
        } catch {
          // ignore
        }
      }
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      setIsListening(true);
      setIsSimulating(false);
      drawSpectrum();
    } catch (err: any) {
      if (err && err.name !== 'AbortError') {
        console.warn('Microphone access notice:', err);
      }
      setMicError('Microphone permission denied or unavailable. Switching to real-time acoustic simulator.');
      startSimulation();
    }
  };

  const stopMic = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
        }
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsListening(false);
    setIsSimulating(false);
  };

  const startSimulation = () => {
    stopMic();
    setIsSimulating(true);
  };

  const drawSpectrum = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      if (document.hidden) return; // Zero canvas draws when tab is hidden
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;
      let maxVal = 0;
      let maxIndex = 0;
      let totalVal = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        totalVal += dataArray[i];
        if (dataArray[i] > maxVal) {
          maxVal = dataArray[i];
          maxIndex = i;
        }
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#06b6d4');
        gradient.addColorStop(0.5, '#14b8a6');
        gradient.addColorStop(1, '#f43f5e');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
      const Nyquist = (audioContextRef.current?.sampleRate || 44100) / 2;
      const calculatedPeak = Math.round((maxIndex / bufferLength) * Nyquist);
      const calculatedDb = Math.round((totalVal / (bufferLength * 255)) * 90);
      setPeakFreqHz(calculatedPeak);
      setAmbientDb(calculatedDb);
      setHasUltrasonic(calculatedPeak > 15000 && maxVal > 100);
    };
    render();
  };

  useEffect(() => {
    if (!isSimulating || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let step = 0;
    const interval = setInterval(() => {
      if (document.hidden) return; // Zero canvas math when tab is backgrounded
      step++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bufferLength = 64;
      const barWidth = canvas.width / bufferLength;
      let simulatedPeak = 1200 + Math.sin(step / 3) * 800;
      let simulatedDb = 32 + Math.floor(Math.sin(step / 5) * 12);
      const spike = step % 20 === 0;
      if (spike) {
        simulatedPeak = 18400;
        simulatedDb = 68;
      }
      for (let i = 0; i < bufferLength; i++) {
        const heightFactor = Math.abs(Math.sin((i + step) * 0.2)) * (spike && i > 50 ? 0.9 : 0.4);
        const barHeight = heightFactor * canvas.height;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#0284c7');
        gradient.addColorStop(0.8, '#06b6d4');
        gradient.addColorStop(1, '#e11d48');
        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
      }
      setPeakFreqHz(Math.round(simulatedPeak));
      setAmbientDb(simulatedDb);
      setHasUltrasonic(spike);
    }, 100);
    return () => clearInterval(interval);
  }, [isSimulating]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopMic();
    };
  }, []);

  return (
    <div className="glass-panel border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
            <Radio className={`w-5 h-5 ${isListening || isSimulating ? 'animate-pulse text-cyan-300' : ''}`} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center space-x-2">
              <span>Live Acoustic & Ultrasonic Monitor</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Monitors high-frequency pitch spikes, silent zero-decibel hover signatures, or ultrasonic pulses.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {isListening || isSimulating ? (
            <button
              onClick={stopMic}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs sm:text-sm font-bold transition flex items-center space-x-1.5 cursor-pointer min-h-[38px]"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Mic</span>
            </button>
          ) : (
            <button
              onClick={startMic}
              className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 text-xs sm:text-sm font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] min-h-[38px]"
            >
              <Mic className="w-4 h-4" />
              <span>Listen Mic</span>
            </button>
          )}
          {!isListening && !isSimulating && (
            <button
              onClick={startSimulation}
              className="px-4 py-2 rounded-xl glass-pill text-slate-200 hover:text-white text-xs sm:text-sm font-bold transition flex items-center space-x-1.5 cursor-pointer min-h-[38px]"
            >
              <Play className="w-3.5 h-3.5 text-teal-400" />
              <span>Simulator</span>
            </button>
          )}
        </div>
      </div>

      {micError && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs sm:text-sm">
          {micError}
        </div>
      )}

      <div className="relative rounded-2xl bg-slate-950/80 border border-white/10 p-3 h-32 flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} width={600} height={120} className="w-full h-full object-cover rounded-xl" />
        {(!isListening && !isSimulating) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm text-center p-4 space-y-2">
            <Mic className="w-8 h-8 text-cyan-400 opacity-70 animate-bounce" />
            <p className="text-xs sm:text-sm text-slate-300">
              Tap <strong className="text-cyan-300">"Listen Mic"</strong> or <strong className="text-teal-300">"Simulator"</strong> to start acoustic spectrum telemetry.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl glass-panel-subtle border border-white/10 space-y-1">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Peak Frequency</span>
          </div>
          <div className="text-xl font-extrabold text-cyan-300 font-mono">
            {peakFreqHz} <span className="text-xs font-normal text-slate-400">Hz</span>
          </div>
        </div>
        <div className="p-3.5 rounded-2xl glass-panel-subtle border border-white/10 space-y-1">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <Volume2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Ambient Volume</span>
          </div>
          <div className="text-xl font-extrabold text-teal-300 font-mono">
            {ambientDb} <span className="text-xs font-normal text-slate-400">dB</span>
          </div>
        </div>
        <div className={`p-3.5 rounded-2xl border space-y-1 ${
          hasUltrasonic ? 'bg-rose-500/15 border-rose-500/40 text-rose-200' : 'glass-panel-subtle border-white/10 text-slate-300'
        }`}>
          <div className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldAlert className={`w-3.5 h-3.5 ${hasUltrasonic ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
            <span>Ultrasonic Status</span>
          </div>
          <div className="text-xs sm:text-sm font-semibold">
            {hasUltrasonic ? 'HIGH FREQUENCY ANOMALY DETECTED (>15kHz)' : 'Nominal Acoustic Spectrum'}
          </div>
        </div>
      </div>

      {onSendToGemini && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onSendToGemini({ peakFreqHz, ambientDb, hasUltrasonic })}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Send Acoustic Signature to Gemini Anomaly Forensics →</span>
          </button>
        </div>
      )}
    </div>
  );
};
