import fs from 'fs';
let code = fs.readFileSync('src/game/world/Section.ts', 'utf8');

if (!code.includes('export interface DestructibleConfig')) {
  code = code.replace(
    'export interface SectionData {',
    `export interface DestructibleConfig {
  id: string;
  type: 'box' | 'vase' | 'rubble';
  x: number;
  y: number;
}

export interface SectionData {`
  );
  
  code = code.replace(
    'npcConfigs: NpcSpawnConfig[];',
    `npcConfigs: NpcSpawnConfig[];
  destructibles?: DestructibleConfig[];`
  );
  
  // Add some destructibles to monastery_courtyard
  code = code.replace(
    'npcConfigs: [',
    `destructibles: [
      { id: 'd1', type: 'box', x: 200, y: 380 },
      { id: 'd2', type: 'vase', x: 240, y: 392 },
      { id: 'd3', type: 'rubble', x: 300, y: 396 },
    ],
    npcConfigs: [`
  );
  
  fs.writeFileSync('src/game/world/Section.ts', code);
}
