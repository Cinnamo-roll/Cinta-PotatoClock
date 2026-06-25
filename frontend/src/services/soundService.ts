let audioContext: AudioContext | null = null;

function getAudioContext() {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return null;
  audioContext ??= new AudioContextConstructor();
  return audioContext;
}

function playTone(context: AudioContext, startAt: number, frequency: number, duration: number) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(0.18, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.03);
}

export async function playFocusDoneSound(enabled = true) {
  if (!enabled || typeof window === "undefined") return;
  const context = getAudioContext();
  if (!context) return;
  if (context.state === "suspended") await context.resume();
  const now = context.currentTime;
  playTone(context, now, 660, 0.18);
  playTone(context, now + 0.22, 880, 0.22);
  playTone(context, now + 0.5, 990, 0.28);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
