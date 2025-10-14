import mongoose, { Schema } from 'mongoose';

const revokedTokenSchema = new Schema({
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
});

const RevokedToken = mongoose.model('RevokedToken', revokedTokenSchema);
export default RevokedToken;