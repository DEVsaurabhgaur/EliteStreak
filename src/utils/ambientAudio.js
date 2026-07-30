
export function startWhiteNoise() { console.log('White noise started'); }

export function stopWhiteNoise() { console.log('White noise stopped'); }

export function startPinkNoise() { console.log('Pink noise started'); }

export function stopPinkNoise() { console.log('Pink noise stopped'); }

export function startRainSynth() { console.log('Rain sound started'); }

export function stopRainSynth() { console.log('Rain sound stopped'); }

export function setAmbientVolume(vol) { console.log('Volume:', vol); }

export function isAmbientPlaying() { return false; }

export function getAmbientPresets() { return ['white', 'pink', 'rain']; }
