const lines = [
  'Lorde Carmim: "Então este é o famoso Nankin... O último traço de esperança deste mundo."',
  'Nankin: "Vou apagar você e sua corrupção, Carmim."',
  'Lorde Carmim: "Hahaha! Rascunho tolo. Sua tinta vai secar antes mesmo de encostar em mim. Contemple a verdadeira obra!"'
];
for(const line of lines) {
  let speaker = 'Unknown';
  let text = line;
  if (line.includes(': "')) {
    const parts = line.split(': "');
    speaker = parts[0];
    text = parts[1].replace(/"$/, '');
  }
  console.log({speaker, text});
}
