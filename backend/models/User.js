import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(

    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email']
        },
        password: {
            type: String,
        },
        googleId: {
            type: String
        },
        avatar: {
            type: String,
            default: "https://static.thenounproject.com/png/363639-200.png"
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: "user"
        },
        verificationEmailAttempts: {
  type: Number,
  default: 0,
},

        isVerified: {
            type: Boolean,
            default: false
        },
        loginHistory: [{
            ip: String,
            userAgent: String,
            date: { type: Date, default: Date.now }
        }],

        lastVerificationEmailSentAt: {
            type: Date,
        },
        resetPasswordCode: {
            type: String,
        },
        resetPasswordExpires: {
            type: Date,
        },
        lastPasswordResetEmailSentAt: {
            type: Date,
        },    verificationCode: {
            type: String,
    },

        isBanned: {
            type: Boolean,
            default: false // Di default l'utente non è bannato
        }, loginAttempts: {
            type: Number,
        },
        accountLockedUntil: {
            type: Date,
        },
        receiveFeedingEmails: {
  type: Boolean,
  default: true
},
privacyConsent: {
  accepted: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date
  }
},        createdAt: {
            type: Date,
            default: Date.now
        },
        refreshTokens: [{
            token: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }], reptiles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reptile" }],
        //     threads: [{ type: mongoose.Schema.Types.ObjectId, ref: "ForumThread" }],
        //    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "ForumPost" }]
    },
    {
        collection: "User"
    }
)
userSchema.pre('validate', function (next) {
    if (!this.password && !this.googleId) {
        this.invalidate('password', 'Either password or googleId is required');
    }
    next();
});
const User = mongoose.models.User || mongoose.model("User", userSchema)
export default User