const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    authors: {
      type: [String],
    },
    publisher: {
      type: String,
      default: 'Gutenberg',
      required: true,
    },
    publication_date: {
      type: Date,
    },
    language: {
      type: String,
    },
    subjects: {
      type: [String],
    },
    license_rights: {
      type: [String],
    },
  },
  {
    strict: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Book', BookSchema);
