const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    addedBy: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Evidence', evidenceSchema);