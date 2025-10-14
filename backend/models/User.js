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
            enum: ['user', 'admin', 'mod', 'banned'],
            default: "user"
        },
        verificationEmailAttempts: {
            type: Number,
            default: 0,
        },
        subscription: {
            stripeCustomerId: { type: String },
            stripeSubscriptionId: { type: String },
            status: {
                type: String,
                enum: ['active', 'incomplete', 'processing', `pending_cancellation`, 'canceled', 'paused', 'past_due', 'unpaid', null],
                default: null
            },
            currentPeriodEnd: { type: Date },
            plan: { type: String, enum: ['NEOPHYTE', 'APPRENTICE', 'PRACTITIONER', 'BREEDER'], default: 'NEOPHYTE' }
        },

        isVerified: {
            type: Boolean,
            default: false
        },
        billingDetails: {
            name: String,
            email: String,
            address: {
                line1: String,
                line2: String,
                city: String,
                state: String,
                postal_code: String,
                country: String
            }
        },
        fiscalDetails: {
            vatNumber: String,
            taxCode: String,
            sdiCode: String,
            pec: String
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
        }, verificationCode: {
            type: String,
        },
        language: {
            type: String,
            default: 'it',
            enum: ['en', 'it']
        },
        isBanned: {
            type: Boolean,
            default: false
        }, loginAttempts: {
            type: Number,
        },
        accountLockedUntil: {
            type: Date,
        }, address: {
            type: String,
            default: ''
        },
        phoneNumber: {
            type: String,
            match: [/^\+?[0-9\s\-]{7,15}$/, 'Invalid phone number'],
            default: ''
        },

        receiveFeedingEmails: {
            type: Boolean,
            default: true
        },
        isPublic: {
            type: Boolean,
            default: false
        },
        privacyConsent: {
            accepted: {
                type: Boolean,
                default: false
            },
            timestamp: {
                type: Date
            }
        }, createdAt: {
            type: Date,
            default: Date.now
        },
        registrationInfo: {
            ip: String,
            userAgent: String,
            createdAt: Date
        },
         telegramId: {
            type: String,
            unique: true,
            sparse: true 
        },

        referralCode: {
            type: String,
            unique: true,
            sparse: true
        },
        referredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        hasReferred: {
            type: Boolean,
            default: false
        },
        refreshTokens: [{
            token: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }], reptiles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reptile" }],
    },
    {
        collection: "User",
        timestamps: true
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