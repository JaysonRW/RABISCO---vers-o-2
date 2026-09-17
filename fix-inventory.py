import re

with open('src/components/StatusScreen.tsx', 'r') as f:
    code = f.read()

regex = re.compile(r'\{\/\* INVENTORY \*\/\}[\s\S]*?\{\/\* GRIMOIRE \*\/\}')

newCode = """{/* INVENTORY */}
            {activeTab === 'INVENTORY' && (
              <div className="flex flex-col gap-6 animate-in slide-in-from-right-8 fade-in duration-300 pb-20 overflow-y-auto custom-scrollbar h-full">
                {stats.inventory && stats.inventory.length > 0 ? (
                  Object.entries(
                    stats.inventory.reduce((acc: any, item: any) => {
                      const category = item.type || 'OUTROS';
                      if (!acc[category]) acc[category] = [];
                      acc[category].push(item);
                      return acc;
                    }, {})
                  ).sort((a: any, b: any) => a[0].localeCompare(b[0])).map(([category, items]: any) => (
                    <div key={category} className="flex flex-col gap-3">
                      <h3 className="text-stone-400 font-['Cinzel'] text-xl tracking-widest border-b border-stone-800/80 pb-2 mb-1 mt-2">
                        {category === 'WEAPON' ? 'ARMAS' :
                         category === 'SUB_WEAPON' ? 'SUB-ARMAS' :
                         category === 'CONSUMABLE' ? 'CONSUMÍVEIS' :
                         category === 'COATING' ? 'REVESTIMENTOS' :
                         category === 'AMMUNITION' ? 'RECURSOS E MUNIÇÃO' :
                         category === 'BUFF' ? 'AMULETOS E BÊNÇÃOS' :
                         category === 'SPECIAL' ? 'ITENS ESPECIAIS' :
                         category === 'RELIC' ? 'RELÍQUIAS' : 
                         category}
                      </h3>
                      <div className="flex flex-col gap-3">
                        {(items as any[]).map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between bg-black/40 border border-stone-800/60 rounded-md p-4 text-stone-300 hover:bg-black/80 hover:border-stone-700 transition-all">
                            <div className="flex items-center gap-5">
                              <span className="text-4xl bg-black/50 rounded-lg p-3 border border-stone-800 shadow-inner min-w-[70px] text-center">
                                {item.icon === 'salt' ? '🧂' : item.icon === 'flask' ? '🧪' : item.icon === 'sword' ? '🗡️' : '✝️'}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-xl font-bold font-serif leading-tight text-white">{item.name}</span>
                                <span className="text-sm font-serif text-stone-500 italic mt-1">{item.description}</span>
                              </div>
                            </div>
                            {item.count !== undefined && (
                              <div className="flex flex-col items-center justify-center min-w-[4rem] border-l border-stone-800 pl-4 ml-4">
                                <span className="text-[10px] text-stone-600 uppercase tracking-widest">Qtd</span>
                                <span className="text-3xl font-black font-['Special_Elite'] text-amber-500">{item.count}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-stone-600 text-center mt-12 italic text-2xl font-serif">
                    Sua bolsa está vazia.
                  </div>
                )}
              </div>
            )}
            {/* GRIMOIRE */}"""

code = regex.sub(newCode, code)
with open('src/components/StatusScreen.tsx', 'w') as f:
    f.write(code)
