import fs from 'fs';

let code = fs.readFileSync('src/components/NpcDialogModal.tsx', 'utf8');

const oldAvatarLogic = `  let avatarSrc = '/npc_avatar.png';
  if (speaker === 'Nankin' || speaker === 'Cavaleiro') avatarSrc = '/hero_avatar.png';
  else if (speaker === 'Lorde Carmim') avatarSrc = '/lordFala1.png';`;

const newAvatarLogic = `  let avatarSrc = '/npc_avatar.png';
  if (speaker === 'Nankin' || speaker === 'Cavaleiro') {
    avatarSrc = '/hero_avatar.png';
  } else if (speaker === 'Lorde Carmim' || speaker === 'Senhor Carmim') {
    if (fullText.includes("Rascunho tolo")) {
      avatarSrc = '/lordgarisos.png';
    } else {
      avatarSrc = '/lordFala1.png';
    }
  }`;

code = code.replace(oldAvatarLogic, newAvatarLogic);

const oldFallback = `          {/* Fallback caso a imagem não exista (ou não carregue) */}
          <div className="absolute inset-0 flex items-center justify-center text-stone-600 text-xs text-center p-2">
            (Adicione {avatarSrc} em /public)
          </div>`;

const newFallback = `          {/* Fallback caso a imagem não exista (ou não carregue) */}`;

code = code.replace(oldFallback, newFallback);

fs.writeFileSync('src/components/NpcDialogModal.tsx', code);
