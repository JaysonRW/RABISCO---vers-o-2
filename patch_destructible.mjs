import fs from 'fs';
let code = fs.readFileSync('src/game/entities/Destructible.ts', 'utf8');

const oldConstructor = `    if (type === 'box') {
      this.width = 40;
      this.height = 40;
      this.hp = 1;
    } else if (type === 'vase') {
      this.width = 20;
      this.height = 28;
      this.hp = 1;
    } else {
      this.width = 40;
      this.height = 24;
      this.hp = 1;
    }`;

const newConstructor = `    if (type === 'box') {
      this.width = 40;
      this.height = 40;
      this.hp = 1;
    } else if (type === 'urn') {
      this.width = 30;
      this.height = 42;
      this.hp = 1;
    } else if (type === 'vase') {
      this.width = 20;
      this.height = 28;
      this.hp = 1;
    } else {
      this.width = 40;
      this.height = 24;
      this.hp = 1;
    }`;

code = code.replace(oldConstructor, newConstructor);

const oldParticles = `      // Explosion particles
      const newParticles = [];
      for (let i = 0; i < 8; i++) {
        const vx = (Math.random() - 0.5) * 200;
        const vy = -Math.random() * 200 - 50;
        newParticles.push({
          x: this.x + this.width / 2,
          y: this.y + this.height / 2,
          vx: vx,
          vy: vy,
          color: GAME_CONFIG.PALETTE.PEN_PRIMARY,
          size: Math.random() * 4 + 2,
          life: 0,
          maxLife: 1.0 + Math.random() * 0.5,
          alpha: 1.0,
          gravity: 800,
          shape: 'pen_scratch' as ParticleShape,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 10
        });
      }
      addParticles(newParticles);`;

const newParticles = `      // Explosion particles
      const newParticles = [];
      
      if (this.type === 'urn') {
        // Urn releases dust and ink/ash
        for (let i = 0; i < 12; i++) {
          const vx = (Math.random() - 0.5) * 150;
          const vy = -Math.random() * 150 - 30;
          newParticles.push({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            vx: vx,
            vy: vy,
            color: Math.random() > 0.5 ? '#888888' : GAME_CONFIG.PALETTE.PEN_PRIMARY,
            size: Math.random() * 8 + 4,
            life: 0,
            maxLife: 0.8 + Math.random() * 0.4,
            alpha: 0.8,
            gravity: 200,
            shape: 'ink_splatter' as ParticleShape,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 2
          });
        }
      } else {
        for (let i = 0; i < 8; i++) {
          const vx = (Math.random() - 0.5) * 200;
          const vy = -Math.random() * 200 - 50;
          newParticles.push({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            vx: vx,
            vy: vy,
            color: GAME_CONFIG.PALETTE.PEN_PRIMARY,
            size: Math.random() * 4 + 2,
            life: 0,
            maxLife: 1.0 + Math.random() * 0.5,
            alpha: 1.0,
            gravity: 800,
            shape: 'pen_scratch' as ParticleShape,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 10
          });
        }
      }
      addParticles(newParticles);`;

code = code.replace(oldParticles, newParticles);

// Add urn to the valid types
code = code.replace(/type: 'box' \| 'vase' \| 'rubble'/g, "type: 'box' | 'vase' | 'rubble' | 'urn'");

fs.writeFileSync('src/game/entities/Destructible.ts', code);
