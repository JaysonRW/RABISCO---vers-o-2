/**
 * O Cavaleiro Arruinado - Inventory Manager
 * Gerencia itens ativos, armas de exorcismo e consumíveis de revestimento
 */

import { DamageType, Item } from '../types';

export class InventoryManager {
  public items: Item[] = [];
  public selectedIndex: number = 0;
  public saltCharges: number = 5;
  public maxSaltCharges: number = 10;
  public saltDurationLeft: number = 0;
  public hasSaltCoating: boolean = false;

  constructor() {
    this.initStartingInventory();
  }

  // Inventário inicial conforme o GDD: Espada Enferrujada + Bolsas de Sal Purificador
  private initStartingInventory() {
    this.items = [
      {
        id: 'rusty_sword',
        name: 'Espada Enferrujada',
        description: 'Lâmina gasta forjada no aço de mortais. Inútil contra seres incorpóreos.',
        type: 'WEAPON',
        damageType: DamageType.PHYSICAL,
        icon: 'sword',
      },
      {
        id: 'purifying_salt',
        name: 'Sal Purificador',
        description: 'Pó mineral abençoado. Imbui a espada com poder sagrado para exorcizar Espectros e Fantasmas.',
        type: 'COATING',
        damageType: DamageType.SALT,
        icon: 'salt',
        count: 5,
        maxCount: 10,
      },
      {
        id: 'holy_water',
        name: 'Água Benta de Basílica',
        description: 'Frasco de água abençoada. Letal contra Vampiros e demônios menores.',
        type: 'CONSUMABLE',
        damageType: DamageType.HOLY_WATER,
        icon: 'flask',
        count: 3,
        maxCount: 5,
      },
      {
        id: 'wooden_stake',
        name: 'Estaca de Carvalho',
        description: 'Arma perfurante corpo a corpo. Perfura o coração corrompido de Vampiros.',
        type: 'WEAPON',
        damageType: DamageType.WOOD_STAKE,
        icon: 'stake',
      },
      {
        id: 'wooden_crucifix',
        name: 'Crucifixo Ancestral',
        description: 'Relíquia sagrada de madeira que emite uma barreira contra magias negras.',
        type: 'RELIC',
        damageType: DamageType.HOLY,
        icon: 'cross',
        isPassive: true,
      },
    ];
  }

  public update(dt: number) {
    if (this.hasSaltCoating) {
      this.saltDurationLeft = Math.max(0, this.saltDurationLeft - dt);
      if (this.saltDurationLeft <= 0) {
        this.hasSaltCoating = false;
      }
    }
  }

  // Aplica Sal Purificador na Espada ("Arma com Sal")
  public useSaltCoating(duration: number = 14.0): boolean {
    const saltItem = this.items.find(it => it.id === 'purifying_salt');
    if (!saltItem || (saltItem.count !== undefined && saltItem.count <= 0)) {
      return false;
    }

    if (saltItem.count !== undefined) {
      saltItem.count--;
      this.saltCharges = saltItem.count;
    }

    this.hasSaltCoating = true;
    this.saltDurationLeft = duration;
    return true;
  }

  // Recarrega sal (para teste / coletáveis no mapa)
  public addSalt(amount: number = 3) {
    const saltItem = this.items.find(it => it.id === 'purifying_salt');
    if (saltItem && saltItem.count !== undefined) {
      saltItem.count = Math.min(saltItem.maxCount || 10, saltItem.count + amount);
      this.saltCharges = saltItem.count;
    }
  }

  public addItem(item: Item) {
    const existing = this.items.find(i => i.id === item.id);
    if (existing && existing.count !== undefined) {
      existing.count = Math.min(existing.maxCount || 99, existing.count + (item.count || 1));
      existing.isNew = true;
    } else {
      this.items.push({ ...item, isNew: true });
    }
  }

  public clearNewItems() {
    for (const item of this.items) {
      item.isNew = false;
    }
  }

  public getActiveDamageType(): DamageType {
    if (this.hasSaltCoating) {
      return DamageType.SALT;
    }
    return DamageType.PHYSICAL;
  }
}
