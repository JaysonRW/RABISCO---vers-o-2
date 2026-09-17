import React from 'react';
import { AscensionStats } from '../game/types';
import { Target, Lock } from 'lucide-react';

interface StatusScreenProps {
  stats: any;
  onClose: () => void;
  onClearNewItems?: () => void;
  onUseItem?: (itemId: string) => void;
}


export const StatusScreen: React.FC<StatusScreenProps> = ({ stats, onClose, onClearNewItems }) => {
  const level = stats.ascension.level;
  
  const fireballCost = Math.round(25 * (1 + (level * 0.2)));
  const healCost = Math.round(30 * (1 + (level * 0.2)));
  const aoeCost = Math.round(40 * (1 + (level * 0.2)));
  
  const fireballDmg = Math.round(30 * (1 + (level * 0.5)));
  const healAmt = Math.round(25 * (1 + (level * 0.5)));
  const aoeDmg = Math.round(45 * (1 + (level * 0.5)));
  
  const attackDmg = Math.round(20 * stats.ascension.damageMultiplier);

  // Controle de abas internas no modal de status
  const [activeTab, setActiveTab] = React.useState<'SPELLS' | 'EQUIPMENT' | 'GRIMOIRE' | 'INVENTORY'>('SPELLS');

  // Memorize se o jogador já visualizou a aba nesta abertura do modal
  const [viewedInventory, setViewedInventory] = React.useState(false);

  React.useEffect(() => {
    if (activeTab === 'INVENTORY') {
      setViewedInventory(true);
    }
  }, [activeTab]);

  const onClearNewItemsRef = React.useRef(onClearNewItems);
  React.useEffect(() => {
    onClearNewItemsRef.current = onClearNewItems;
  }, [onClearNewItems]);

  React.useEffect(() => {
    // Quando o componente for desmontado (fechando o menu de Status), 
    // limpamos os itens se ele viu o inventário
    return () => {
      if (viewedInventory && onClearNewItemsRef.current) {
        onClearNewItemsRef.current();
      }
    };
  }, [viewedInventory]);

  // Checa se há itens novos no inventário
  const hasNewItems = stats.inventory?.some((item: any) => item.isNew) || false;

  return (
    <div 
      className="fixed inset-0 z-50 flex bg-black/90 backdrop-blur-md font-['Caveat'] text-[#f4ecd8] select-none animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Container Principal */}
      <div 
        className="w-full h-full flex flex-col md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-[400px] border-b-2 md:border-b-0 md:border-r-2 border-stone-800 bg-black/70 p-8 flex flex-col justify-between shadow-[20px_0_40px_rgba(0,0,0,0.8)] z-10">
          <div className="flex flex-col gap-10">
            {/* Avatar & Header */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-40 h-40 border-2 border-stone-600 overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-sm bg-stone-900">
                <img src="/Heroi1.png" alt="Avatar" className="w-full h-full object-cover object-top" />
              </div>
              <div className="text-center w-full">
                <h2 className="text-4xl md:text-5xl font-['Cinzel'] tracking-widest text-white">CAVALEIRO</h2>
                <span className="text-emerald-500 text-xl md:text-2xl tracking-widest block mt-1">{stats.ascension.title.toUpperCase()}</span>
                <span className="text-stone-500 text-xl block mt-2 font-serif italic">Nível {level}</span>
              </div>
            </div>

            {/* Main Stats */}
            <div className="flex flex-col gap-3 text-2xl px-2">
              <div className="flex justify-between border-b border-stone-800/50 pb-2">
                <span className="text-stone-400">HP</span>
                <span className="text-red-400 font-bold">{Math.round(stats.hp)} / {stats.maxHp}</span>
              </div>
              <div className="flex justify-between border-b border-stone-800/50 pb-2">
                <span className="text-stone-400">MP</span>
                <span className="text-purple-400 font-bold">{Math.round(stats.mp)} / {stats.maxMp}</span>
              </div>
              <div className="flex justify-between border-b border-stone-800/50 pb-2">
                <span className="text-stone-400">STM</span>
                <span className="text-blue-400 font-bold">{Math.round(stats.stamina)} / {stats.maxStamina}</span>
              </div>
              <div className="flex justify-between border-b border-stone-800/50 pb-2">
                <span className="text-stone-400">ATK</span>
                <span className="text-red-500 font-bold">{attackDmg}</span>
              </div>
              <div className="flex justify-between border-b border-stone-800/50 pb-2">
                <span className="text-stone-400">SAL</span>
                <span className="text-amber-100 font-bold">{stats.saltCount} / 4</span>
              </div>
            </div>

            {/* Ascension Progress */}
            <div className="flex flex-col gap-2 px-2 mt-2">
              <div className="flex justify-between text-xl">
                <span className="text-stone-400 tracking-widest">ALMAS</span>
                <span className="text-white font-['Cinzel'] font-bold">{stats.ascension.soulsCurrentLevel} / {stats.ascension.soulsNeededForNext}</span>
              </div>
              <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{width: `${(stats.ascension.soulsCurrentLevel / stats.ascension.soulsNeededForNext) * 100}%`}} />
              </div>
            </div>
          </div>

          {/* Close Hint */}
          <div className="hidden md:block text-center text-stone-500 text-xl animate-pulse cursor-pointer hover:text-white mt-10 transition-colors" onClick={onClose}>
            [ PRESSIONE TAB PARA RETORNAR ]
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col p-6 md:p-12 overflow-hidden relative">
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-4 md:gap-8 mb-8 border-b-2 border-stone-800 pb-6 w-full max-w-4xl mx-auto">
            <button 
              onClick={() => setActiveTab('SPELLS')}
              className={`text-xl md:text-2xl font-['Cinzel'] tracking-widest transition-all px-2 py-1 ${activeTab === 'SPELLS' ? 'text-red-400 border-b-2 border-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'text-stone-500 hover:text-stone-300 border-b-2 border-transparent hover:border-stone-500'}`}
            >
              MAGIAS
            </button>
            <button 
              onClick={() => setActiveTab('EQUIPMENT')}
              className={`text-xl md:text-2xl font-['Cinzel'] tracking-widest transition-all px-2 py-1 ${activeTab === 'EQUIPMENT' ? 'text-amber-500 border-b-2 border-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-stone-500 hover:text-stone-300 border-b-2 border-transparent hover:border-stone-500'}`}
            >
              EQUIPAMENTO
            </button>
            <button 
              onClick={() => setActiveTab('INVENTORY')}
              className={`relative text-xl md:text-2xl font-['Cinzel'] tracking-widest transition-all px-2 py-1 ${activeTab === 'INVENTORY' ? 'text-blue-400 border-b-2 border-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-stone-500 hover:text-stone-300 border-b-2 border-transparent hover:border-stone-500'}`}
            >
              INVENTÁRIO
              {hasNewItems && (
                <span className="absolute -top-1 -right-2 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border border-black shadow-[0_0_10px_rgba(59,130,246,0.8)] text-[9px] text-white items-center justify-center font-sans font-bold">!</span>
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('GRIMOIRE')}
              className={`text-xl md:text-2xl font-['Cinzel'] tracking-widest transition-all px-2 py-1 ${activeTab === 'GRIMOIRE' ? 'text-purple-400 border-b-2 border-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]' : 'text-stone-500 hover:text-stone-300 border-b-2 border-transparent hover:border-stone-500'}`}
            >
              GRIMÓRIO
            </button>
          </div>

          {/* Tab Content Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar w-full max-w-4xl mx-auto">
            {/* SPELLS */}
            {activeTab === 'SPELLS' && (
              <div className="flex flex-col gap-6 text-xl md:text-2xl animate-in slide-in-from-right-8 fade-in duration-300">
                {(!stats.learnedSpells || Object.keys(stats.learnedSpells).length === 0) && (
                  <div 
                    className="text-center mt-12 text-2xl font-['Special_Elite'] text-[#2d3748] tracking-[0.05em]"
                    style={{ textShadow: '1px 1px 2px #a0aec0' }}
                  >
                    Você possui poderes ocultos além da sua compreensão.
                  </div>
                )}
                
                {stats.learnedSpells?.['fireball'] && (
                  <div className="flex flex-col gap-2 border-b border-stone-800/50 pb-4">
                    <div className="flex justify-between text-orange-400 font-bold">
                      <span>BOLA DE FOGO</span>
                      <span>CUSTO: {fireballCost} MP</span>
                    </div>
                    <div className="text-stone-400 text-lg flex justify-between font-serif">
                      <span>Comando: <span className="text-white">Frente, Baixo, Frente, Baixo</span></span>
                      <span>Dano: {fireballDmg}</span>
                    </div>
                  </div>
                )}
                
                {stats.learnedSpells?.['heal'] && (
                  <div className="flex flex-col gap-2 border-b border-stone-800/50 pb-4">
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>AURA DE CURA</span>
                      <span>CUSTO: {healCost} MP</span>
                    </div>
                    <div className="text-stone-400 text-lg flex justify-between font-serif">
                      <span>Comando: <span className="text-white">Trás, Baixo, Frente</span></span>
                      <span>Cura: {healAmt} HP</span>
                    </div>
                  </div>
                )}
                
                {stats.learnedSpells?.['aoe'] && (
                  <div className="flex flex-col gap-2 border-b border-stone-800/50 pb-4">
                    <div className="flex justify-between text-purple-400 font-bold">
                      <span>BORRÃO EXPLOSIVO (AoE)</span>
                      <span>CUSTO: {aoeCost} MP</span>
                    </div>
                    <div className="text-stone-400 text-lg flex justify-between font-serif">
                      <span>Comando: <span className="text-white">Baixo, Baixo, Cima</span></span>
                      <span>Dano em Área: {aoeDmg}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* EQUIPMENT */}
            {activeTab === 'EQUIPMENT' && (
              <div className="flex flex-col gap-6 text-xl md:text-2xl animate-in slide-in-from-right-8 fade-in duration-300">
                <div className="flex flex-col gap-2 border-b border-stone-800/50 pb-4">
                  <div className="flex justify-between text-stone-300 font-bold">
                    <span>LÂMINA ARRUINADA</span>
                    <span className="text-amber-500 font-['Cinzel'] tracking-widest">NÍVEL 1</span>
                  </div>
                  <div className="text-stone-400 text-lg flex justify-between font-serif">
                    <span>Espada pesada do cavaleiro.</span>
                    <span>Dano: {attackDmg} (Físico)</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 border-b border-stone-800/50 pb-4">
                  <div className="flex justify-between text-stone-300 font-bold">
                    <span>SAL PURIFICADOR</span>
                    <span className="text-amber-100">{stats.saltCount} / 4</span>
                  </div>
                  <div className="text-stone-400 text-lg flex justify-between font-serif">
                    <span>Usado para curar ou purificar armas.</span>
                    <span>Restaurado em santuários.</span>
                  </div>
                </div>
              </div>
            )}

            {/* INVENTORY */}
            {activeTab === 'INVENTORY' && (
              <div className="flex flex-col gap-6 animate-in slide-in-from-right-8 fade-in duration-300 pb-20 overflow-y-auto custom-scrollbar h-full">
                {stats.inventory && stats.inventory.length > 0 ? (
                  Object.entries(
                    stats.inventory.reduce((acc: any, item: any) => {
                      const category = item.type || 'OUTROS';
                      if (!acc[category]) acc[category] = [];
                      acc[category].push(item);
                      return acc;
                    }, {})
                  ).sort((a: any, b: any) => a[0].localeCompare(b[0])).map(([category, items]: any) => (
                    <div key={category} className="flex flex-col gap-3">
                      <h3 className="relative flex items-center gap-3 text-stone-400 font-['Cinzel'] text-xl tracking-widest border-b border-stone-800/80 pb-2 mb-1 mt-2">
                        <span>
                        {category === 'WEAPON' ? 'ARMAS' :
                         category === 'SUB_WEAPON' ? 'SUB-ARMAS' :
                         category === 'CONSUMABLE' ? 'CONSUMÍVEIS' :
                         category === 'COATING' ? 'REVESTIMENTOS' :
                         category === 'AMMUNITION' ? 'RECURSOS E MUNIÇÃO' :
                         category === 'BUFF' ? 'AMULETOS E BÊNÇÃOS' :
                         category === 'SPECIAL' ? 'ITENS ESPECIAIS' :
                         category === 'RELIC' ? 'RELÍQUIAS' : 
                         category}
                        </span>
                        {items.some((i: any) => i.isNew) && (
                          <span className="relative flex h-2 w-2 mt-0.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                          </span>
                        )}
                      </h3>
                      <div className="flex flex-col gap-3">
                        {(items as any[]).map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between bg-black/40 border border-stone-800/60 rounded-md p-4 text-stone-300 hover:bg-black/80 hover:border-stone-700 transition-all">
                            <div className="flex items-center gap-5">
                              <span className="relative text-4xl bg-black/50 rounded-lg p-3 border border-stone-800 shadow-inner min-w-[70px] text-center">
                                {item.icon === 'salt' ? '🧂' : item.icon === 'flask' ? '🧪' : item.icon === 'sword' ? '🗡️' : '✝️'}
                                {item.isNew && (
                                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                                  </span>
                                )}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-xl font-bold font-serif leading-tight text-white">{item.name}</span>
                                <span className="text-sm font-serif text-stone-500 italic mt-1">{item.description}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {item.count !== undefined && (
                                <div className="flex flex-col items-center justify-center min-w-[4rem] border-l border-stone-800 pl-4 ml-2">
                                  <span className="text-[10px] text-stone-600 uppercase tracking-widest">Qtd</span>
                                  <span className="text-3xl font-black font-['Special_Elite'] text-amber-500">{item.count}</span>
                                </div>
                              )}
                              
                              {/* Always render the button for Weapons, Consumables, and Coatings. Passives like relics won't have the button */}
                              {!item.isPassive && (
                                <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onUseItem) {
                                    onUseItem(item.id);
                                  }
                                }}
                                className="px-4 py-2 border-2 border-stone-700 bg-stone-900/50 hover:bg-stone-800 text-stone-300 hover:text-white rounded font-['Cinzel'] text-sm tracking-widest transition-colors whitespace-nowrap"
                              >
                                {item.type === 'WEAPON' ? 'EQUIPAR' : 'USAR'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-stone-600 text-center mt-12 italic text-2xl font-serif">
                    Sua bolsa está vazia.
                  </div>
                )}
              </div>
            )}
            {/* GRIMOIRE */}
            {activeTab === 'GRIMOIRE' && (
              <div className="relative h-full min-h-[400px] animate-in slide-in-from-right-8 fade-in duration-300 rounded overflow-hidden">
                {/* Textura de papel envelhecido (fundo escuro e ruído) */}
                <div className="absolute inset-0 bg-[#1c150c] pointer-events-none opacity-80 mix-blend-multiply" />
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.15]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
                
                <div className="relative z-10 flex flex-col gap-4 h-full p-6 overflow-y-auto custom-scrollbar">
                  <div className="text-amber-700/80 text-xl mb-4 italic font-bold text-center border-b border-amber-900/30 pb-4 font-serif">
                    O conhecimento é poder. Conheça as fraquezas das abominações.
                  </div>
                  
                  {Object.keys(stats.killCounts || {}).length === 0 && (
                    <div className="text-stone-600 text-center mt-12 italic text-2xl font-serif">
                      Nenhum registro encontrado. Abata inimigos para catalogá-los.
                    </div>
                  )}

                  {/* Espectro */}
                  {(stats.killCounts['GHOST'] || 0) > 0 && (
                  <div className="border border-stone-800/80 p-4 bg-black/40 rounded-sm">
                    <div className="flex justify-between items-center text-purple-300 font-['Cinzel'] text-2xl border-b border-stone-800/50 pb-2 mb-2">
                      <span>ESPECTRO</span>
                      <span className="text-stone-500 text-base font-serif italic">Abatidos: {stats.killCounts['GHOST']}</span>
                    </div>
                    <div className="text-stone-300 text-xl font-serif">
                      <span className="text-red-400 font-bold">Imune:</span> Dano Físico
                      {stats.killCounts['GHOST'] >= 10 ? (
                        <div className="flex items-center gap-2 mt-2 text-green-400">
                          <Target className="w-5 h-5" />
                          <span><span className="font-bold">Fraqueza:</span> Sal Purificador, Magia Divina</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-2 text-stone-500">
                          <Lock className="w-5 h-5" />
                          <span><span className="font-bold">Fraqueza:</span> Desconhecida (Derrote 10 para revelar)</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Carniçal */}
                {(stats.killCounts['GHOUL'] || 0) > 0 && (
                  <div className="border border-stone-800/80 p-4 bg-black/40 rounded-sm">
                    <div className="flex justify-between items-center text-red-300 font-['Cinzel'] text-2xl border-b border-stone-800/50 pb-2 mb-2">
                      <span>CARNIÇAL</span>
                      <span className="text-stone-500 text-base font-serif italic">Abatidos: {stats.killCounts['GHOUL']}</span>
                    </div>
                    <div className="text-stone-300 text-xl font-serif">
                      <span className="text-red-400 font-bold">Imune:</span> Nenhum
                      {stats.killCounts['GHOUL'] >= 10 ? (
                        <div className="flex items-center gap-2 mt-2 text-green-400">
                          <Target className="w-5 h-5" />
                          <span><span className="font-bold">Fraqueza:</span> Dano Físico</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-2 text-stone-500">
                          <Lock className="w-5 h-5" />
                          <span><span className="font-bold">Fraqueza:</span> Desconhecida (Derrote 10 para revelar)</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Zumbi */}
                {(stats.killCounts['ZOMBIE'] || 0) > 0 && (
                  <div className="border border-stone-800/80 p-4 bg-black/40 rounded-sm">
                    <div className="flex justify-between items-center text-emerald-300 font-['Cinzel'] text-2xl border-b border-stone-800/50 pb-2 mb-2">
                      <span>ZUMBI AMALDIÇOADO</span>
                      <span className="text-stone-500 text-base font-serif italic">Abatidos: {stats.killCounts['ZOMBIE']}</span>
                    </div>
                    <div className="text-stone-300 text-xl font-serif">
                      <span className="text-red-400 font-bold">Imune:</span> Sal Purificador
                      {stats.killCounts['ZOMBIE'] >= 10 ? (
                        <div className="flex items-center gap-2 mt-2 text-green-400">
                          <Target className="w-5 h-5" />
                          <span><span className="font-bold">Fraqueza:</span> Fogo (Bola de Fogo)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-2 text-stone-500">
                          <Lock className="w-5 h-5" />
                          <span><span className="font-bold">Fraqueza:</span> Desconhecida (Derrote 10 para revelar)</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Caveira */}
                {(stats.killCounts['SKULL'] || 0) > 0 && (
                  <div className="border border-stone-800/80 p-4 bg-black/40 rounded-sm">
                    <div className="flex justify-between items-center text-stone-300 font-['Cinzel'] text-2xl border-b border-stone-800/50 pb-2 mb-2">
                      <span>CAVEIRA FLUTUANTE</span>
                      <span className="text-stone-500 text-base font-serif italic">Abatidos: {stats.killCounts['SKULL']}</span>
                    </div>
                    <div className="text-stone-400 text-xl font-serif mt-2">
                      Entidade etérea estática. Destrói-se facilmente com qualquer ataque físico.
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
          
          <div className="md:hidden text-center text-stone-500 text-xl mt-8 cursor-pointer border border-stone-800 py-3 rounded bg-black/50" onClick={onClose}>
            FECHAR STATUS
          </div>
        </div>
      </div>
    </div>
  );
};
