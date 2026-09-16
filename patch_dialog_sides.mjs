import fs from 'fs';
let code = fs.readFileSync('src/components/NpcDialogModal.tsx', 'utf8');

// 1. Add `isLordSpeaking` variable
code = code.replace(
  "  let avatarSrc = '/npc_avatar.png';",
  "  const isLordSpeaking = speaker === 'Lorde Carmim' || speaker === 'Senhor Carmim';\n  let avatarSrc = '/npc_avatar.png';"
);

// 2. Change the flex container
code = code.replace(
  '      {/* Caixa principal translúcida estilo Retro RPG */}\n      <div className="relative w-full max-w-4xl mx-auto flex items-stretch border-2 border-stone-400 bg-black/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.8)] font-serif select-none overflow-hidden h-[160px]">',
  '      {/* Caixa principal translúcida estilo Retro RPG */}\n      <div className={`relative w-full max-w-4xl mx-auto flex items-stretch border-2 border-stone-400 bg-black/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.8)] font-serif select-none overflow-hidden h-[160px] ${isLordSpeaking ? "flex-row-reverse" : "flex-row"}`}>'
);

// 3. Change the border of the portrait
code = code.replace(
  '        {/* Retrato do Personagem (Esquerda) */}\n        <div className="w-[160px] min-w-[160px] h-full border-r-2 border-stone-400 bg-stone-900 flex items-center justify-center p-1 shrink-0 overflow-hidden relative">',
  '        {/* Retrato do Personagem */}\n        <div className={`w-[160px] min-w-[160px] h-full ${isLordSpeaking ? "border-l-2" : "border-r-2"} border-stone-400 bg-stone-900 flex items-center justify-center p-1 shrink-0 overflow-hidden relative`}>'
);

// 4. Align the speaker name based on side
code = code.replace(
  '          {/* Nome do Speaker */}\n          <h3 className="text-xl font-bold text-amber-500 font-[\'Cinzel\'] tracking-wide border-b border-stone-600/50 pb-1 mb-2">\n            {speaker}\n          </h3>',
  '          {/* Nome do Speaker */}\n          <h3 className={`text-xl font-bold text-amber-500 font-[\'Cinzel\'] tracking-wide border-b border-stone-600/50 pb-1 mb-2 ${isLordSpeaking ? "text-right" : "text-left"}`}>\n            {speaker}\n          </h3>'
);

fs.writeFileSync('src/components/NpcDialogModal.tsx', code);
