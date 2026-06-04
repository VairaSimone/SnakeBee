import mongoose, { Schema } from 'mongoose';

const transactionSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['income', 'expense'], 
      required: true 
    },
    category: { 
      type: String, 
      required: true,
      // Esempi: 'equipment' (terrari, rack), 'supplies' (substrato, pinze), 'expo' (tavoli in fiera), 'other'
    },
    amount: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    currency: { 
      type: String, 
      enum: ['EUR', 'USD', 'GBP', 'JPY', 'CHF'], 
      default: 'EUR' 
    },
    date: { 
      type: Date, 
      required: true,
      default: Date.now
    },
    description: { 
      type: String 
    }
  },
  {
    collection: 'Transaction',
    timestamps: true
  }
);

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
export default Transaction;