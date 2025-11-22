// This is a client-side only utility
'use client';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window !== 'undefined') {
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser.", e);
        return null;
      }
    }
    return audioContext;
  }
  return null;
}

function playSound(type: 'sine' | 'square' | 'sawtooth' | 'triangle', frequency: number, duration: number) {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Prevent issues with audio context state on some browsers
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(0.2, ctx.currentTime); // Start with a gentle volume
  gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

export function playCorrectSound() {
  // A pleasant, short, rising two-tone sound
  const ctx = getAudioContext();
  if (!ctx) return;
  playSound('sine', 600, 0.1);
  setTimeout(() => playSound('sine', 800, 0.1), 100);
}

export function playIncorrectSound() {
  // A short, low-pitched buzz
  const ctx = getAudioContext();
  if (!ctx) return;
  playSound('sawtooth', 120, 0.2);
}

export function playClickSound() {
  // A very short, sharp click
  const ctx = getAudioContext();
  if (!ctx) return;
  playSound('triangle', 900, 0.05);
}
