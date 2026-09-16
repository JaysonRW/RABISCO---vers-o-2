import React from 'react';
import { AscensionStats } from '../game/types';

interface StatusScreenProps {
  stats: {
    hp: number;
    maxHp: number;
    stamina: number;
    maxStamina: number;
    mp: number;
    maxMp: number;
    ascension: AscensionStats;
    saltCount: number;
  };
  onClose: () => void;
}

export const StatusScreen: React.FC<StatusScreenProps> = ({ stats, onClose }) => {
  const level = stats.ascension.level;
  
  const fireballCost = Math.round(25 * (1 + (level * 0.2)));
  const healCost = Math.round(30 * (1 + (level * 0.2)));
  const aoeCost = Math.round(40 * (1 + (level * 0.2)));
  
  const fireballDmg = Math.round(30 * (1 + (level * 0.5)));
  const healAmt = Math.round(25 * (1 + (level * 0.5)));
  const aoeDmg = Math.round(45 * (1 + (level * 0.5)));
  
  const attackDmg = Math.round(20 * stats.ascension.damageMultiplier);

  // Controle de abas internas no modal de status
  const [activeTab, setActiveTab] = React.useState<'SPELLS' | 'EQUIPMENT'>('SPELLS');

  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm font-['Caveat'] text-[#f4ecd8] select-none"
      onClick={onClose}
    >
      <div 
        className="w-[800px] max-w-[95vw] bg-black border-2 border-stone-500 shadow-[0_0_30px_rgba(0,0,0,1)] p-6 md:p-10 flex flex-col md:flex-row gap-8 relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.8)'
        }}
      >
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4 border-r-2 border-stone-700 pr-8">
          <div className="w-40 h-40 border-2 border-stone-500 bg-stone-900 overflow-hidden shadow-inner">
            <img src="/Heroi1.png" alt="Avatar" className="w-full h-full object-cover object-top" />
          </div>
          <div className="text-center w-full mt-4 flex flex-col gap-1 text-2xl tracking-wider">
            <div className="flex justify-between border-b border-stone-700 pb-1">
              <span className="text-stone-400">XP</span>
              <span>{stats.ascension.soulsCurrentLevel}/{stats.ascension.soulsNeededForNext}</span>
            </div>
            <div className="flex justify-between border-b border-stone-700 pb-1">
              <span className="text-stone-400">SOULS</span>
              <span>{stats.ascension.souls}</span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex justify-between items-start border-b-2 border-stone-700 pb-4">
            <div className="flex flex-col">
              <h2 className="text-4xl md:text-5xl font-['Cinzel'] tracking-widest text-white mb-2">CAVALEIRO</h2>
              <div className="flex flex-col gap-1 text-2xl md:text-3xl">
                <div className="flex gap-4">
                  <span className="text-stone-400 w-16">HP</span>
                  <span className="text-red-400">{Math.round(stats.hp)} / {stats.maxHp}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-stone-400 w-16">MP</span>
                  <span className="text-purple-400">{Math.round(stats.mp)} / {stats.maxMp}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-stone-400 w-16">STM</span>
                  <span className="text-blue-400">{Math.round(stats.stamina)} / {stats.maxStamina}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end text-right">
              <span className="text-2xl text-stone-400">LEVEL {level}</span>
              <span className="text-3xl text-emerald-500 mt-2">STATUS</span>
              <span className="text-xl text-white tracking-widest">{stats.ascension.title.toUpperCase()}</span>
            </div>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1 text-3xl">
              <div className="flex gap-8">
                <span className="text-stone-400">ATK</span>
                <span className="text-red-500">{attackDmg}</span>
              </div>
              <div className="flex gap-8">
                <span className="text-stone-400">SAL</span>
                <span className="text-amber-100">{stats.saltCount} / 4</span>
              </div>
            </div>
          </div>
          
          {/* Interactive Sub-Menu Tabs */}
          <div className="flex gap-4 mt-2">
            <button 
              onClick={() => setActiveTab('SPELLS')}
              className={`px-4 py-1 font-['Cinzel'] tracking-widest border-2 transition-all ${activeTab === 'SPELLS' ? 'border-red-500 text-red-500 bg-stone-900' : 'border-stone-700 text-stone-500 hover:border-stone-500 hover:text-stone-300'}`}
            >
              MAGIAS
            </button>
            <button 
              onClick={() => setActiveTab('EQUIPMENT')}
              className={`px-4 py-1 font-['Cinzel'] tracking-widest border-2 transition-all ${activeTab === 'EQUIPMENT' ? 'border-amber-500 text-amber-500 bg-stone-900' : 'border-stone-700 text-stone-500 hover:border-stone-500 hover:text-stone-300'}`}
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
                  
                  <div className="flex flex-col gap-1 border-b border-stone-800 pb-2">
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
                      <span>Comando: <span className="text-white">Baixo, Baixo, Cima</span></span>
                      <span>Dano em Área: {aoeDmg}</span>
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
          </div>
          
          <div className="absolute bottom-6 right-6 text-stone-500 text-xl animate-pulse cursor-pointer hover:text-white" onClick={onClose}>
            [ PRESSIONE TAB PARA FECHAR ]
          </div>
        </div>
      </div>
    </div>
  );
};
