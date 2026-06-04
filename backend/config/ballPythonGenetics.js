export const BALL_PYTHON_GENES = {
  // --- RECESSIVI PURI (Loci Singoli) ---
  axanthic_vpi: { name: 'Axanthic (VPI)', type: 'recessive' },
  desert_ghost: { name: 'Desert Ghost', type: 'recessive' },
  genetic_stripe: { name: 'Genetic Stripe', type: 'recessive' },
  ghost: { name: 'Ghost (Hypo)', type: 'recessive' },
  lavender_albino: { name: 'Lavender Albino', type: 'recessive' },
  monarch: { name: 'Monarch', type: 'recessive' },
  piebald: { name: 'Piebald (Pied)', type: 'recessive' },
  puzzle: { name: 'Puzzle', type: 'recessive' },
  sunset: { name: 'Sunset', type: 'recessive' },
  tri_stripe: { name: 'Tri-Stripe', type: 'recessive' },
  ultramel: { name: 'Ultramel', type: 'recessive' },
  rainbow: { name: 'Rainbow', type: 'recessive' },

  // --- RECESSIVI ALLELICI (Complessi Recessivi) ---
  albino: { name: 'Albino', type: 'recessive', complex: 'albino_complex' },
  candy: { name: 'Candy', type: 'recessive', complex: 'albino_complex' },
  toffee: { name: 'Toffee', type: 'recessive', complex: 'albino_complex' },
  clown: { name: 'Clown', type: 'recessive', complex: 'clown_complex' },
  cryptic: { name: 'Cryptic', type: 'recessive', complex: 'clown_complex' },

  // --- DOMINANTI PURI ---
  pinstripe: { name: 'Pinstripe', type: 'dominant' }, 

  // --- CO-DOMINANTI / INCOMPLETE DOMINANTI (Singoli) ---
  blade: { name: 'Blade', type: 'co-dominant', superName: 'Super Blade' },
  calico: { name: 'Calico / Sugar', type: 'co-dominant', superName: 'Super Calico' },
  confusion: { name: 'Confusion', type: 'co-dominant', superName: 'Super Confusion' },
  cypress: { name: 'Cypress', type: 'co-dominant', superName: 'Super Cypress' },
  enchi: { name: 'Enchi', type: 'co-dominant', superName: 'Super Enchi' },
  ghi: { name: 'GHI', type: 'co-dominant', superName: 'Super GHI' },
  orange_dream: { name: 'Orange Dream (OD)', type: 'co-dominant', superName: 'Super Orange Dream (SOD)' },
  pastel: { name: 'Pastel', type: 'co-dominant', superName: 'Super Pastel' },
  spotnose: { name: 'Spotnose', type: 'co-dominant', superName: 'Super Spotnose' },
  stranger: { name: 'Stranger', type: 'co-dominant', superName: 'Super Stranger' },
  banana: { name: 'Banana (Coral Glow)', type: 'co-dominant', superName: 'Super Banana' },

  // --- COMPLESSO SPIDER (Letalità Omozigote e Incrociata) ---
  spider: { name: 'Spider', type: 'co-dominant', complex: 'spider_complex', lethal: true },
  champagne: { name: 'Champagne', type: 'co-dominant', complex: 'spider_complex', lethal: true }, 
  woma: { name: 'Woma', type: 'co-dominant', complex: 'spider_complex', lethal: true },

  // --- COMPLESSO LEOPARD / BLACK HEAD ---
  leopard: { name: 'Leopard', type: 'co-dominant', superName: 'Super Leopard', complex: 'leopard_blackhead' },
  black_head: { name: 'Black Head', type: 'co-dominant', superName: 'Super Black Head', complex: 'leopard_blackhead' },

  // --- COMPLESSO MAHOGANY (Suma) ---
  mahogany: { name: 'Mahogany', type: 'co-dominant', complex: 'mahogany_complex' },
  cinder: { name: 'Cinder', type: 'co-dominant', complex: 'mahogany_complex' },

  // --- COMPLESSO ACID / RED STRIPE ---
  acid: { name: 'Acid', type: 'co-dominant', superName: 'Super Acid', complex: 'acid_red_stripe' },
  red_stripe: { name: 'Red Stripe', type: 'co-dominant', superName: 'Super Red Stripe', complex: 'acid_red_stripe' },

  // --- COMPLESSO 8-BALL ---
  black_pastel: { name: 'Black Pastel', type: 'co-dominant', complex: 'eight_ball' },
  cinnamon: { name: 'Cinnamon', type: 'co-dominant', complex: 'eight_ball' },
  het_red_axanthic: { name: 'Het Red Axanthic', type: 'co-dominant', complex: 'eight_ball' },
  huffman: { name: 'Huffman', type: 'co-dominant', complex: 'eight_ball' },

  // --- COMPLESSO BLACK EYED LUCY (Fire) ---
  disco: { name: 'Disco', type: 'co-dominant', complex: 'black_eyed_lucy' },
  fire: { name: 'Fire', type: 'co-dominant', complex: 'black_eyed_lucy' },
  vanilla: { name: 'Vanilla', type: 'co-dominant', complex: 'black_eyed_lucy' },

  // --- COMPLESSO BLUE EYED LUCY (BEL) ---
  bamboo: { name: 'Bamboo', type: 'co-dominant', complex: 'bel' },
  butter: { name: 'Butter', type: 'co-dominant', complex: 'bel' },
  lesser: { name: 'Lesser', type: 'co-dominant', complex: 'bel' },
  mocha: { name: 'Mocha', type: 'co-dominant', complex: 'bel' },
  mojave: { name: 'Mojave', type: 'co-dominant', complex: 'bel' },
  mystic: { name: 'Mystic', type: 'co-dominant', complex: 'bel' },
  phantom: { name: 'Phantom', type: 'co-dominant', complex: 'bel' },
  russo: { name: 'Russo', type: 'co-dominant', complex: 'bel' },
  special: { name: 'Special', type: 'co-dominant', complex: 'bel' },

  // --- COMPLESSO YELLOW BELLY ---
  asphalt: { name: 'Asphalt', type: 'co-dominant', complex: 'yellow_belly' },
  gravel: { name: 'Gravel', type: 'co-dominant', complex: 'yellow_belly' },
  spark: { name: 'Spark', type: 'co-dominant', complex: 'yellow_belly' },
  specter: { name: 'Specter', type: 'co-dominant', complex: 'yellow_belly' },
  volt: { name: 'Volt', type: 'co-dominant', complex: 'yellow_belly' },
  yellow_belly: { name: 'Yellow Belly', type: 'co-dominant', complex: 'yellow_belly' },
};

