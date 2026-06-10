const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // NEW: A personal "backpack" to store the unique IDs of their favorite houses
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }]
    
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);