import fs from 'fs';
let code = fs.readFileSync('src/game/entities/NPC.ts', 'utf8');

code = code.replace(
  '  public currentDialogId: string;',
  '  public currentDialogId: string;\n  public autoTriggerDistance?: number;\n  public hasTriggeredAutoDialog: boolean = false;'
);

fs.writeFileSync('src/game/entities/NPC.ts', code);
