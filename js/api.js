/**
 * MediConnect API Client Module
 * Connects frontend SPA to Node.js/Express REST API backend with JWT & Razorpay integration
 */

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('mediconnect_jwt_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('mediconnect_jwt_token', token);
    } else {
      localStorage.removeItem('mediconnect_jwt_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {})
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn(`[API Connection Note] Endpoint ${endpoint} unreachable:`, error.message);
      return { success: false, isOffline: true, message: error.message };
    }
  }

  // --- Auth APIs ---
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.success && res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async register(userData) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res.success && res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  // --- Hospital APIs ---
  async getHospitals() {
    return await this.request('/hospitals');
  }

  async updateBeds(hospitalId, emergencyBeds, icuAvailable) {
    return await this.request(`/hospitals/${hospitalId}/beds`, {
      method: 'PUT',
      body: JSON.stringify({ emergencyBeds, icuAvailable })
    });
  }

  // --- Doctor APIs ---
  async getDoctors(hospitalId = '', specialty = '') {
    return await this.request(`/doctors?hospitalId=${hospitalId}&specialty=${specialty}`);
  }

  // --- Appointment & Slot Locking APIs ---
  async bookAppointment(bookingData) {
    return await this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  // --- Razorpay Payment Integration APIs ---
  async createRazorpayOrder(amount, patientName) {
    return await this.request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, patientName })
    });
  }

  async verifyRazorpayPayment(paymentData) {
    return await this.request('/payments/verify-signature', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }
}

export const apiService = new ApiService();
