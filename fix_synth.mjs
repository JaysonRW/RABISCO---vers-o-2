import fs from 'fs';
let code = fs.readFileSync('src/game/audio/synth.ts', 'utf8');

// The replacement was done twice, so we have duplicate fields and methods. Let's just remove the first batch of duplicates.
code = code.replace('  private currentBGM: HTMLAudioElement | null = null;\n  private currentBGMUrl: string | null = null;', '');

const duplicateMethodsStart = code.indexOf('  public playBGM(url: string, volume: number = 0.5) {');
const duplicateMethodsEnd = code.indexOf('  public playBGM(url: string, volume: number = 0.5) {', duplicateMethodsStart + 10);

if (duplicateMethodsStart !== -1 && duplicateMethodsEnd !== -1) {
  code = code.slice(0, duplicateMethodsStart) + code.slice(duplicateMethodsEnd);
}

fs.writeFileSync('src/game/audio/synth.ts', code);
