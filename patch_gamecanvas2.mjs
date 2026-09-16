import fs from 'fs';

let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const regex = /\{\/\* HUD - Floating over the canvas \*\/\}[\s\S]*?\{\/\* Buffs Display \*\/\}/;

const newHtml = `{/* HUD - Floating over the canvas */}
        <div className="absolute top-0 right-0 p-4 flex gap-3 pointer-events-none items-start">
          {/* Top Right: Souls and Sound */}
          <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded border border-white/10 backdrop-blur-sm pointer-events-auto h-9">
            <span className="text-[#06B6D4]">✧</span>
            <span className="text-xl font-bold font-['Cinzel'] text-[#FFFFFF] drop-shadow-md leading-none">
              {stats.ascension.souls}
            </span>
          </div>
          {/* Quick Actions (Sound) */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 bg-black/50 hover:bg-black/80 rounded border border-white/10 text-white pointer-events-auto transition-colors h-9 flex items-center justify-center"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-[#C81E1E]" />}
          </button>
        </div>

        {/* Buffs Display */}`;

if (code.match(regex)) {
  code = code.replace(regex, newHtml);
  fs.writeFileSync('src/components/GameCanvas.tsx', code);
  console.log('Successfully updated GameCanvas HUD html!');
} else {
  console.log('Regex did not match GameCanvas.');
}
