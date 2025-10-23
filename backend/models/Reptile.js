import mongoose, { Schema } from 'mongoose';

const reptileSchema = new Schema(
  {
    name: {
      type: String,
    },
    species: {
      type: String,
      required: true
    },
    morph: {
      type: String
    }, sex: {
      type: String,
      enum: ['M', 'F', 'Unknown'],
      required: true,
    },
    isBreeder: {
      type: Boolean,
      default: false,
    },
    stats: {
      breedings: { type: Number, default: 0 },
      successCount: { type: Number, default: 0 },
      offspringCount: { type: Number, default: 0 }
    },
       isPublic: {
      type: Boolean,
      default: false
    },
        previousOwner: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'ceded', 'deceased', 'other'], // 'active' = tuo, 'ceded' = ceduto
      default: 'active',
      required: true,
      index: true
    },
cededTo: { // MODIFICA: Aggiunto campo 'date'
      name: { type: String },
      surname: { type: String },
      notes: { type: String }, // Campo flessibile per "dati"
      date: { type: Date }      // NUOVO: Data della cessione
    },
    deceasedDetails: { // NUOVO: Struttura per animali deceduti
      notes: { type: String },
      date: { type: Date }
    },
        isSold: {
      type: Boolean,
      default: false
    },
    price: {
  amount: {
    type: Number,
    min: 0,
    required: false 
  },
  currency: {
    type: String,
    enum: ['EUR', 'USD', 'GBP', 'JPY', 'CHF'], 
    default: 'EUR'
  }
},
    notes: {
      type: String,
    },
    image: {
      type: [String], 
      default: []
    },
    birthDate: {
      type: Date
    },
    qrCodeUrl: {
  type: String,
  default: null
},
    parents: {
      father: {
        type: String
      },
      mother: {
        type: String
      }
    }, documents: {
      cites: {
        number: { type: String }, 
        issueDate: { type: Date },
        issuer: { type: String }, 
        load: {type: String},
        unload: {type: String},

      },
      microchip: {
        code: { type: String },
        implantDate: { type: Date },
      }
    },

    label: {
      text: { type: String, maxlength: 30 },
      color: { type: String, default: '#228B22' }, 
    }, 
 foodType: {
      type: String,
      enum: ['Topo', 'Ratto', 'Coniglio', 'Pulcino', 'Altro', ''], required: false,
  default: null
    },
    weightPerUnit: { type: Number },
    nextMealDay: { type: Number },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    collection: "Reptile",
    timestamps: true
  }
)

const Reptile = mongoose.models.Reptile || mongoose.model("Reptile", reptileSchema)
export default Reptile

