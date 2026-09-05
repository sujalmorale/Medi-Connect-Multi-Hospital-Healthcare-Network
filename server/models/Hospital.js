import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  customId: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  tagline: { type: String, default: '' },
  city: { type: String, required: true, trim: true },
  area: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  image: { type: String, default: '' },
  departments: [{ type: String }],
  emergencyBeds: { type: Number, default: 0 },
  icuAvailable: { type: Number, default: 0 },
  verified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);
