const mongoose = require('mongoose');

// Define the schema
const EntertainmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  publicationDate: { type: Date, required: true },
  genre: { type: [String], required: true },
  type: {
    type: String,
    enum: ["book", "movie", "show", "game"],
    required: true
  },
  details: { type: Object, required: true },
  rating: { type: Number, min: 0, max: 10 },
  img_url: {
    type: String,
    required: false,
  },
});

// Export the model
module.exports = mongoose.model('Entertainment', EntertainmentSchema);
