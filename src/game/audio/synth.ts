/**
 * O Cavaleiro Arruinado - Sound Synthesizer
 * Síntese procedural de áudio via Web Audio API (sem assets externos)
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private currentBGM: HTMLAudioElement | null = null;
  private currentBGMUrl: string | null = null;


  public playBGM(url: string, volume: number = 0.5) {
    if (!this.enabled || typeof window === 'undefined') return;
    
    // Se já está tocando a mesma música, não faz nada
    if (this.currentBGM && this.currentBGMUrl === url) {
      if (this.currentBGM.paused) {
        this.currentBGM.play().catch(e => console.warn('BGM play blocked:', e));
      }
      return;
    }
    
    this.stopBGM();
    
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = volume;
    audio.play().catch(e => console.warn('BGM play blocked by browser policy:', e));
    
    this.currentBGM = audio;
    this.currentBGMUrl = url;
  }
  
  public stopBGM() {
    if (this.currentBGM) {
      this.currentBGM.pause();
      this.currentBGM.currentTime = 0;
      this.currentBGM = null;
      this.currentBGMUrl = null;
    }
  }
  
  public fadeOutBGM(durationMs: number = 1000) {
    if (!this.currentBGM) return;
    
    const audio = this.currentBGM;
    const startVolume = audio.volume;
    const steps = 20;
    const stepTime = durationMs / steps;
    const volumeStep = startVolume / steps;
    
    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        this.stopBGM();
      } else {
        if (audio) {
          audio.volume = Math.max(0, startVolume - (volumeStep * currentStep));
        }
      }
    }, stepTime);
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playSwordSlash(isSalted: boolean = false) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isSalted ? 380 : 260, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isSalted ? 2800 : 1800, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);

    // Se estiver com sal, adiciona estalo brilhante
    if (isSalted) {
      this.playSaltSparkle();
    }
  }

  public playSaltSparkle() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playSaltApply() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Som de pó de sal e ressonância sagrada
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(440, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.4);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(660, now);
    osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.4);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  }

  public playJump() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playSpinJump() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Som ágil de giro acrobático: vento rodopiante + harmônico ascendente de 360°
    const osc = this.ctx.createOscillator();
    const oscHarmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.28);

    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(380, now);
    oscHarmonic.frequency.exponentialRampToValueAtTime(1160, now + 0.14);
    oscHarmonic.frequency.exponentialRampToValueAtTime(640, now + 0.28);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.14);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.28);
    filter.Q.setValueAtTime(2.5, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(filter);
    oscHarmonic.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    oscHarmonic.start(now);
    osc.stop(now + 0.3);
    oscHarmonic.stop(now + 0.3);
  }

  public playDash() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playHitImpact() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playImmuneClank() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playGhostWail() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.5);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);
  }

  public playGhostHurt() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Som de absorção de alma: Tom cristalino etéreo e ascendente
   */
  public playSoulAbsorb() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Oscilador 1: Tom puro e cristalino subindo
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(660, now);
    osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.22);

    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.25);

    // Oscilador 2: Ressonância harmônica mágica
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.28);

    gain2.gain.setValueAtTime(0.12, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);

    osc2.start(now);
    osc2.stop(now + 0.3);
  }

  /**
   * Som de subida de nível de Ascensão: Acorde triunfante com ressonância sagrada
   */
  public playAscensionLevelUp() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chordFrequencies = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]; // Acorde Dó maior resplandecente

    chordFrequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.001, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.05 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + 1.2);
    });
  }

  /**
   * Som de virar página do manuscrito / pergaminho
   */
  public playPageTurn() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Ruído filtrado simulando fricção de papel
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + 0.2);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Som de diálogo com NPC
   */
  public playNpcDialog() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Som de transição de cenário / virada profunda de página
   */
  public playSectionTransition() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Fricção de virada rápida de pergaminho
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    const filter1 = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(120, now);
    osc1.frequency.exponentialRampToValueAtTime(45, now + 0.35);

    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(600, now);
    filter1.frequency.exponentialRampToValueAtTime(180, now + 0.35);

    gain1.gain.setValueAtTime(0.16, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(this.ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.35);

    // 2. Acorde místico de entrada em novo ambiente
    const notes = [130.81, 164.81, 196.00]; // C3, E3, G3
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.05);

      gain.gain.setValueAtTime(0.06, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + 0.05);
      osc.stop(now + 0.7);
    });
  }
}

export const soundManager = new SoundManager();
