import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const oldPhysics = `      if (p.vRot) {
        p.rotation = (p.rotation || 0) + p.vRot * dt;
      }`;
const newPhysics = `      if (p.vRot) {
        p.rotation = (p.rotation || 0) + p.vRot * dt;
      }
      
      // Colisão da cabeça rolando com o chão
      if (p.shape === 'ZOMBIE_HEAD' && p.y > 430) {
        p.y = 430;
        p.vy *= -0.6; // Quique da cabeça
        p.vx *= 0.95; // Fricção
        if (Math.abs(p.vy) < 20) p.vy = 0;
      }`;

code = code.replace(oldPhysics, newPhysics);

const oldHeadSpawn = `              life: 3.0,
              maxLife: 3.0,
              color: '#4ade80',
              size: 8, // Head size
              shape: 'ZOMBIE_HEAD'`;
const newHeadSpawn = `              life: 4.0,
              maxLife: 4.0,
              color: '#4ade80',
              size: 8,
              alpha: 1,
              gravity: 1200,
              rotation: 0,
              vRot: Math.random() > 0.5 ? 10 : -10,
              shape: 'ZOMBIE_HEAD'`;
code = code.replace(oldHeadSpawn, newHeadSpawn);

fs.writeFileSync('src/game/GameEngine.ts', code);
