const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pathwaySchema = new Schema({
    studentId: {
        type: String,
        required: true,
        description: "Identifier for the student who might pursue this pathway."
    },
    originUniversity: {
        type: String,
        required: true,
        description: "Name of the student's current university."
    },
    destinationUniversity: {
        type: String,
        required: true,
        description: "Name of the potential destination university abroad."
    },
    pathwayUnits: [{
        currentUnit: {
            type: String,
            required: true,
            description: "Unit code at the origin university involved in the pathway."
        },
        foreignUnit: {
            type: String,
            required: true,
            description: "Corresponding unit code at the destination university."
        }
    }],
    description: {
        type: String,
        description: "A brief description of the pathway, including its educational and career benefits."
    }
});

module.exports = mongoose.model('Pathway', pathwaySchema);
