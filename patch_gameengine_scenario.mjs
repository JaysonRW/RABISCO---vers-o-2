import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const regex1 = /this\.sectionManager = new SectionManager\('sanctuary_interior'\);/g;
const replacement1 = `const initialScenario = typeof window !== 'undefined' ? (localStorage.getItem('selected_initial_scenario') || 'sanctuary_interior') : 'sanctuary_interior';
    this.sectionManager = new SectionManager(initialScenario);`;

code = code.replace(regex1, replacement1);
fs.writeFileSync('src/game/GameEngine.ts', code);
