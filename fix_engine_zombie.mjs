import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

code = code.replace("import { GhostEnemy } from './entities/GhostEnemy';", "import { GhostEnemy } from './entities/GhostEnemy';\nimport { ZombieEnemy } from './entities/ZombieEnemy';");

// Fix loadSectionEnemies
const oldLoadEnemies = `  public loadSectionEnemies(section: SectionData) {
    this.enemies = section.enemySpawns.map(cfg => {
      if (cfg.type === 'GHOUL') {
        return new GhoulEnemy(cfg.id, cfg.x, cfg.y, cfg.patrolMinX, cfg.patrolMaxX);
      } else {
        return new GhostEnemy(cfg.id, cfg.x, cfg.y);
      }
    });
  }`;

const newLoadEnemies = `  public loadSectionEnemies(section: SectionData) {
    this.enemies = section.enemySpawns.map(cfg => {
      if (cfg.type === 'ZOMBIE') {
        return new ZombieEnemy(cfg.id, cfg.x, cfg.y);
      } else if (cfg.type === 'GHOUL') {
        return new GhoulEnemy(cfg.id, cfg.x, cfg.y, cfg.patrolMinX, cfg.patrolMaxX);
      } else {
        return new GhostEnemy(cfg.id, cfg.x, cfg.y);
      }
    });
  }`;
code = code.replace(oldLoadEnemies, newLoadEnemies);

// Fix respawn logic (queueEnemyRespawn)
const oldQueue = `    this.enemyRespawnQueue.push({
      x: spawnX,
      y: spawnY,
      timer: 5.5,
      id: enemy.id,
    });`;
const newQueue = `    const isZombie = enemy.type === EnemyType.ZOMBIE;
    this.enemyRespawnQueue.push({
      x: spawnX,
      y: spawnY,
      timer: isZombie ? 1.5 : 5.5,
      id: enemy.id,
    });`;
code = code.replace(oldQueue, newQueue);

// Fix respawn instancing
const oldRespawnInst = `        const newEnemy = spawnCfg?.type === 'GHOUL'
          ? new GhoulEnemy(respawn.id, respawn.x, respawn.y, spawnCfg.patrolMinX, spawnCfg.patrolMaxX)
          : new GhostEnemy(respawn.id, respawn.x, respawn.y);`;
const newRespawnInst = `        let newEnemy: Enemy;
        if (spawnCfg?.type === 'ZOMBIE') {
          newEnemy = new ZombieEnemy(respawn.id, respawn.x, respawn.y);
        } else if (spawnCfg?.type === 'GHOUL') {
          newEnemy = new GhoulEnemy(respawn.id, respawn.x, respawn.y, spawnCfg.patrolMinX, spawnCfg.patrolMaxX);
        } else {
          newEnemy = new GhostEnemy(respawn.id, respawn.x, respawn.y);
        }`;
code = code.replace(oldRespawnInst, newRespawnInst);

// Handle rolling head
// When enemy is defeated, we can add a particle that behaves like a rolling head if it's a ZOMBIE
const enemyDefeatedCode = `          this.queueEnemyRespawn(enemy);
        }

        if (isSaltActive) {`;
const rollingHeadCode = `          this.queueEnemyRespawn(enemy);
          
          if (enemy.type === EnemyType.ZOMBIE) {
            // Spawn rolling head particle
            this.particles.push({
              x: enemy.x + enemy.width / 2,
              y: enemy.y,
              vx: (Math.random() - 0.5) * 200,
              vy: -150 - Math.random() * 100,
              life: 3.0,
              maxLife: 3.0,
              color: '#4ade80',
              size: 8, // Head size
              shape: 'ZOMBIE_HEAD'
            });
          }
        }

        if (isSaltActive) {`;
code = code.replace(enemyDefeatedCode, rollingHeadCode);

fs.writeFileSync('src/game/GameEngine.ts', code);
