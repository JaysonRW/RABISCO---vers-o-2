import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

if (!code.includes('import { Destructible }')) {
  code = code.replace(
    'import { NPC, DialogChoice } from \'./entities/NPC\';',
    `import { NPC, DialogChoice } from './entities/NPC';
import { Destructible } from './entities/Destructible';`
  );
}

if (!code.includes('public destructibles: Destructible[] = [];')) {
  code = code.replace(
    'public npcs: NPC[] = [];',
    `public npcs: NPC[] = [];
  public destructibles: Destructible[] = [];`
  );
}

if (!code.includes('this.loadSectionDestructibles(section);')) {
  code = code.replace(
    'this.loadSectionNPCs(section);',
    `this.loadSectionNPCs(section);
      this.loadSectionDestructibles(section);`
  );
}

if (!code.includes('public loadSectionDestructibles')) {
  code = code.replace(
    'public loadSectionNPCs(section: SectionData) {',
    `public loadSectionDestructibles(section: SectionData) {
    this.destructibles = (section.destructibles || []).map(cfg => {
      return new Destructible(cfg.id, cfg.type, cfg.x, cfg.y);
    });
  }

  public loadSectionNPCs(section: SectionData) {`
  );
  
  code = code.replace(
    'this.loadSectionNPCs(this.sectionManager.currentSection);',
    `this.loadSectionNPCs(this.sectionManager.currentSection);
    this.loadSectionDestructibles(this.sectionManager.currentSection);`
  );
}

fs.writeFileSync('src/game/GameEngine.ts', code);
