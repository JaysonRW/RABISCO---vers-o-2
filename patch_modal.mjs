import fs from 'fs';

let code = fs.readFileSync('src/components/NpcDialogModal.tsx', 'utf8');

// 1. Fix the setInterval text duplication
const oldEffect = `  // Efeito de digitação (Typewriter)
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(prev => prev + fullText.charAt(i));
        i++;
        // Tocar um som leve de "bip" para a fala, mas não em todo frame
        if (i % 4 === 0) soundManager.playNpcDialog();
      } else {
        clearInterval(interval);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [fullText]);`;

const newEffect = `  // Efeito de digitação (Typewriter)
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(prev => {
        if (prev.length >= fullText.length) {
          clearInterval(interval);
          return prev;
        }
        if (i < fullText.length) {
          const next = prev + fullText.charAt(i);
          i++;
          if (i % 4 === 0) soundManager.playNpcDialog();
          return next;
        }
        clearInterval(interval);
        return prev;
      });
    }, 25);
    return () => clearInterval(interval);
  }, [fullText]);`;

code = code.replace(oldEffect, newEffect);

// 2. Fix isTypingDone
code = code.replace(
  "const isTypingDone = displayedText.length === fullText.length;",
  "const isTypingDone = displayedText.length >= fullText.length;"
);

fs.writeFileSync('src/components/NpcDialogModal.tsx', code);
