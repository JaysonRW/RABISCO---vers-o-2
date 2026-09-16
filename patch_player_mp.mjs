import fs from 'fs';
let code = fs.readFileSync('src/game/entities/Player.ts', 'utf8');

if (!code.includes('public mp: number')) {
  code = code.replace(
    'public maxStamina: number = GAME_CONFIG.PLAYER.MAX_STAMINA;',
    'public maxStamina: number = GAME_CONFIG.PLAYER.MAX_STAMINA;\n  public mp: number = 100;\n  public maxMp: number = 100;\n  public inputBuffer: { key: string, time: number }[] = [];'
  );
}

const inputReplacement = `    input: {
      left: boolean;
      right: boolean;
      down?: boolean;
      jump: boolean;
      dash: boolean;
      attack: boolean;
      useSalt: boolean;
    },`;
code = code.replace(/    input: \{[\s\S]*?\},/, inputReplacement);

fs.writeFileSync('src/game/entities/Player.ts', code);
