import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  customId: { type: String, required: true, unique: true },
  hospitalId: { type: String, required: true },
  doctorId: { type: String, required: true },
  patientId: { type: String, default: '' },
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  patientAge: { type: Number, required: true },
  patientGender: { type: String, required: true },
  symptom: { type: String, default: '' },
  type: { type: String, enum: ['Regular', 'Emergency', 'Follow-up'], default: 'Regular' },
  timeSlot: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  tokenNo: { type: Number, required: true },
  queueNumber: { type: Number, required: true },
  status: { type: String, enum: ['Confirmed', 'In-Consultation', 'Completed', 'Cancelled'], default: 'Confirmed' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Refunded'], default: 'Paid' },
  razorpayPaymentId: { type: String, default: '' },
  razorpayOrderId: { type: String, default: '' },
  consultationFee: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
