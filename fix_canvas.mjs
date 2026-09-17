import fs from 'fs';
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

code = code.replace(`    maxStamina: GAME_CONFIG.PLAYER.MAX_STAMINA,
    hasSaltWeapon: false,`, `    maxStamina: GAME_CONFIG.PLAYER.MAX_STAMINA,
    mp: 100,
    maxMp: 100,
    hasSaltWeapon: false,`);

code = code.replace(`saltCount: engineRef.current?.inventory.saltCount || 0`, `saltCount: stats.saltCount || 0`);

fs.writeFileSync('src/components/GameCanvas.tsx', code);
console.log('Fixed GameCanvas');
