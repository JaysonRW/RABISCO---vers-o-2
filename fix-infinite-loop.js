const fs = require('fs');

let code = fs.readFileSync('src/components/StatusScreen.tsx', 'utf8');

const regex = /React\.useEffect\(\(\) => \{\s*\/\/ Quando o componente for desmontado[\s\S]*?\}, \[viewedInventory, onClearNewItems\]\);/;

const newCode = `const onClearNewItemsRef = React.useRef(onClearNewItems);
  React.useEffect(() => {
    onClearNewItemsRef.current = onClearNewItems;
  }, [onClearNewItems]);

  React.useEffect(() => {
    // Quando o componente for desmontado (fechando o menu de Status), 
    // limpamos os itens se ele viu o inventário
    return () => {
      if (viewedInventory && onClearNewItemsRef.current) {
        onClearNewItemsRef.current();
      }
    };
  }, [viewedInventory]);`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/components/StatusScreen.tsx', code);
