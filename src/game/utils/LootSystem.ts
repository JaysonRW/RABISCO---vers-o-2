import { ItemDatabase } from '../inventory/ItemDatabase';

export function rollLoot(): string | null {
  let totalWeight = 0;
  const pool: string[] = [];

  for (const id in ItemDatabase) {
    const rate = ItemDatabase[id].dropRate || 0;
    if (rate > 0) {
      totalWeight += rate;
      pool.push(id);
    }
  }

  // Se não houver peso, nada dropa
  if (totalWeight === 0) return null;

  // Sorteia um número de 0 até totalWeight
  // Adiciona 20% de chance de NÃO dropar nada (opcional)
  const emptyWeight = totalWeight * 0.3; // 30% chance of nothing
  const target = Math.random() * (totalWeight + emptyWeight);

  if (target >= totalWeight) {
     return null; // caiu na faixa "vazia"
  }

  let accumulated = 0;
  for (const id of pool) {
    accumulated += ItemDatabase[id].dropRate;
    if (target < accumulated) {
      return id;
    }
  }

  return null;
}
