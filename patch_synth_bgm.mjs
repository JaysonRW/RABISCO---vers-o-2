import fs from 'fs';
let code = fs.readFileSync('src/game/audio/synth.ts', 'utf8');

const bgmFields = `  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private currentBGM: HTMLAudioElement | null = null;
  private currentBGMUrl: string | null = null;`;

code = code.replace(
  '  private ctx: AudioContext | null = null;\n  public enabled: boolean = true;',
  bgmFields
);

const bgmMethods = `
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
`;

code = code.replace(
  '  private initContext() {',
  bgmMethods + '\n  private initContext() {'
);

fs.writeFileSync('src/game/audio/synth.ts', code);
