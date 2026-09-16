import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

code = code.replace(
  "this.sectionManager = new SectionManager('monastery_courtyard');",
  "this.sectionManager = new SectionManager('sanctuary_interior');"
);
code = code.replace(
  "this.sectionManager = new SectionManager('monastery_courtyard');",
  "this.sectionManager = new SectionManager('sanctuary_interior');"
);

fs.writeFileSync('src/game/GameEngine.ts', code);
