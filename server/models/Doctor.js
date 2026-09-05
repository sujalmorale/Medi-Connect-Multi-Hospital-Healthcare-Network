import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  customId: { type: String, required: true, unique: true },
  hospitalId: { type: String, required: true },
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  degree: { type: String, required: true },
  experienceYears: { type: Number, required: true },
  consultationFee: { type: Number, required: true },
  rating: { type: Number, default: 4.8 },
  availableDays: [{ type: String }],
  availableSlots: [{ type: String }],
  bookedSlots: [{ type: String }],
  roomNo: { type: String, default: '101' },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
