import mongoose from 'mongoose'

const siteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: Number,
        trim: true
    },
    images: {
        type: Array,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    terms_conditions: {
        type: String,
        required: true
    },
    privacy_policy: {
        type: String,
        required: true
    },
    facebook: {
        type: String,
    },
    whatsapp: {
        type: String,
    },
    twitter: {
        type: String,
    },
    instagram: {
        type: String,
    },
    cookies: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
})

let Dataset = mongoose.models.site || mongoose.model('site', siteSchema)
export default Dataset