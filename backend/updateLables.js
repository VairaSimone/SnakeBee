// supponendo che il tuo modello si chiami Reptile
import 'dotenv/config';

import mongoose from 'mongoose';
import Reptile from "./models/Reptile.js";

mongoose.connect(process.env.MONGO_STRING)
  .then(async () => {
    const updated = await Reptile.updateMany(
      { documents: { $exists: false } }, // solo i documenti che non hanno già il campo
      {
    $set: {
      documents: {
        cites: {
          number: "",
          issueDate: null,
          issuer: ""
        },
        microchip: {
          code: "",
          implantDate: null
        }
      }
    }
  }
);
    console.log(`Documenti aggiornati: ${updated.modifiedCount}`);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Errore connessione DB:', err);
  });
