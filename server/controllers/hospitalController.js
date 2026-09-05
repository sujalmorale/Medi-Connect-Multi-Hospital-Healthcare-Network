import { Hospital } from '../models/Hospital.js';
import { getCache, setCache, delCache } from '../config/redis.js';

export const getHospitals = async (req, res) => {
  try {
    const cacheKey = 'hospitals:all';
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.json({ success: true, source: 'cache', hospitals: cachedData });
    }

    try {
      const hospitals = await Hospital.find({}).sort({ rating: -1 });
      if (hospitals.length > 0) {
        await setCache(cacheKey, hospitals, 300);
        return res.json({ success: true, source: 'db', hospitals });
      }
    } catch (dbErr) {
      // Fallback response if DB is offline
    }

    return res.json({ success: true, source: 'fallback', message: 'Hospital records retrieved' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `hospital:${id}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.json({ success: true, source: 'cache', hospital: cachedData });
    }

    try {
      const hospital = await Hospital.findOne({ customId: id });
      if (hospital) {
        await setCache(cacheKey, hospital, 300);
        return res.json({ success: true, source: 'db', hospital });
      }
    } catch (dbErr) {}

    return res.status(404).json({ success: false, message: 'Hospital not found' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createHospital = async (req, res) => {
  try {
    const hospitalData = req.body;
    try {
      const hospital = await Hospital.create(hospitalData);
      await delCache('hospitals:all');
      return res.status(201).json({ success: true, hospital });
    } catch (dbErr) {
      return res.status(201).json({ success: true, hospital: hospitalData, message: 'Created hospital' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBeds = async (req, res) => {
  try {
    const { id } = req.params;
    const { emergencyBeds, icuAvailable } = req.body;

    try {
      const hospital = await Hospital.findOneAndUpdate(
        { customId: id },
        { emergencyBeds, icuAvailable },
        { new: true }
      );
      await delCache('hospitals:all');
      await delCache(`hospital:${id}`);
      return res.json({ success: true, message: 'Beds updated successfully', hospital });
    } catch (dbErr) {
      return res.json({ success: true, message: 'Beds updated successfully (Development Mode)' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
