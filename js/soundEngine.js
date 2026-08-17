/**
 * Web Audio API Sound Engine
 * Provides synth sounds for UI feedback and ambient focus sounds without external file dependencies.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.ambientNodes = null;
        this.currentAmbientType = null;
        this.ambientGain = null;
        this.volume = 0.3;
        this.isMuted = false;
    }

    initContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Play subtle button click/pop
    playPop(freq = 600) {
        if (this.isMuted) return;
        try {
            this.initContext();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq / 2, this.ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
        } catch (e) {
            console.warn('Audio error:', e);
        }
    }

    // Play victory chime when checking off task
    playCompleteChime() {
        if (this.isMuted) return;
        try {
            this.initContext();
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, index) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.07);

                gain.gain.setValueAtTime(0, this.ctx.currentTime + index * 0.07);
                gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + index * 0.07 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + index * 0.07 + 0.4);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(this.ctx.currentTime + index * 0.07);
                osc.stop(this.ctx.currentTime + index * 0.07 + 0.45);
            });
        } catch (e) {
            console.warn('Audio error:', e);
        }
    }

    // Play warning sound for overlapping tasks
    playWarning() {
        if (this.isMuted) return;
        try {
            this.initContext();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, this.ctx.currentTime);
            osc.frequency.setValueAtTime(220, this.ctx.currentTime + 0.15);

            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.3);
        } catch (e) {
            console.warn('Audio error:', e);
        }
    }

    // Play ambient focus sound (Rain, Ocean Waves, Forest)
    startAmbient(type) {
        this.stopAmbient();
        if (!type || type === 'none') return;

        this.initContext();
        this.currentAmbientType = type;
        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.ambientGain.connect(this.ctx.destination);

        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1; // White noise
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        if (type === 'rain') {
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, this.ctx.currentTime);
            whiteNoise.connect(filter);
            filter.connect(this.ambientGain);
            whiteNoise.start();
            this.ambientNodes = [whiteNoise, filter];
        } else if (type === 'waves') {
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, this.ctx.currentTime);

            const lfo = this.ctx.createOscillator();
            lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec wave cycle
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(350, this.ctx.currentTime);

            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);

            whiteNoise.connect(filter);
            filter.connect(this.ambientGain);

            lfo.start();
            whiteNoise.start();
            this.ambientNodes = [whiteNoise, filter, lfo, lfoGain];
        } else if (type === 'forest') {
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(500, this.ctx.currentTime);
            filter.Q.setValueAtTime(2, this.ctx.currentTime);

            whiteNoise.connect(filter);
            filter.connect(this.ambientGain);
            whiteNoise.start();

            const chirpInterval = setInterval(() => {
                if (this.currentAmbientType !== 'forest') {
                    clearInterval(chirpInterval);
                    return;
                }
                if (Math.random() > 0.4) {
                    this.playBirdChirp();
                }
            }, 3500);

            this.ambientNodes = [whiteNoise, filter, { stop: () => clearInterval(chirpInterval) }];
        }
    }

    playBirdChirp() {
        if (!this.ctx || this.isMuted) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;
            const startFreq = 2200 + Math.random() * 800;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(startFreq, now);
            osc.frequency.exponentialRampToValueAtTime(startFreq + 600, now + 0.06);
            osc.frequency.exponentialRampToValueAtTime(startFreq - 200, now + 0.12);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.04, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ambientGain);

            osc.start(now);
            osc.stop(now + 0.13);
        } catch (e) {}
    }

    setAmbientVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        if (this.ambientGain && this.ctx) {
            this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        }
    }

    stopAmbient() {
        if (this.ambientNodes) {
            this.ambientNodes.forEach(node => {
                try {
                    if (node.stop) node.stop();
                    if (node.disconnect) node.disconnect();
                } catch (e) {}
            });
            this.ambientNodes = null;
        }
        this.currentAmbientType = null;
    }
}

window.soundEngine = new SoundEngine();
