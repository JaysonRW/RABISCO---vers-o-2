import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const oldCode = `        // Bate em inimigos próximos
        for (const enemy of this.enemies) {
            if (!enemy.isAlive) {
                const eX = enemy.x + enemy.width / 2;`;

const newCode = `        // Bate em inimigos próximos
        for (const enemy of this.enemies) {
            if (enemy.isAlive) {
                const eX = enemy.x + enemy.width / 2;`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/game/GameEngine.ts', code);
