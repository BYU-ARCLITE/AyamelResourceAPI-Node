import mongoose from 'mongoose';
import { relationSchema } from '../relations/schema';

const resourceSchema = new mongoose.Schema({
  title: {type: String, required: true, maxLength: 1000},
  type: {
    type: String,
    enum: [
      'video',
      'audio',
      'image',
      'document',
      'archive',
      'collection',
      'data',
    ],
    required: true,
  },
  description: {type: String, maxLength: 1000},
  keywords: [{type: String, maxLength: 1000}],
  languages: {
    iso639_3: [String],
    iso639_2: [String],
    bcp47: [String],
    rfc5646: [String],
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
  license: {
    type: String,
    enum: [
      'CC BY',
      'CC BY-ND',
      'CC BY-NC',
      'CC BY-NC-SA',
      'CC BY-NC-ND',
      'youtube',
    ],
  },
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

resourceSchema.pre('save', function(this: any, next) {
  // TODO: automatic code conversion
  const languages = this.languages || {};
  let iso639_3 = languages.iso639_3 || [];

  // TODO: proper code validation
  // currently just filters out empty strings and
  // ensures 'zxx' doesn't co-exist with other codes.
  iso639_3 = iso639_3.flatMap((lang: string) => (lang && (lang !== 'zxx')) ? [lang] : []);
  iso639_3 = [...new Set(iso639_3)]; // remove any duplicates

  // Ensure some language code always exists.
  if (!iso639_3.length) iso639_3 = ['zxx'];

  languages.iso639_3 = iso639_3;
  this.languages = languages;

  next();
});

export { resourceSchema };
