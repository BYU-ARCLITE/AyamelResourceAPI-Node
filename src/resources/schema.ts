import mongoose from 'mongoose';
import { relationSchema } from '../relations/schema';

export const resourceSchema = new mongoose.Schema({
  title: {type: String, required: true, maxLength: 1000},
  contentType: {type: String, enum: ['video', 'audio', 'image', 'document', 'archive', 'collection', 'data'], required: true},
  description: {type: String, maxLength: 1000},
  keywords: [{type: String, maxLength: 1000}],
  languages: {
    iso639_3: [String],
    bcp47: [String]
  },
  topics: [String],
  formats: [String],
  authenticity: [String],
  registers: [String],
  functions: [String],
  genres: [String],
  subjectDomains: [String],
  functionalDomains: [String],
  visibility: [String],
  copryright: {type: String, maxLength: 1000},
  license: {type: String, enum: ['CC BY', 'CC BY-ND', 'CC BY-NC', 'CC BY-NC-SA', 'CC BY-NC-ND', 'youtube']},
  origin: {
    creator: {type: String, maxLength: 1000},
    location: {type: String, maxLength: 1000},
    date: {type: String, maxLength: 1000},
    format: {type: String, maxLength: 1000},
    note: {type: String, maxLength: 1000},
    uri: {type: String, maxLength: 2500}
  },
  client: {
    id: String,
    name: String,
    uri: String
  },
  content: {
    canonicalUrl: {type: String, maxLength: 2500},
    oembed: {
      type: {type: String},
      version: String,
      title: String,
      author_name: String,
      author_url: String,
      provider_name: String,
      provider_url: String,
      thumbnail_url: String,
      thumbnail_height: Number,
      thumbnail_width: Number,
      cache_age: String,
      html: String,
      url: String,
      height: Number,
      width: Number,
    },
    files: [{
      downloadUri: String,
      streamUri: String,
      bytes: Number,
      representation: String,
      quality: Number,
      mime: String,
      mimeType: String,
      attribues: {type: Map, of: String}
    }]
  },
  clientUser: {
    id: {type: String, maxLength: 1000},
    url: {type: String, maxLength: 2500},
  },
  id: String,
  sequence: Boolean,
  status: String,
  relations: [{type: relationSchema, required: false}],
}, {timestamps: {createdAt: 'dateAdded', updatedAt: 'dateModified'}});