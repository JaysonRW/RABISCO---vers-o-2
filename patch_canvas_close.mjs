import fs from 'fs';
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

code = code.replace(
  "    } else if (choice.actionId === 'CLOSE') {\n      setActiveNpcDialog(null);\n    }",
  "    } else if (choice.actionId === 'CLOSE') {\n      setActiveNpcDialog(null);\n      if (engineRef.current) engineRef.current.isCutscenePlaying = false;\n    }"
);

code = code.replace(
  "            onClose={() => setActiveNpcDialog(null)}",
  "            onClose={() => { setActiveNpcDialog(null); if (engineRef.current) engineRef.current.isCutscenePlaying = false; }}"
);

fs.writeFileSync('src/components/GameCanvas.tsx', code);
