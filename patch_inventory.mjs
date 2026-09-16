import fs from 'fs';
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// 1. Add state
code = code.replace(
  'const [showRespawnBanner, setShowRespawnBanner] = useState(false);',
  'const [showRespawnBanner, setShowRespawnBanner] = useState(false);\n  const [showInventoryModal, setShowInventoryModal] = useState(false);'
);

// 2. Add Enter key to handleKeyDown
code = code.replace(
  "        case 'KeyR':\n          handleReset();\n          break;\n      }",
  "        case 'KeyR':\n          handleReset();\n          break;\n        case 'Enter':\n          setShowInventoryModal(prev => !prev);\n          break;\n      }"
);

// 3. Replace floating UI and add Modal
const oldUI = `{/* Menu de Inventário Rápido */}
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
          </div>`;

const newModalUI = `{/* Modal de Inventário (Enter) */}
          {showInventoryModal && (
            <div className="absolute inset-0 bg-[#051442]/95 flex flex-col items-center justify-center text-[#FFFFFF] z-40 animate-in fade-in duration-200">
              <div className="bg-[#FFFFFF] border-4 border-[#0A2570] rounded-sm p-6 max-w-lg w-full flex flex-col items-center">
                <h2 className="text-2xl font-black font-['Cinzel'] text-[#0A2570] mb-4 tracking-widest border-b-2 border-[#0A2570] w-full text-center pb-2">
                  INVENTÁRIO
                </h2>
                
                <div className="flex flex-col gap-3 w-full max-h-[60vh] overflow-y-auto pr-2">
                  {stats.inventory && stats.inventory.length > 0 ? (
                    stats.inventory.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between bg-[#F8FAFC] border-2 border-[#0A2570] rounded p-3 text-[#0A2570] hover:bg-[#E2E8F0] transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl bg-[#0A2570] rounded p-2 shadow-inner">
                            {item.icon === 'salt' ? '🧂' : item.icon === 'flask' ? '🧪' : item.icon === 'sword' ? '🗡️' : item.icon === 'stake' ? '🧛' : '✝️'}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-lg font-bold font-serif leading-tight">{item.name}</span>
                            <span className="text-xs font-serif text-[#143D99] italic">{item.description}</span>
                          </div>
                        </div>
                        {item.count !== undefined && (
                          <div className="flex flex-col items-center justify-center min-w-[3rem]">
                            <span className="text-xs font-bold text-[#143D99] uppercase">Qtd</span>
                            <span className="text-xl font-black font-['Special_Elite']">{item.count}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-[#0A2570] font-serif py-8 italic">Seu inventário está vazio.</p>
                  )}
                </div>

                <button
                  onClick={() => setShowInventoryModal(false)}
                  className="mt-6 px-8 py-2 bg-[#0A2570] hover:bg-[#143D99] text-[#FFFFFF] font-bold rounded font-serif border-2 border-[#051442] tracking-wider transition-all shadow-md active:scale-95"
                >
                  FECHAR [Enter]
                </button>
              </div>
            </div>
          )}`;

code = code.replace(oldUI, '');

code = code.replace(
  '{/* Banner de Morte / Renascimento */}',
  newModalUI + '\n\n          {/* Banner de Morte / Renascimento */}'
);

fs.writeFileSync('src/components/GameCanvas.tsx', code);
