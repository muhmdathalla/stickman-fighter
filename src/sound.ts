// Web Audio API Sound Synthesizer Engine
// Zero network dependencies, zero files to download, instantly works on user tap

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playTone(
  frequency: number,
  type: OscillatorType,
  duration: number,
  slideFreq: number | null,
  volumeStart: number,
  volumeEnd: number = 0.001
) {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  if (slideFreq !== null) {
    osc.frequency.exponentialRampToValueAtTime(slideFreq, audioCtx.currentTime + duration);
  }

  gainNode.gain.setValueAtTime(volumeStart, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(volumeEnd, audioCtx.currentTime + duration);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export function playJump() {
  playTone(150, 'triangle', 0.15, 400, 0.2);
}

export function playLand() {
  playTone(80, 'sine', 0.1, 40, 0.15);
}

export function playSwoosh(weaponType: 'fists' | 'sword' | 'hammer' | 'spear' | 'scythe') {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  // Let's customize pitch/dur per weapon
  let pitch = 300;
  let duration = 0.15;
  let gainVal = 0.15;

  switch (weaponType) {
    case 'fists':
      pitch = 280;
      duration = 0.12;
      gainVal = 0.1;
      break;
    case 'sword':
      pitch = 450;
      duration = 0.18;
      gainVal = 0.15;
      break;
    case 'hammer':
      pitch = 120;
      duration = 0.35;
      gainVal = 0.3;
      break;
    case 'spear':
      pitch = 600;
      duration = 0.12;
      gainVal = 0.15;
      break;
    case 'scythe':
      pitch = 350;
      duration = 0.22;
      gainVal = 0.2;
      break;
  }

  // Create standard noise or low pass filtered sweep
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 8;
  filter.frequency.setValueAtTime(pitch * 2, audioCtx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(pitch / 2, audioCtx.currentTime + duration);

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(gainVal, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  noise.start();
  noise.stop(audioCtx.currentTime + duration);
}

export function playHit(isBoss: boolean = false) {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  // Play crisp impact
  playTone(isBoss ? 90 : 150, 'sawtooth', 0.08, 30, 0.25);

  // Play noise splash
  const duration = 0.08;
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const bandpass = audioCtx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.setValueAtTime(800, audioCtx.currentTime);

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.18, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  noise.connect(bandpass);
  bandpass.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  noise.start();
}

export function playHurt() {
  playTone(220, 'sawtooth', 0.2, 55, 0.2);
}

export function playDash() {
  // Rising sweep of filtered noise
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const duration = 0.2;
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(400, audioCtx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(4000, audioCtx.currentTime + duration);

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  noise.start();
}

export function playShield() {
  // Play retro laser/forcefield sound
  playTone(400, 'sine', 0.4, 1200, 0.2, 0.01);
}

export function playGroundSlam() {
  // Heavy low thud and earthquake sweep
  playTone(90, 'sine', 0.45, 10, 0.5, 0.001);
  playTone(180, 'triangle', 0.2, 40, 0.3, 0.001);
}

export function playInkBallLaunch() {
  playTone(300, 'triangle', 0.15, 600, 0.15);
}

export function playExplosion() {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  playTone(120, 'sine', 0.35, 10, 0.4, 0.001);

  // Deep rumble noise
  const duration = 0.4;
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const lowpass = audioCtx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(400, audioCtx.currentTime);

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  noise.connect(lowpass);
  lowpass.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  noise.start();
}

export function playCoin() {
  // Double coin sound: C6 then E6
  initAudio();
  if (!soundEnabled || !audioCtx) return;

  const now = audioCtx.currentTime;

  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(987.77, now); // B5
  gain1.gain.setValueAtTime(0.08, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  osc1.connect(gain1);
  gain1.connect(audioCtx.destination);
  osc1.start();
  osc1.stop(now + 0.12);

  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1318.51, now + 0.06); // E6
  gain2.gain.setValueAtTime(0.08, now + 0.06);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  osc2.connect(gain2);
  gain2.connect(audioCtx.destination);
  osc2.start(now + 0.06);
  osc2.stop(now + 0.22);
}

export function playLevelWin() {
  initAudio();
  if (!soundEnabled || !audioCtx) return;

  const now = audioCtx.currentTime;
  const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 arpeggio
  const durs = [0.1, 0.1, 0.1, 0.35];

  let accumTime = 0;
  notes.forEach((freq, idx) => {
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + accumTime);

    gain.gain.setValueAtTime(0.18, now + accumTime);
    gain.gain.exponentialRampToValueAtTime(0.001, now + accumTime + durs[idx]);

    osc.connect(gain);
    gain.connect(audioCtx!.destination);
    osc.start(now + accumTime);
    osc.stop(now + accumTime + durs[idx]);

    accumTime += 0.08;
  });
}

export function playLevelFail() {
  initAudio();
  if (!soundEnabled || !audioCtx) return;

  const now = audioCtx.currentTime;
  // Descreasing sad tones
  playTone(220, 'sawtooth', 0.2, 110, 0.15);
  setTimeout(() => {
    playTone(165, 'sawtooth', 0.2, 82.5, 0.15);
  }, 180);
  setTimeout(() => {
    playTone(110, 'sawtooth', 0.4, 55, 0.2);
  }, 360);
}
