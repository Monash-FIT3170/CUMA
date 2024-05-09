const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mappingSchema = new Schema({
    currentUnit: {
        type: String,
        required: true,
        description: "Unit code of the home university's academic unit involved in the mapping."
    },
    foreignUnit: {
        type: String,
        required: true,
        description: "Unit code of the corresponding foreign university's academic unit."
    },
    similarityScore: {
        type: Number,
        description: "A numerical score representing how similar the syllabi of the two mapped units are."
    },
    dateMapped: {
        type: Date,
        required: true,
        default: Date.now,
        description: "The date when this mapping was created."
    },
    notes: {
        type: String,
        description: "Additional notes about the mapping, such as specific areas of alignment or divergence."
    }
});

module.exports = mongoose.model('Mapping', mappingSchema);
