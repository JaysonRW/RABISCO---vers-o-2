import fs from 'fs';
const history = fs.readFileSync('.aistudio/artifacts/brain/3a6214bc-4b50-47f4-b4e4-5ac1d3acf1c1/.system_generated/logs/transcript.jsonl', 'utf8');
const lines = history.split('\n');
for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('renderCryptBiome')) {
    console.log(lines[i].substring(0, 300));
  }
}
