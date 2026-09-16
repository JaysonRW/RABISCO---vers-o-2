import fs from 'fs';
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const importIntro = "import { GameIntro } from './GameIntro';";
if (code.includes(importIntro)) {
  code = code.replace(importIntro, "import { GameIntro } from './GameIntro';\nimport { StatusScreen } from './StatusScreen';");
}

const showRespawnBanner = "const [showRespawnBanner, setShowRespawnBanner] = useState(false);";
if (code.includes(showRespawnBanner)) {
  code = code.replace(showRespawnBanner, "const [showRespawnBanner, setShowRespawnBanner] = useState(false);\n  const [showStatusScreen, setShowStatusScreen] = useState(false);");
}

const handleKeyDownRegex = /const handleKeyDown = \(e: KeyboardEvent\) => \{/;
const handleKeyDownNew = `const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        setShowStatusScreen(prev => !prev);
        return;
      }`;
if (code.match(handleKeyDownRegex)) {
  code = code.replace(handleKeyDownRegex, handleKeyDownNew);
}

const returnStmtRegex = /return \(\s*<div className="w-screen h-screen bg-black flex flex-col items-center justify-center select-none overflow-hidden relative">/;
const returnStmtNew = `return (
    <div className="w-screen h-screen bg-black flex flex-col items-center justify-center select-none overflow-hidden relative">
      {showStatusScreen && stats && (
        <StatusScreen 
          stats={{
            hp: stats.hp,
            maxHp: stats.maxHp,
            stamina: stats.stamina,
            maxStamina: stats.maxStamina,
            mp: stats.mp,
            maxMp: stats.maxMp,
            ascension: stats.ascension,
            saltCount: engineRef.current?.inventory.saltCount || 0
          }} 
          onClose={() => setShowStatusScreen(false)} 
        />
      )}`;

if (code.match(returnStmtRegex)) {
  code = code.replace(returnStmtRegex, returnStmtNew);
}

fs.writeFileSync('src/components/GameCanvas.tsx', code);
console.log('GameCanvas patched for StatusScreen.');
