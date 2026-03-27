/**
 * Seed iniziale – 10 Kit SnakeBee
 * Esegui con: node seeds/seed_kits.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import Kit from '../models/Kit.js';

const KITS = [
  {
    name: 'Ciliatus – Kit Arredo Completo',
    description:
      'Kit arredo completo per allestire un terrario funzionale per Gechi ciliatus. Include elementi per arricchimento verticale, rifugi naturali e controllo del umidità. Pensato per chi vuole un setup pronto e coerente senza acquistare singoli componenti separatamente.',
    price: 39.99,
    quantity: 0,
    vatRate: 0,
    active: false,
    images: [],
    includedProducts: [
      'Igrometro',
      'Liana con muschio naturale Reptizoo 200cm Ø10mm',
      'Pianta artificiale Reptizoo 40cm',
      'Tana finto cocco ReptiZoo 11x12x7h cm',
      'Ciotola rotonda bassa in plastica 9cm',
    ],
    slug: 'ciliatus-habitat-starter',
  },
  {
    name: 'Ciliatus Care Pack – Kit Ricorrente',
    description:
      'Kit di reintegro periodico per mantenere substrato, microclima e integrazione minerale del geco ciliatus. Ideale per rifornimento mensile o bimestrale, riduce il rischio di carenze nutrizionali e mantiene stabile ambiente.',
    price: 24.99,
    quantity: 80,
    vatRate: 22,
    active: true,
    images: [],
    includedProducts: [
      'Fibra di cocco 650g',
      'Sfagno disidratato Reptizoo 100g',
      'Foglie di Butea monosperma',
      'Carbonato di Calcio + D3 Tailybite 50g',
    ],
    slug: 'ciliatus-care-pack',
  },
  {
    name: 'Ciliatus Thermal Pro – Kit Elettrico Completo',
    description:
      'Sistema completo per gestione termica e illuminazione del terrario del ciliatus. Il termostato dimming PID garantisce controllo preciso della temperatura, mentre UVB supporta il metabolismo del calcio. Pensato per setup sicuri e stabili nel tempo.',
    price: 79.99,
    quantity: 30,
    vatRate: 22,
    active: true,
    images: [],
    includedProducts: [
      'Lampada spot Heat Spot 60W',
      '2x Portalampada con cavo e interruttore',
      'Termostato Dimming PID TC02 Reptizoo',
      'Lampada UVB compatta SolarRep 5% 13W',
    ],
    slug: 'ciliatus-thermal-pro',
  },
  {
    name: 'Pitone Reale Habitat Pro – Kit Arredo',
    description:
      'Kit arredo studiato per garantire sicurezza e rifugi multipli al Pitone reale. Include accessori per gestione alimentazione e arricchimento ambientale. Favorisce comportamenti naturali e riduce lo stress.',
    price: 69.99,
    quantity: 25,
    vatRate: 22,
    active: true,
    images: [],
    includedProducts: [
      'Igrometro',
      'Tana finto tronco 22x15x8h cm',
      'Tana simil tronco con ciotola integrata',
      'Pinze Tweezer ad angolo 25cm',
      'Corteccia di sughero grezza in tubi',
    ],
    slug: 'pitone-reale-habitat-pro',
  },
  {
    name: 'Pitone Reale Refill – Kit Ricorrente Substrato',
    description:
      'Kit di ricambio per mantenere corretta umidità e pulizia del terrario del Pitone reale. Ideale per manutenzione programmata del substrato.',
    price: 14.99,
    quantity: 100,
    vatRate: 22,
    active: true,
    images: [],
    includedProducts: [
      '2x Fibra di cocco 650g',
      'Sfagno disidratato Reptizoo 100g',
    ],
    slug: 'pitone-reale-refill',
  },
  {
    name: 'Geco Leopardino Habitat Starter – Kit Arredo',
    description:
      'Kit arredo completo per terrario di geco leopardino. Include rifugio umido fondamentale per la muta e accessori per alimentazione e monitoraggio parametri ambientali.',
    price: 39.99,
    quantity: 45,
    vatRate: 22,
    active: true,
    images: [],
    includedProducts: [
      'Igrometro',
      'Tana umida GC',
      'Tana finta roccia 15x10x5h cm',
      'Ciotola effetto pietra 18x13x3 cm',
      'Pinze Tweezer 25cm',
    ],
    slug: 'geco-leopardino-habitat-starter',
  },
  {
    name: 'Geco Leopardino Care Pack – Integrazione & Manutenzione',
    description:
      'Kit di reintegro nutrizionale per geco leopardino. Include supplementi fondamentali per prevenire carenze metaboliche e materiale per gestione zona umida.',
    price: 25.99,
    quantity: 70,
    vatRate: 22,
    active: true,
    images: [],
    includedProducts: [
      'Carbonato di Calcio + D3 Tailybite 50g',
      'Multivitaminico Tailybite 50g',
      'Sfagno disidratato Reptizoo 100g',
    ],
    slug: 'geco-leopardino-care-pack',
  },
  {
    name: 'Serpente del Grano Habitat Starter – Kit Arredo',
    description:
      'Kit arredo completo per serpente del grano, con doppio rifugio e accessori per gestione alimentazione e monitoraggio ambientale. Setup equilibrato per sicurezza e comfort.',
    price: 44.99,
    quantity: 35,
    vatRate: 22,
    active: true,
    images: [],
    includedProducts: [
      'Igrometro',
      'Tana finto pioppo Reptizoo',
      'Tana finta roccia',
      'Ciotola plastica 13.8 cm',
      'Pinze Tweezer 25cm',
    ],
    slug: 'serpente-del-grano-habitat-starter',
  },
  {
    name: 'Serpente del Grano Refill – Substrato Premium',
    description:
      'Kit di ricambio substrato per terrari di serpente del grano. Aspen favorisce assorbimento e facilità di pulizia, mantenendo ambiente asciutto e igienico.',
    price: 19.99,
    quantity: 90,
    vatRate: 22,
    active: true,
    images: [],
    includedProducts: ['2x Aspen 15lt PremiumRep'],
    slug: 'serpente-del-grano-refill',
  },
  {
    name: 'Snake Thermal Basic – Kit Elettrico Universale',
    description:
      'Sistema base di riscaldamento per terrari desertici o semi-umidi. Include tappetino riscaldante e termostato per controllo sicuro della temperatura. Compatibile con Serpente del Grano, Geco Leopardino e Pitone Reale.',
    price: 32.90,
    quantity: 60,
    vatRate: 22,
    active: true,
    images: [],
    includedProducts: [
      'Tappetino riscaldante 28x28cm 14W',
      'Termostato on-off Thermocontrol 300R',
    ],
    slug: 'snake-thermal-basic',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_STRING);
    console.log('✅ Connesso a MongoDB');

    for (const kitData of KITS) {
      const exists = await Kit.findOne({ slug: kitData.slug });
      if (exists) {
        console.log(`⏭️  Skip (già esiste): ${kitData.name}`);
        continue;
      }
      await Kit.create(kitData);
      console.log(`✅ Creato: ${kitData.name}`);
    }

    console.log('\n🎉 Seed completato!');
  } catch (err) {
    console.error('❌ Errore seed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();