const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const universitySchema = new Schema({
    name: { type: String, required: true, description: "The name of the university." },
    location: { type: String, required: true, description: "The geographic location of the university." },
    units: [{
        unitCode: { type: String, required: true, description: "A unique identifier for the academic unit." },
        unitName: { type: String, required: true, description: "The name of the academic unit." },
        syllabus: { type: String, description: "Detailed syllabus content of the academic unit." }
    }]
});

module.exports = mongoose.model('University', universitySchema);
