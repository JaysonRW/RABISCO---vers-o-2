import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

code = code.replace(
  '// 3a. Renderiza Destructibles',
  `// Failsafe for Hot Module Replacement (HMR) if array is empty
    if (this.destructibles.length === 0 && this.sectionManager.currentSection.destructibles && this.sectionManager.currentSection.destructibles.length > 0) {
      this.loadSectionDestructibles(this.sectionManager.currentSection);
    }
    
    // 3a. Renderiza Destructibles`
);

fs.writeFileSync('src/game/GameEngine.ts', code);
