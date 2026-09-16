import fs from 'fs';

let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const htmlToRemove = `        {/* HUD - Floating over the canvas */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between pointer-events-none">
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
        </div>`;

const newHtml = `        {/* HUD - Floating over the canvas */}
        <div className="absolute top-0 right-0 p-4 flex gap-3 pointer-events-none items-start">
          {/* Top Right: Souls and Sound */}
          <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded border border-white/10 backdrop-blur-sm pointer-events-auto">
            <span className="text-[#06B6D4]">✧</span>
            <span className="text-xl font-bold font-['Cinzel'] text-[#FFFFFF] drop-shadow-md">
              {stats.ascension.souls}
            </span>
          </div>
          {/* Quick Actions (Sound) */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 bg-black/50 hover:bg-black/80 rounded border border-white/10 text-white pointer-events-auto transition-colors h-fit"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-[#C81E1E]" />}
          </button>
        </div>`;

code = code.replace(htmlToRemove, newHtml);
fs.writeFileSync('src/components/GameCanvas.tsx', code);
