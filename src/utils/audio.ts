/**
 * Audio Synthesizer utilizing Web Audio API
 * Ensures 100% offline functionality and zero network latency for stage projection.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function initAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}

/**
 * Short crisp tick for countdown
 */
export function playTickSound(volume = 0.5): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime); // A5

  gain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

/**
 * Urgent high-pitch alert for the last 3 seconds
 */
export function playUrgentTickSound(volume = 0.7): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1320, ctx.currentTime); // E6

  gain.gain.setValueAtTime(volume * 0.7, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

/**
 * Stage buzzer when time runs out
 */
export function playTimeoutSound(volume = 0.8): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(160, now);
  osc1.frequency.linearRampToValueAtTime(120, now + 0.9);

  osc2.type = 'square';
  osc2.frequency.setValueAtTime(165, now);
  osc2.frequency.linearRampToValueAtTime(125, now + 0.9);

  gain.gain.setValueAtTime(volume * 0.8, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.9);
  osc2.stop(now + 0.9);
}

/**
 * Triumphant fanfare for correct answer (+5 points)
 */
export function playCorrectSound(volume = 0.8): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const noteStart = ctx.currentTime + idx * 0.09;
    const duration = idx === notes.length - 1 ? 0.6 : 0.2;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteStart);

    gain.gain.setValueAtTime(0.001, noteStart);
    gain.gain.linearRampToValueAtTime(volume * 0.7, noteStart + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteStart);
    osc.stop(noteStart + duration);
  });
}

/**
 * Low buzzer for incorrect answer (0 points)
 */
export function playWrongSound(volume = 0.7): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(220, now);
  osc1.frequency.linearRampToValueAtTime(180, now + 0.4);

  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(207.65, now); // Dissonant minor second
  osc2.frequency.linearRampToValueAtTime(170, now + 0.4);

  gain.gain.setValueAtTime(volume * 0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.5);
  osc2.stop(now + 0.5);
}

/**
 * Round or question start chime
 */
export function playStartSound(volume = 0.6): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const freqs = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const noteStart = ctx.currentTime + idx * 0.07;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, noteStart);

    gain.gain.setValueAtTime(0.001, noteStart);
    gain.gain.linearRampToValueAtTime(volume * 0.5, noteStart + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteStart);
    osc.stop(noteStart + 0.25);
  });
}

/**
 * Rapid short tick for lottery / roulette spin wheel
 */
export function playSpinTickSound(pitch = 900, volume = 0.5): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(pitch, ctx.currentTime);

  gain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

/**
 * Grand fanfare when a lottery package or situation is drawn
 */
export function playLotteryWinSound(volume = 0.85): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Rich chord sequence: C5, E5, G5, B5, C6, G6
  const chords = [
    { freq: 523.25, time: 0.00, dur: 0.25 },
    { freq: 659.25, time: 0.08, dur: 0.25 },
    { freq: 783.99, time: 0.16, dur: 0.30 },
    { freq: 987.77, time: 0.24, dur: 0.35 },
    { freq: 1046.50, time: 0.32, dur: 0.80 },
    { freq: 1567.98, time: 0.45, dur: 0.70 },
  ];

  chords.forEach((note) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const noteStart = ctx.currentTime + note.time;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, noteStart);

    gain.gain.setValueAtTime(0.001, noteStart);
    gain.gain.linearRampToValueAtTime(volume * 0.6, noteStart + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + note.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteStart);
    osc.stop(noteStart + note.dur);
  });
}
