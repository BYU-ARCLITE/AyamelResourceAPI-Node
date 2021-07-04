import mongoose from 'mongoose';

export const relationSchema = new mongoose.Schema({
    id: String,
    subjectId: {type: String, match: /^(?!\s*$).+/, required: true},
    objectId: {type: String, match: /^(?!\s*$).+/, required: true},
    type: {type: String, enum: ['based_on','references','requires','transcript_of','search','version_of','part_of','translation_of','contains'], required: true},
    attributes: {type: Map, of: String},
    clientUser: {
        id: {type: String, maxLength: 1000},
        url: {type: String, maxLength: 2500},
    },
    required: false
});
