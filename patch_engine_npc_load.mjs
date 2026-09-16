import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const oldLoadNpcs = `  public loadSectionNPCs(section: SectionData) {
    this.npcs = section.npcConfigs.map(cfg => {
      return new NPC(cfg.id, cfg.name, cfg.title, cfg.x, cfg.y, cfg.dialogs, cfg.role);
    });
  }`;

const newLoadNpcs = `  public loadSectionNPCs(section: SectionData) {
    this.npcs = section.npcConfigs.map(cfg => {
      const npc = new NPC(cfg.id, cfg.name, cfg.title, cfg.x, cfg.y, cfg.dialogs, cfg.role);
      if (cfg.autoTriggerDistance) {
        npc.autoTriggerDistance = cfg.autoTriggerDistance;
      }
      return npc;
    });
  }`;

code = code.replace(oldLoadNpcs, newLoadNpcs);
fs.writeFileSync('src/game/GameEngine.ts', code);
