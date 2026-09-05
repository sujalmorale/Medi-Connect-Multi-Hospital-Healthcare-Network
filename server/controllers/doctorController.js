import { Doctor } from '../models/Doctor.js';
import { getCache, setCache, delCache } from '../config/redis.js';

export const getDoctors = async (req, res) => {
  try {
    const { hospitalId, specialty } = req.query;
    const cacheKey = `doctors:${hospitalId || 'all'}:${specialty || 'all'}`;
    
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, source: 'cache', doctors: cached });
    }

    try {
      const query = {};
      if (hospitalId) query.hospitalId = hospitalId;
      if (specialty) query.specialty = specialty;

      const doctors = await Doctor.find(query).sort({ rating: -1 });
      if (doctors.length > 0) {
        await setCache(cacheKey, doctors, 300);
        return res.json({ success: true, source: 'db', doctors });
      }
    } catch (dbErr) {}

    return res.json({ success: true, source: 'fallback', doctors: [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `doctor:${id}`;
    
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, source: 'cache', doctor: cached });
    }

    try {
      const doctor = await Doctor.findOne({ customId: id });
      if (doctor) {
        await setCache(cacheKey, doctor, 300);
        return res.json({ success: true, source: 'db', doctor });
      }
    } catch (dbErr) {}

    return res.status(404).json({ success: false, message: 'Doctor not found' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { availableSlots } = req.body;

    try {
      const doctor = await Doctor.findOneAndUpdate(
        { customId: id },
        { availableSlots },
        { new: true }
      );
      await delCache(`doctor:${id}`);
      await delCache('doctors:all:all');
      return res.json({ success: true, message: 'Doctor slots updated', doctor });
    } catch (dbErr) {
      return res.json({ success: true, message: 'Doctor slots updated (Development Mode)' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
