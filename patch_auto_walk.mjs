import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

// 1. Add property
const propertyInjection = `  public cameraY: number = 0;
  public isCutscenePlaying: boolean = false;
  public isAutoWalkingToBoss: boolean = false;`;
code = code.replace(
  `  public cameraY: number = 0;\n  public isCutscenePlaying: boolean = false;`,
  propertyInjection
);

// 2. Set auto-walking when entering sanctuary
const oldSetup = `      // Manage BGM based on section
      if (section.id === 'sanctuary_interior') {
        // Assume the user will upload a file named bgm_sanctuary.mp3 to public/ 
        // For now, it will try to load this URL.
        soundManager.playBGM('/bgm_sanctuary.mp3', 0.4);
      }`;
const newSetup = `      // Manage BGM based on section
      if (section.id === 'sanctuary_interior') {
        // Assume the user will upload a file named bgm_sanctuary.mp3 to public/ 
        // For now, it will try to load this URL.
        soundManager.playBGM('/bgm_sanctuary.mp3', 0.4);
        this.isCutscenePlaying = true;
        this.isAutoWalkingToBoss = true;
      }`;
code = code.replace(oldSetup, newSetup);

// 3. Mod activeInput
const oldInput = `    // Lock inputs if playing a cutscene
    const activeInput = this.isCutscenePlaying ? {
      left: false, right: false, jump: false, dash: false, attack: false, interact: false, useSalt: false
    } : this.input;`;

const newInput = `    // Lock inputs if playing a cutscene
    let activeInput = this.input;
    if (this.isCutscenePlaying) {
      activeInput = { left: false, right: false, jump: false, dash: false, attack: false, interact: false, useSalt: false };
      if (this.isAutoWalkingToBoss) {
        activeInput.right = true; // Força andar para a direita
      }
    }`;
code = code.replace(oldInput, newInput);

// 4. Reset on trigger
const oldTrigger = `      if (npc.autoTriggerDistance && dist < npc.autoTriggerDistance && !npc.hasTriggeredAutoDialog) {
        npc.hasTriggeredAutoDialog = true;
        this.input.left = false;`;

const newTrigger = `      if (npc.autoTriggerDistance && dist < npc.autoTriggerDistance && !npc.hasTriggeredAutoDialog) {
        this.isAutoWalkingToBoss = false;
        npc.hasTriggeredAutoDialog = true;
        this.input.left = false;`;
code = code.replace(oldTrigger, newTrigger);

fs.writeFileSync('src/game/GameEngine.ts', code);
