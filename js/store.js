import { INITIAL_DATA } from './data.js';

const STORAGE_KEY = 'mediconnect_state_mumbai_v5';
const EVENT_NAME = 'mediconnect_state_changed';

class Store {
  constructor() {
    this.state = this.loadState();
    this.currentRole = 'patient'; // patient, hospAdmin, doctor, superAdmin
    this.activeHospitalId = 'hosp-mumbai-1'; // For hospital admin view
    this.activeDoctorId = 'doc-mumbai-1';     // For doctor view
    this.listeners = [];
    
    // BroadcastChannel for multi-tab real-time syncing
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel('mediconnect_channel');
      this.channel.onmessage = (event) => {
        if (event.data && event.data.type === 'STATE_UPDATED') {
          this.state = event.data.state;
          this.notify();
        }
      };
    }
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      if (this.channel) {
        this.channel.postMessage({ type: 'STATE_UPDATED', state: this.state });
      }
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    this.notify();
  }

  resetState() {
    this.state = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveState();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: this.state }));
    this.listeners.forEach(listener => listener(this.state, this.currentRole));
  }

  setRole(role) {
    this.currentRole = role;
    this.notify();
  }

  setActiveHospital(hospId) {
    this.activeHospitalId = hospId;
    this.notify();
  }

  setActiveDoctor(docId) {
    this.activeDoctorId = docId;
    this.notify();
  }

  // --- ACTIONS ---

  /**
   * Book an appointment & auto-generate digital token & update slot availability
   */
  bookAppointment({ hospitalId, doctorId, timeSlot, patientName, patientPhone, patientAge, patientGender, symptom, type = 'Regular' }) {
    const doctor = this.state.doctors.find(d => d.id === doctorId);
    const hospital = this.state.hospitals.find(h => h.id === hospitalId);

    if (!doctor || !hospital) return { success: false, message: 'Doctor or Hospital not found' };

    // Check if slot is already booked
    if (doctor.bookedSlots.includes(timeSlot)) {
      return { success: false, message: 'This slot was just booked by another patient! Please select another slot.' };
    }

    // Mark slot as booked
    doctor.bookedSlots.push(timeSlot);

    // Generate Digital Token (e.g., A-20 or E-05 for Emergency)
    const tokenPrefix = type === 'Emergency' ? 'E' : (doctor.name.split(' ')[1] ? doctor.name.split(' ')[1][0] : 'A');
    const randomSeq = Math.floor(15 + Math.random() * 85);
    const tokenNo = `${tokenPrefix}-${randomSeq}`;

    const newAppointment = {
      id: `apt-${Date.now()}`,
      tokenNo,
      patientName: patientName || 'Patient',
      patientPhone: patientPhone || '+91 99999 00000',
      patientAge: patientAge || 30,
      patientGender: patientGender || 'Other',
      hospitalId,
      hospitalName: hospital.name,
      doctorId,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date: new Date().toISOString().split('T')[0],
      timeSlot,
      symptom: symptom || 'General Consultation',
      type,
      fee: doctor.fee,
      status: 'Confirmed',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.state.appointments.unshift(newAppointment);

    // Update queue total
    if (this.state.queueState[doctorId]) {
      this.state.queueState[doctorId].totalInQueue += 1;
    } else {
      this.state.queueState[doctorId] = {
        currentlyServingToken: `${tokenPrefix}-01`,
        nextToken: tokenNo,
        totalInQueue: 1,
        avgConsultationMin: 12
      };
    }

    this.saveState();
    return { success: true, appointment: newAppointment };
  }

  /**
   * Update Bed Counts in Real-Time (General, ICU, Emergency)
   */
  updateBeds(hospitalId, bedCategory, newAvailableCount) {
    const hosp = this.state.hospitals.find(h => h.id === hospitalId);
    if (hosp && hosp.beds[bedCategory]) {
      const count = Math.max(0, parseInt(newAvailableCount) || 0);
      hosp.beds[bedCategory].available = Math.min(count, hosp.beds[bedCategory].total);
      this.saveState();
      return true;
    }
    return false;
  }

  /**
   * Update Doctor Status (Available, Emergency Duty, On Leave)
   */
  updateDoctorStatus(doctorId, newStatus) {
    const doctor = this.state.doctors.find(d => d.id === doctorId);
    if (doctor) {
      doctor.status = newStatus;
      this.saveState();
      return true;
    }
    return false;
  }

  /**
   * Advance Queue Token (Doctor advances: Currently Serving -> Next Token)
   */
  advanceQueueToken(doctorId) {
    const queue = this.state.queueState[doctorId];
    const docAppointments = this.state.appointments.filter(a => a.doctorId === doctorId && a.status !== 'Completed' && a.status !== 'Cancelled');
    
    if (docAppointments.length > 0) {
      // Complete current appointment if in consultation
      const currentInConsultation = docAppointments.find(a => a.status === 'In-Consultation');
      if (currentInConsultation) {
        currentInConsultation.status = 'Completed';
      }

      // Next confirmed appointment moves to In-Consultation
      const nextConfirmed = docAppointments.find(a => a.status === 'Confirmed');
      if (nextConfirmed) {
        nextConfirmed.status = 'In-Consultation';
        if (queue) {
          queue.currentlyServingToken = nextConfirmed.tokenNo;
          const remainingConfirmed = docAppointments.filter(a => a.id !== nextConfirmed.id && a.status === 'Confirmed');
          queue.nextToken = remainingConfirmed.length > 0 ? remainingConfirmed[0].tokenNo : 'None';
          queue.totalInQueue = Math.max(0, queue.totalInQueue - 1);
        }
      }
      this.saveState();
      return true;
    }
    return false;
  }

  /**
   * Update Appointment Consultation Status
   */
  updateAppointmentStatus(aptId, newStatus) {
    const apt = this.state.appointments.find(a => a.id === aptId);
    if (apt) {
      apt.status = newStatus;
      this.saveState();
      return true;
    }
    return false;
  }

  /**
   * Super Admin approves hospital onboarding
   */
  approveHospital(pendingHospId) {
    const pendingIndex = this.state.pendingHospitals.findIndex(h => h.id === pendingHospId);
    if (pendingIndex !== -1) {
      const pending = this.state.pendingHospitals[pendingIndex];
      const newHosp = {
        id: `hosp-${Date.now()}`,
        name: pending.name,
        tagline: "Newly Onboarded Medical Facility",
        location: pending.location,
        city: "Metro City",
        distanceKm: 3.5,
        rating: 4.5,
        reviewCount: 1,
        emergencyAvailable: true,
        ambulanceAvailable: true,
        ambulanceContact: pending.phone,
        status: "Approved",
        beds: {
          general: { available: pending.beds.general, total: pending.beds.general + 10 },
          icu: { available: pending.beds.icu, total: pending.beds.icu + 5 },
          emergency: { available: pending.beds.emergency, total: pending.beds.emergency + 5 }
        },
        departments: pending.departments,
        badge: "Verified Hospital",
        image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80"
      };

      this.state.hospitals.push(newHosp);
      this.state.pendingHospitals.splice(pendingIndex, 1);
      this.saveState();
      return true;
    }
    return false;
  }

  /**
   * Super Admin rejects hospital onboarding
   */
  rejectHospital(pendingHospId) {
    this.state.pendingHospitals = this.state.pendingHospitals.filter(h => h.id !== pendingHospId);
    this.saveState();
    return true;
  }

  /**
   * Register a new hospital (Hospital Admin application)
   */
  registerHospital(hospitalData) {
    const newPending = {
      id: `hosp-p-${Date.now()}`,
      name: hospitalData.name,
      location: hospitalData.location,
      appliedDate: new Date().toISOString().split('T')[0],
      contactPerson: hospitalData.contactPerson,
      phone: hospitalData.phone,
      licenseNumber: hospitalData.licenseNumber || `REG-MC-${Math.floor(1000 + Math.random() * 9000)}`,
      departments: hospitalData.departments || ["General Medicine"],
      beds: {
        general: parseInt(hospitalData.generalBeds) || 20,
        icu: parseInt(hospitalData.icuBeds) || 5,
        emergency: parseInt(hospitalData.emergencyBeds) || 8
      }
    };
    this.state.pendingHospitals.push(newPending);
    this.saveState();
    return newPending;
  }

  /**
   * Add a new doctor to a hospital (Hospital Admin)
   */
  addDoctor(docData) {
    const newDoc = {
      id: `doc-${Date.now()}`,
      hospitalId: docData.hospitalId || this.activeHospitalId,
      name: docData.name,
      specialty: docData.specialty,
      qualifications: docData.qualifications || "MBBS, MD",
      experience: docData.experience || "5 Years",
      fee: parseInt(docData.fee) || 500,
      rating: 4.8,
      status: "Available",
      image: docData.image || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
      availableSlots: docData.availableSlots || ["10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"],
      bookedSlots: []
    };
    this.state.doctors.push(newDoc);
    this.saveState();
    return newDoc;
  }

  /**
   * AI Doctor Specialist Recommendation Engine
   * Match symptoms against knowledge base
   */
  recommendSpecialist(symptomsInput) {
    if (!symptomsInput || symptomsInput.trim() === '') return null;

    const inputLower = symptomsInput.toLowerCase();
    const words = inputLower.split(/[\s,+/]+/).filter(w => w.length > 2);

    let bestMatch = null;
    let highestScore = 0;

    this.state.symptomKnowledgeBase.forEach(item => {
      let score = 0;
      item.symptoms.forEach(sym => {
        if (inputLower.includes(sym)) {
          score += 3;
        } else {
          words.forEach(w => {
            if (sym.includes(w) || w.includes(sym)) score += 1;
          });
        }
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    });

    // Default recommendation if no exact match
    if (!bestMatch || highestScore === 0) {
      bestMatch = {
        symptoms: [symptomsInput],
        specialist: "General Physician",
        urgency: "Moderate",
        advice: "For general wellness or non-specific symptoms, consulting a General Physician is recommended for primary evaluation."
      };
    }

    // Find doctors matching this specialist
    const matchingDoctors = this.state.doctors.filter(d => 
      d.specialty.toLowerCase().includes(bestMatch.specialist.toLowerCase()) ||
      (bestMatch.specialist === 'General Physician' && (d.specialty.includes('General') || d.specialty.includes('Medicine')))
    );

    return {
      recommendation: bestMatch,
      matchingDoctors,
      matchConfidence: Math.min(100, Math.max(60, highestScore * 25))
    };
  }
}

export const store = new Store();
