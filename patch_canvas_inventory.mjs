import fs from 'fs';
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

code = code.replace(
  '// 9. Comunica dados com a UI do React',
  `// 9. Comunica dados com a UI do React`
);

// We need to add "inventory: []" to the state
code = code.replace(
  'saltCount: 5,\n    playerState:',
  'saltCount: 5,\n    inventory: [] as any[],\n    playerState:'
);

const inventoryUI = `
          {/* Menu de Inventário Rápido */}
          <div className="absolute left-4 top-24 flex flex-col gap-2 z-20 pointer-events-none">
            {stats.inventory && stats.inventory.map((item: any) => (
              <div key={item.id} className="flex items-center gap-2 bg-[#051442]/90 border border-[#255AC4] rounded px-3 py-1.5 text-white shadow-md animate-in slide-in-from-left duration-300">
                <span className="text-lg">{item.icon === 'salt' ? '🧂' : '🧪'}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold font-serif">{item.name}</span>
                  <span className="text-[10px] text-[#255AC4]">Qtd: {item.count}</span>
                </div>
              </div>
            ))}
          </div>
`;

code = code.replace(
  '{/* Canvas de Renderização 2D */}',
  inventoryUI + '\n        {/* Canvas de Renderização 2D */}'
);

fs.writeFileSync('src/components/GameCanvas.tsx', code);
