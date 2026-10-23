let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
};

export const playPopChime = (): void => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // Ignore audio error
  }
};

export const playFloraBreezeSound = (onComplete?: () => void): void => {
  try {
    const ctx = getAudioContext();
    if (!ctx) {
      onComplete?.();
      return;
    }
    const length = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.08;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 1.2);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, ctx.currentTime + 0.2);
    osc.frequency.linearRampToValueAtTime(240, ctx.currentTime + 0.8);
    osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 1.4);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    oscGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.3);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(ctx.currentTime + 0.2);
    osc.stop(ctx.currentTime + 1.5);

    if (onComplete) {
      setTimeout(onComplete, 1600);
    }
  } catch {
    onComplete?.();
  }
};

export const SoundSynthesizer: Record<string, () => void> = {
  singa: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.4, now + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.3);
    gain.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(75, now);
    osc1.frequency.linearRampToValueAtTime(115, now + 0.35);
    osc1.frequency.exponentialRampToValueAtTime(45, now + 2.2);
    g1.gain.setValueAtTime(0.45, now);
    osc1.connect(g1);
    g1.connect(gain);
    osc1.start(now);
    osc1.stop(now + 2.3);

    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(260, now);
    filter.frequency.linearRampToValueAtTime(360, now + 0.4);
    filter.Q.setValueAtTime(3.5, now);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(125, now);
    osc2.frequency.linearRampToValueAtTime(155, now + 0.3);
    osc2.frequency.exponentialRampToValueAtTime(75, now + 2);
    osc2.connect(filter);
    filter.connect(gain);
    osc2.start(now);
    osc2.stop(now + 2.3);
  },
  gajah: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.7);
    gain.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(520, now);
    filter.frequency.exponentialRampToValueAtTime(1450, now + 0.35);
    filter.frequency.exponentialRampToValueAtTime(600, now + 1.5);
    filter.Q.setValueAtTime(4.2, now);
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(280, now);
    osc1.frequency.exponentialRampToValueAtTime(460, now + 0.32);
    osc1.frequency.exponentialRampToValueAtTime(230, now + 1.6);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(285, now);
    osc2.frequency.exponentialRampToValueAtTime(470, now + 0.32);
    osc2.frequency.exponentialRampToValueAtTime(225, now + 1.6);
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.7);
    osc2.stop(now + 1.7);
  },
  panda: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.22, 0.44].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(340 - idx * 25, now + offset);
      osc.frequency.exponentialRampToValueAtTime(160, now + offset + 0.12);
      gain.gain.setValueAtTime(0.2, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.12);
    });
    const chirp = ctx.createOscillator();
    const chirpGain = ctx.createGain();
    chirp.type = 'sine';
    chirp.frequency.setValueAtTime(700, now + 0.65);
    chirp.frequency.exponentialRampToValueAtTime(1300, now + 0.82);
    chirp.frequency.exponentialRampToValueAtTime(950, now + 0.98);
    chirpGain.gain.setValueAtTime(0.18, now + 0.65);
    chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.98);
    chirp.connect(chirpGain);
    chirpGain.connect(ctx.destination);
    chirp.start(now + 0.65);
    chirp.stop(now + 0.98);
  },
  jerapah: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.linearRampToValueAtTime(190, now + 0.6);
    osc.frequency.exponentialRampToValueAtTime(115, now + 1.6);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.6);
  },
  harimau: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.48, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
    gain.connect(ctx.destination);
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(115, now);
    osc.frequency.linearRampToValueAtTime(155, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(65, now + 1.8);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 1.9);
  },
  kanguru: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.35].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(230 + idx * 40, now + offset);
      osc.frequency.exponentialRampToValueAtTime(620 + idx * 60, now + offset + 0.22);
      gain.gain.setValueAtTime(0.28, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.24);
    });
  },
  lumbalumba: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2500 + i * 200, now + i * 0.08);
      gain.gain.setValueAtTime(0.12, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.04);
    }
    const whistle = ctx.createOscillator();
    const whistleGain = ctx.createGain();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(1450, now + 0.38);
    whistle.frequency.exponentialRampToValueAtTime(2900, now + 0.65);
    whistle.frequency.exponentialRampToValueAtTime(1850, now + 0.95);
    whistleGain.gain.setValueAtTime(0.22, now + 0.38);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.98);
    whistle.connect(whistleGain);
    whistleGain.connect(ctx.destination);
    whistle.start(now + 0.38);
    whistle.stop(now + 0.98);
  },
  beruangkutub: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.linearRampToValueAtTime(130, now + 0.35);
    osc.frequency.exponentialRampToValueAtTime(60, now + 1.5);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.5);
  },
  pandamerah: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.18, 0.36].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880 + i * 140, now + offset);
      osc.frequency.exponentialRampToValueAtTime(1320, now + offset + 0.14);
      gain.gain.setValueAtTime(0.18, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.14);
    });
  },
  komodo: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const length = ctx.sampleRate * 1.2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 1.1);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
  },
  koala: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(310, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(180, now + 1.1);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.1);
  },
  zebra: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.22, 0.44].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(480 + idx * 80, now + offset);
      osc.frequency.exponentialRampToValueAtTime(320, now + offset + 0.18);
      gain.gain.setValueAtTime(0.22, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.18);
    });
  },
  monyet: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.18, 0.36, 0.54].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520 + (idx % 2) * 260, now + offset);
      osc.frequency.exponentialRampToValueAtTime(880, now + offset + 0.14);
      gain.gain.setValueAtTime(0.22, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.14);
    });
  },
  penyu: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.45);
    osc.frequency.exponentialRampToValueAtTime(260, now + 1.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.1);
  },
  berangberang: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.2].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950 + idx * 180, now + offset);
      osc.frequency.exponentialRampToValueAtTime(1400, now + offset + 0.16);
      gain.gain.setValueAtTime(0.18, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.16);
    });
  },
  rubah: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.16, 0.32].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(740 + idx * 120, now + offset);
      osc.frequency.exponentialRampToValueAtTime(1180, now + offset + 0.12);
      gain.gain.setValueAtTime(0.2, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.12);
    });
  },
};

