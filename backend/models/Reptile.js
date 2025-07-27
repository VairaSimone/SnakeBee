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
    notes: {
      type: String,
    },
    image: {
      type: String
    },
      birthDate: {
      type: Date
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
        number: { type: String }, // es: codice identificativo CITES
        issueDate: { type: Date },
        issuer: { type: String }, // ente che lo ha rilasciato
      },
      microchip: {
        code: { type: String },
        implantDate: { type: Date },
      }
    },

   label: {
      text: { type: String, maxlength: 30 },
      color: { type: String, default: '#228B22' }, // es: verde di default
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    collection: "Reptile",
    timestamps: true
  }
)

const Reptile = mongoose.models.Reptile || mongoose.model("Reptile", reptileSchema)
export default Reptile