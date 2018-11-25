const mongoose = require('mongoose');

const UNSYNCHRONIZED_STATUS = 'unsynchronized';
const SYNCHRONIZING_STATUS = 'synchronizing';
const SYNCHRONIZED_STATUS = 'synchronized';
const STATUSES = [UNSYNCHRONIZED_STATUS, SYNCHRONIZING_STATUS, SYNCHRONIZED_STATUS];

const CatalogSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      default: UNSYNCHRONIZED_STATUS,
      enum: STATUSES,
    },
  },
  {
    timestamps: true,
    strict: true,
    versionKey: false,
  }
);

CatalogSchema.statics.UNSYNCHRONIZED_STATUS = UNSYNCHRONIZED_STATUS;
CatalogSchema.statics.SYNCHRONIZING_STATUS = SYNCHRONIZING_STATUS;
CatalogSchema.statics.SYNCHRONIZED_STATUS = SYNCHRONIZED_STATUS;
CatalogSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Catalog', CatalogSchema);
