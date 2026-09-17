export const ItemDatabase: Record<string, any> = {
  "espada_desgastada": {
    "name": "Espada Curta Desgastada",
    "category": "weapon",
    "type": "melee",
    "stats": {
      "damage": 10,
      "speed": "medium"
    },
    "description": "Uma lâmina simples. Suas bordas já estão fracas, mas ainda corta a escuridão.",
    "dropRate": 0
  },
  "adaga_herege": {
    "name": "Adaga do Herege",
    "category": "weapon",
    "type": "melee",
    "stats": {
      "damage": 8,
      "speed": "fast",
      "effect": "bleeding"
    },
    "description": "Lâmina banhada em sangue profano que deixa um rastro escuro por onde passa.",
    "dropRate": 15
  },
  "lanca_inquisidor": {
    "name": "Lança do Inquisidor",
    "category": "weapon",
    "type": "melee",
    "stats": {
      "damage": 15,
      "speed": "slow",
      "range": "long"
    },
    "description": "Arma longa usada pelos antigos guardiões para manter o mal à distância.",
    "dropRate": 5
  },
  "montante_algoz": {
    "name": "Montante do Algoz Carmim",
    "category": "weapon",
    "type": "melee",
    "stats": {
      "damage": 25,
      "speed": "very_slow",
      "effect": "knockback"
    },
    "description": "Espada colossal roubada de um lorde menor. Pulsa com energia destrutiva.",
    "dropRate": 2
  },
  "gota_essencia": {
    "name": "Gota de Essência",
    "category": "consumable",
    "type": "healing",
    "stats": {
      "healAmount": 1
    },
    "description": "Um ínfimo fragmento de energia vital. Traz um breve alívio.",
    "dropRate": 65
  },
  "lagrima_sagrada": {
    "name": "Lágrima Sagrada",
    "category": "consumable",
    "type": "healing",
    "stats": {
      "healAmount": 20
    },
    "description": "Gota cristalizada de pureza que restaura a carne e a vontade.",
    "dropRate": 40
  },
  "estilhaco_obsidiana": {
    "name": "Estilhaço de Obsidiana",
    "category": "ammunition",
    "type": "resource",
    "stats": {
      "mpAmount": 1
    },
    "description": "Pedaço de trevas petrificadas. Essencial para canalizar relíquias antigas.",
    "dropRate": 25
  },
  "cristal_obsidiana": {
    "name": "Cristal de Obsidiana Intacto",
    "category": "ammunition",
    "type": "resource",
    "stats": {
      "mpAmount": 5
    },
    "description": "Uma joia bruta de pura energia sombria, fria ao toque.",
    "dropRate": 8
  },
  "estaca_prata": {
    "name": "Estaca de Prata",
    "category": "sub_weapon",
    "type": "projectile",
    "stats": {
      "damage": 12,
      "trajectory": "straight"
    },
    "description": "Forjada pelos primeiros clérigos. Corta o ar sem desviar do alvo.",
    "dropRate": 10
  },
  "machadinha_coveiro": {
    "name": "Machadinha do Coveiro",
    "category": "sub_weapon",
    "type": "projectile",
    "stats": {
      "damage": 18,
      "trajectory": "arc"
    },
    "description": "Ferramenta pesada da Cripta Esquecida. Ignora escudos se cair do alto.",
    "dropRate": 6
  },
  "frasco_fogo": {
    "name": "Frasco de Fogo Grego",
    "category": "sub_weapon",
    "type": "area",
    "stats": {
      "duration": 4,
      "effect": "burn"
    },
    "description": "Uma mistura alquímica instável que consome a corrupção.",
    "dropRate": 10
  },
  "po_mercurio": {
    "name": "Pó de Mercúrio",
    "category": "buff",
    "type": "speed",
    "stats": {
      "duration": 10,
      "speedMultiplier": 1.3
    },
    "description": "Acelera o fluxo vital nas veias do guerreiro. O mundo parece quase parar.",
    "dropRate": 4
  },
  "carapaca_gargula": {
    "name": "Carapaça de Gárgula",
    "category": "buff",
    "type": "defense",
    "stats": {
      "duration": 8,
      "damageReduction": 0.5,
      "effect": "anti_knockback"
    },
    "description": "Endurece a pele do usuário para se assemelhar à pedra fria do Santuário.",
    "dropRate": 3
  },
  "amuleto_vazio": {
    "name": "Amuleto do Vazio",
    "category": "buff",
    "type": "defense",
    "stats": {
      "magicAbsorbCharges": 3
    },
    "description": "Um talismã liso. Suga a energia ao seu redor, apagando feitiços.",
    "dropRate": 8
  },
  "relogio_sombrio": {
    "name": "Relógio de Areia Sombrio",
    "category": "special",
    "type": "utility",
    "stats": {
      "duration": 4,
      "effect": "time_freeze"
    },
    "description": "Suas areias escuras e paradas distorcem a própria passagem do tempo.",
    "dropRate": 1
  }
};
