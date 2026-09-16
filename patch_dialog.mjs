import fs from 'fs';

let code = fs.readFileSync('src/components/NpcDialogModal.tsx', 'utf8');

// Extrai a lógica de avanço para uma função
const advanceLogic = `  const advanceDialog = () => {
    if (displayedText.length < fullText.length) {
      setDisplayedText(fullText);
    } else {
      if (dialog && lineIndex < dialog.lines.length - 1) {
        setLineIndex(prev => prev + 1);
      } else {
        if (!dialog?.choices || dialog.choices.length === 0) {
          onClose();
        }
      }
    }
  };`;

// Insere a função antes do useEffect
code = code.replace(
  "  // Avançar diálogo com tecla de Ataque (J ou Z)",
  advanceLogic + "\n\n  // Avançar diálogo com tecla de Ataque (J ou Z)"
);

// Atualiza o useEffect para usar a função
code = code.replace(
  `        if (displayedText.length < fullText.length) {
          // Pula o efeito de digitação se apertar antes de terminar
          setDisplayedText(fullText);
        } else {
          // Avança para a próxima linha
          if (dialog && lineIndex < dialog.lines.length - 1) {
            setLineIndex(prev => prev + 1);
          } else {
            // Se for a última linha e não houver escolhas, fecha. 
            // (Se houver escolhas, o jogador precisa clicar nelas)
            if (!dialog?.choices || dialog.choices.length === 0) {
              onClose();
            }
          }
        }`,
  `        advanceDialog();`
);

// Adiciona onClick na div principal
code = code.replace(
  `      <div className={\`relative w-full max-w-4xl mx-auto flex items-stretch border-2 border-stone-400 bg-black/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.8)] font-serif select-none overflow-hidden h-[160px] \${isLordSpeaking ? "flex-row-reverse" : "flex-row"}\`}>`,
  `      <div \n        onClick={advanceDialog}\n        className={\`relative w-full max-w-4xl mx-auto flex items-stretch border-2 border-stone-400 bg-black/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.8)] font-serif select-none overflow-hidden h-[160px] cursor-pointer \${isLordSpeaking ? "flex-row-reverse" : "flex-row"}\`}>`
);

// Atualiza o texto do prompt
code = code.replace(
  `<span className="text-xs uppercase tracking-widest text-stone-400">Atacar (J)</span>`,
  `<span className="text-xs uppercase tracking-widest text-stone-400">Clique / Atacar (J)</span>`
);

fs.writeFileSync('src/components/NpcDialogModal.tsx', code);
