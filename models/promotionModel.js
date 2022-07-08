import mongoose from 'mongoose'

const promotionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    companyName: String,
    companyWebsite: String,
    country: String,
    region: String,
    companyCAC: String,
    address: String,
    total: Number,
    paymentId: String,
    dateOfExpiration: String,
    method: String,
    activated: {
        type: Boolean,
        default: false
    },
    paid: {
        type: Boolean,
        default: false
    },
    duration: String,
    dateOfPayment: Date,
}, {
    timestamps: true
})

let Dataset = mongoose.models.promotion || mongoose.model('promotion', promotionSchema)
export default Dataset