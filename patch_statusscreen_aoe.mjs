import fs from 'fs';
let code = fs.readFileSync('src/components/StatusScreen.tsx', 'utf8');

const anchor1 = `  const healCost = Math.round(30 * (1 + (level * 0.2)));`;
const rep1 = `  const healCost = Math.round(30 * (1 + (level * 0.2)));
  const aoeCost = Math.round(40 * (1 + (level * 0.2)));`;
if (code.includes(anchor1)) code = code.replace(anchor1, rep1);

const anchor2 = `  const healAmt = Math.round(25 * (1 + (level * 0.5)));`;
const rep2 = `  const healAmt = Math.round(25 * (1 + (level * 0.5)));
  const aoeDmg = Math.round(45 * (1 + (level * 0.5)));`;
if (code.includes(anchor2)) code = code.replace(anchor2, rep2);

const anchor3 = `                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-emerald-400">
                      <span>AURA DE CURA</span>
                      <span>CUSTO: {healCost} MP</span>
                    </div>
                    <div className="text-stone-400 text-lg flex justify-between">
                      <span>Comando: <span className="text-white">Trás, Baixo, Frente</span></span>
                      <span>Cura: {healAmt} HP</span>
                    </div>
                  </div>`;
const rep3 = `                  <div className="flex flex-col gap-1 border-b border-stone-800 pb-2">
                    <div className="flex justify-between text-emerald-400">
                      <span>AURA DE CURA</span>
                      <span>CUSTO: {healCost} MP</span>
                    </div>
                    <div className="text-stone-400 text-lg flex justify-between">
                      <span>Comando: <span className="text-white">Trás, Baixo, Frente</span></span>
                      <span>Cura: {healAmt} HP</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-purple-400">
                      <span>BORRÃO EXPLOSIVO (AoE)</span>
                      <span>CUSTO: {aoeCost} MP</span>
                    </div>
                    <div className="text-stone-400 text-lg flex justify-between">
                      <span>Comando: <span className="text-white">Baixo, Cima, Ataque</span></span>
                      <span>Dano em Área: {aoeDmg}</span>
                    </div>
                  </div>`;
if (code.includes(anchor3)) code = code.replace(anchor3, rep3);

fs.writeFileSync('src/components/StatusScreen.tsx', code);