export const COMPLEX_COMBOS = {
  // --- COMPLESSI RECESSIVI CO-DOMINANTI TRA LORO ---
  albino_complex: {
    'albino+albino': 'Albino',
    'candy+candy': 'Super Candy',
    'toffee+toffee': 'Super Toffee',
    'albino+candy': 'Candino',
    'albino+toffee': 'Toffino',
    'candy+toffee': 'Candy Toffee'
  },
  clown_complex: {
    'clown+clown': 'Clown',
    'cryptic+cryptic': 'Super Cryptic',
    'clown+cryptic': 'Crypton'
  },

  // --- COMPLESSO SPIDER (Interazioni Letali) ---
  spider_complex: {
    'spider+spider': 'Super Spider (Letale)',
    'champagne+champagne': 'Super Champagne (Letale)',
    'woma+woma': 'Super Woma (Letale)',
    'champagne+spider': 'Champagne Spider (Letale Combo)',
    'spider+woma': 'Woma Spider (Letale Combo)',
    'champagne+woma': 'Champagne Woma (Letale Combo)'
  },

  // --- COMPLESSO LEOPARD / BLACK HEAD ---
  leopard_blackhead: {
    'leopard+leopard': 'Super Leopard',
    'black_head+black_head': 'Super Black Head',
    'black_head+leopard': 'Leopard Black Head'
  },

  // --- COMPLESSO MAHOGANY ---
  mahogany_complex: {
    'mahogany+mahogany': 'Suma (Super Mahogany)',
    'cinder+cinder': 'Super Cinder',
    'cinder+mahogany': 'Suma (Cinder Mahogany)'
  },

  // --- COMPLESSO ACID / RED STRIPE ---
  acid_red_stripe: {
    'acid+red_stripe': 'Sonic',
    'acid+acid': 'Super Acid',
    'red_stripe+red_stripe': 'Super Red Stripe'
  },

  // --- COMPLESSO BEL ---
  bel: {
    'bamboo+bamboo': 'Super Bamboo (Blue Eyed Lucy)',
    'butter+butter': 'Super Butter (Blue Eyed Lucy)',
    'lesser+lesser': 'Super Lesser (Blue Eyed Lucy)',
    'mojave+mojave': 'Super Mojave (Blue Eyed Lucy)',
    'mystic+mystic': 'Super Mystic',
    'phantom+phantom': 'Super Phantom',
    'russo+russo': 'White Diamond (Super Russo)',
    'special+special': 'Super Special',
    'mocha+mocha': 'Super Mocha',
    'bamboo+mojave': 'Bamboo Mojave (Blue Eyed Lucy)',
    'butter+mojave': 'Butter Mojave (Blue Eyed Lucy)',
    'lesser+mojave': 'Mojave Lesser (Blue Eyed Lucy)',
    'mocha+mojave': 'Mochi',
    'mojave+mystic': 'Mystic Potion',
    'mojave+phantom': 'Purple Passion',
    'lesser+phantom': 'Karma',
    'mojave+special': 'Crystal',
    'bamboo+lesser': 'Anti-Static',
    'bamboo+butter': 'Anti-Static (Butter)',
  },

  // --- COMPLESSO YELLOW BELLY ---
  yellow_belly: {
    'yellow_belly+yellow_belly': 'Ivory',
    'asphalt+asphalt': 'Super Asphalt',
    'gravel+gravel': 'Super Gravel',
    'specter+specter': 'Super Specter',
    'spark+spark': 'Puma',
    'asphalt+yellow_belly': 'Freeway',
    'gravel+yellow_belly': 'Highway',
    'spark+yellow_belly': 'Puma (Spark YB)',
    'specter+yellow_belly': 'Super Stripe',
    'volt+yellow_belly': 'Volt YB',
  },

  // --- COMPLESSO 8-BALL ---
  eight_ball: {
    'black_pastel+black_pastel': 'Super Black Pastel',
    'cinnamon+cinnamon': 'Super Cinnamon',
    'black_pastel+cinnamon': '8-Ball',
    'cinnamon+het_red_axanthic': 'Gargoyle',
    'black_pastel+het_red_axanthic': 'Gargoyle (Black Pastel)',
  },

  // --- COMPLESSO BLACK EYED LUCY ---
  black_eyed_lucy: {
    'fire+fire': 'Black Eyed Lucy (Super Fire)',
    'vanilla+vanilla': 'Super Vanilla',
    'disco+disco': 'Super Disco',
    'fire+vanilla': 'Vanilla Cream',
    'disco+fire': 'Disco Inferno',
  }
};