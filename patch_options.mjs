import fs from 'fs';
let code = fs.readFileSync('src/components/OptionsScreen.tsx', 'utf8');

const anchor = `          {/* Coluna 1: Áudio */}
          <div className="flex flex-col gap-6">`;

const replacement = `          {/* Coluna 1: Áudio & Cenário */}
          <div className="flex flex-col gap-6">
            <h2 className="text-4xl opacity-80 mb-2 mt-4 md:mt-0">Cenário Inicial</h2>
            <div className="flex flex-col gap-2 text-2xl">
              <select 
                className="w-full bg-[#051442]/10 border border-[#051442]/30 p-2 rounded cursor-pointer outline-none"
                defaultValue={localStorage.getItem('selected_initial_scenario') || 'sanctuary_interior'}
                onChange={(e) => localStorage.setItem('selected_initial_scenario', e.target.value)}
              >
                <option value="sanctuary_interior">Santuário (Prólogo)</option>
                <option value="monastery_courtyard">Pátio do Monastério</option>
                <option value="corrupted_forest">Floresta Corrompida</option>
                <option value="forgotten_crypt">Cripta Esquecida</option>
              </select>
            </div>
`;

code = code.replace(anchor, replacement);
fs.writeFileSync('src/components/OptionsScreen.tsx', code);
