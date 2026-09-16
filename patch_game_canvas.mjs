import fs from 'fs';
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const oldReturnStart = `  return (
    <div className="w-full flex flex-col items-center select-none relative">
      {/* Top Controls Bar & Quick Actions */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs font-serif text-[#0A2570] border-b border-[#0A2570]/20 bg-[#FFFFFF]/90">`;

// I will just use a regex to replace everything from "return (" to the end of the file.

const newReturn = `  return (
    <div className="w-screen h-screen bg-black flex flex-col items-center justify-center select-none overflow-hidden relative">
      
      {/* Game Area Wrapper (keeps 16:9 aspect ratio) */}
      <div className="relative w-full h-full max-w-[1920px] aspect-video sm:aspect-auto sm:max-h-screen flex items-center justify-center bg-[#051442]">
        
        {/* Canvas itself */}
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.CANVAS_WIDTH}
          height={GAME_CONFIG.CANVAS_HEIGHT}
          className="w-full h-full object-contain block"
        />

        {/* HUD - Floating over the canvas */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between pointer-events-none">
          {/* Top Left: HP and Stamina */}
          <div className="flex flex-col gap-2 w-48 sm:w-64">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-bold text-[#C81E1E] drop-shadow-md">
                <span>VIDA</span>
                <span>{Math.round(stats.hp)} / {stats.maxHp}</span>
              </div>
              <div className="w-full h-3 bg-black/60 border border-white/20 rounded-sm overflow-hidden">
                <div
                  className="h-full bg-[#C81E1E] transition-all duration-150"
                  style={{ width: \`\${Math.max(0, (stats.hp / stats.maxHp) * 100)}%\` }}
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-bold text-[#38BDF8] drop-shadow-md">
                <span>ESTAMINA</span>
                <span>{Math.round(stats.stamina)}%</span>
              </div>
              <div className="w-full h-2 bg-black/60 border border-white/20 rounded-sm overflow-hidden">
                <div
                  className="h-full bg-[#38BDF8] transition-all duration-150"
                  style={{ width: \`\${Math.max(0, (stats.stamina / stats.maxStamina) * 100)}%\` }}
                />
              </div>
            </div>
          </div>

          {/* Top Right: Souls and Location */}
          <div className="flex flex-col items-end gap-2 text-right">
            <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded border border-white/10 backdrop-blur-sm pointer-events-auto">
              <span className="text-[#06B6D4]">✧</span>
              <span className="text-xl font-bold font-['Cinzel'] text-[#FFFFFF] drop-shadow-md">
                {stats.ascension.souls}
              </span>
            </div>
            <div className="text-xs font-serif text-[#FFFFFF]/80 drop-shadow-md mt-1">
              {stats.currentSection?.name || 'Santuário'}
            </div>
            {/* Quick Actions (Sound) */}
            <button
              onClick={handleToggleSound}
              className="mt-2 p-1.5 bg-black/50 hover:bg-black/80 rounded border border-white/10 text-white pointer-events-auto transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#C81E1E]" />}
            </button>
          </div>
        </div>

        {/* Buffs Display */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-none">
          {stats.saltDuration > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F59E0B]/20 border border-[#F59E0B]/50 rounded animate-in fade-in">
              <span className="text-lg">🧂</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#F59E0B] drop-shadow-md">Sal Purificador Ativo</span>
                <div className="w-24 h-1 bg-black/50 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-[#F59E0B] transition-all"
                    style={{ width: \`\${(stats.saltDuration / GAME_CONFIG.PLAYER.SALT_COATING_DURATION) * 100}%\` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Modals and Overlays */}
        {showInventoryModal && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-40 animate-in fade-in duration-200">
            <div className="w-full max-w-lg flex flex-col items-center">
              <h2 className="text-3xl font-black font-['Cinzel'] text-white mb-6 tracking-widest border-b border-white/20 pb-2 w-full text-center">
                INVENTÁRIO
              </h2>
              
              <div className="flex flex-col gap-3 w-full max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {stats.inventory && stats.inventory.length > 0 ? (
                  stats.inventory.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded p-4 text-white hover:bg-white/10 transition-colors backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl bg-black/50 rounded p-2 border border-white/5">
                          {item.icon === 'salt' ? '🧂' : item.icon === 'flask' ? '🧪' : item.icon === 'sword' ? '🗡️' : '✝️'}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-lg font-bold font-serif leading-tight">{item.name}</span>
                          <span className="text-xs font-serif text-white/60 italic mt-0.5">{item.description}</span>
                        </div>
                      </div>
                      {item.count !== undefined && (
                        <div className="flex flex-col items-center justify-center min-w-[3rem]">
                          <span className="text-[10px] text-white/50 uppercase">Qtd</span>
                          <span className="text-2xl font-black font-['Special_Elite'] text-[#F59E0B]">{item.count}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-white/40 font-serif py-12 italic">Inventário vazio.</p>
                )}
              </div>

              <button
                onClick={() => setShowInventoryModal(false)}
                className="mt-8 px-8 py-2.5 bg-transparent hover:bg-white/10 text-white font-bold rounded font-serif border border-white/30 tracking-widest transition-all uppercase text-sm"
              >
                Fechar [Enter]
              </button>
            </div>
          </div>
        )}

        {/* Death Banner */}
        {showRespawnBanner && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-30 animate-in fade-in duration-500">
            <h2 className="text-4xl sm:text-5xl font-black font-['Cinzel'] text-[#C81E1E] mb-4 tracking-[0.2em] drop-shadow-lg">
              SUA ALMA FOI CONSUMIDA
            </h2>
            <button
              onClick={handleReset}
              className="mt-8 px-8 py-3 bg-transparent hover:bg-[#C81E1E]/20 text-[#C81E1E] font-bold rounded font-serif border-2 border-[#C81E1E] tracking-widest transition-all hover:scale-105 cursor-pointer uppercase text-sm"
            >
              Levantar-se Novamente [R]
            </button>
          </div>
        )}

        {/* CLIMAX TRANSITION OVERLAY */}
        <div 
          className={\`absolute inset-0 bg-black z-[100] pointer-events-none transition-opacity duration-[2000ms] \${isClimaxTransitioning ? 'opacity-100' : 'opacity-0'}\`} 
        />
        
        {/* NPC Dialog */}
        {activeNpcDialog && (
          <NpcDialogModal
            npc={activeNpcDialog}
            playerSouls={stats.ascension.souls}
            onSelectChoice={handleDialogChoice}
            onClose={() => setActiveNpcDialog(null)}
          />
        )}

      </div>
    </div>
  );
};
`;

const regex = /  return \([\s\S]*\}\;/;
code = code.replace(regex, newReturn);
fs.writeFileSync('src/components/GameCanvas.tsx', code);
