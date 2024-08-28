const mongoose = require('mongoose');

const LocationSchema = mongoose.Schema({
    division: { type: String },
    district: { type: String },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'products' }]
}, { timestamps: true, versionKey: false });

const LocationModel = mongoose.model('locations', LocationSchema);

module.exports = LocationModel;
