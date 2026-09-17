import fs from 'fs';
let code = fs.readFileSync('src/game/audio/synth.ts', 'utf8');

const importStr = "import fireballSoundUrl from '../../sounds/som_flames.mp3';\n\nclass SoundManager {";
code = code.replace("class SoundManager {", importStr);

const methodStr = `  public playFireballSound() {
    if (!this.enabled || typeof window === 'undefined') return;
    const audio = new Audio(fireballSoundUrl);
    audio.volume = 0.6;
    audio.play().catch(e => console.warn('Fireball sound play blocked:', e));
  }

  public playHitImpact() {`;
code = code.replace("  public playHitImpact() {", methodStr);

fs.writeFileSync('src/game/audio/synth.ts', code);
