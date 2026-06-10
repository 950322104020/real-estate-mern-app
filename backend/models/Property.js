const mongoose = require('mongoose');

// 1. Create the blueprint (Schema) for a real estate listing
const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    address: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    imageUrl: { type: String, required: false, default: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    purpose: { type: String, required: true, default: "For Sale" }
}, { timestamps: true });

// 2. Build the model based on the blueprint and export it so our server can use it
module.exports = mongoose.model('Property', propertySchema);