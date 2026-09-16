import fs from 'fs';
let code = fs.readFileSync('src/components/StatusScreen.tsx', 'utf8');

const anchor = `  const attackDmg = Math.round(20 * stats.ascension.damageMultiplier);`;
const replacement = `  const attackDmg = Math.round(20 * stats.ascension.damageMultiplier);

  // Controle de abas internas no modal de status
  const [activeTab, setActiveTab] = React.useState<'SPELLS' | 'EQUIPMENT'>('SPELLS');`;

if (code.includes(anchor)) {
    code = code.replace(anchor, replacement);
}

const windowAnchor = `          {/* Spells Menu / Window */}
          <div className="mt-4 border-2 border-stone-600 bg-stone-900/80 p-4 shadow-inner relative">
            <div className="absolute -top-4 left-4 bg-black px-2 text-xl text-red-500 font-['Cinzel'] tracking-widest">
              MAGIAS (SPELLS)
            </div>
            
            <div className="flex flex-col gap-4 mt-2 text-xl md:text-2xl">
              <div className="flex flex-col gap-1 border-b border-stone-800 pb-2">
                <div className="flex justify-between text-orange-400">
                  <span>BOLA DE FOGO</span>
                  <span>CUSTO: {fireballCost} MP</span>
                </div>
                <div className="text-stone-400 text-lg flex justify-between">
                  <span>Comando: <span className="text-white">Frente, Baixo, Frente, Baixo</span></span>
                  <span>Dano: {fireballDmg}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-emerald-400">
                  <span>AURA DE CURA</span>
                  <span>CUSTO: {healCost} MP</span>
                </div>
                <div className="text-stone-400 text-lg flex justify-between">
                  <span>Comando: <span className="text-white">Trás, Baixo, Frente</span></span>
                  <span>Cura: {healAmt} HP</span>
                </div>
              </div>
            </div>
          </div>`;

const newWindow = `          {/* Interactive Sub-Menu Tabs */}
          <div className="flex gap-4 mt-2">
            <button 
              onClick={() => setActiveTab('SPELLS')}
              className={\`px-4 py-1 font-['Cinzel'] tracking-widest border-2 transition-all \${activeTab === 'SPELLS' ? 'border-red-500 text-red-500 bg-stone-900' : 'border-stone-700 text-stone-500 hover:border-stone-500 hover:text-stone-300'}\`}
            >
              MAGIAS
            </button>
            <button 
              onClick={() => setActiveTab('EQUIPMENT')}
              className={\`px-4 py-1 font-['Cinzel'] tracking-widest border-2 transition-all \${activeTab === 'EQUIPMENT' ? 'border-amber-500 text-amber-500 bg-stone-900' : 'border-stone-700 text-stone-500 hover:border-stone-500 hover:text-stone-300'}\`}
            >
              EQUIPAMENTO
            </button>
          </div>

          {/* Dynamic Window Content */}
          <div className="border-2 border-stone-600 bg-stone-900/80 p-4 shadow-inner relative min-h-[160px]">
            {activeTab === 'SPELLS' && (
              <>
                <div className="flex flex-col gap-4 text-xl md:text-2xl">
                  <div className="flex flex-col gap-1 border-b border-stone-800 pb-2">
                    <div className="flex justify-between text-orange-400">
                      <span>BOLA DE FOGO</span>
                      <span>CUSTO: {fireballCost} MP</span>
                    </div>
                    <div className="text-stone-400 text-lg flex justify-between">
                      <span>Comando: <span className="text-white">Frente, Baixo, Frente, Baixo</span></span>
                      <span>Dano: {fireballDmg}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-emerald-400">
                      <span>AURA DE CURA</span>
                      <span>CUSTO: {healCost} MP</span>
                    </div>
                    <div className="text-stone-400 text-lg flex justify-between">
                      <span>Comando: <span className="text-white">Trás, Baixo, Frente</span></span>
                      <span>Cura: {healAmt} HP</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'EQUIPMENT' && (
              <>
                <div className="flex flex-col gap-4 text-xl md:text-2xl">
                  <div className="flex flex-col gap-1 border-b border-stone-800 pb-2">
                    <div className="flex justify-between text-stone-300">
                      <span>LÂMINA ARRUINADA</span>
                      <span className="text-amber-500">NÍVEL 1</span>
                    </div>
                    <div className="text-stone-400 text-lg flex justify-between">
                      <span>Espada pesada do cavaleiro.</span>
                      <span>Dano: {attackDmg} (Físico)</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-stone-300">
                      <span>SAL PURIFICADOR</span>
                      <span className="text-amber-100">{stats.saltCount} / 4</span>
                    </div>
                    <div className="text-stone-400 text-lg flex justify-between">
                      <span>Usado para curar ou purificar armas.</span>
                      <span>Restaurado em santuários.</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>`;

if (code.includes(windowAnchor)) {
    code = code.replace(windowAnchor, newWindow);
}

fs.writeFileSync('src/components/StatusScreen.tsx', code);
