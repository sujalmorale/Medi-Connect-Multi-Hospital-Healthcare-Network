import { store } from '../store.js';

export function openBookingModal(hospitalId, doctorId, initialType = 'Regular') {
  const state = store.state;
  const hospital = state.hospitals.find(h => h.id === hospitalId);
  const doctor = state.doctors.find(d => d.id === doctorId);

  if (!hospital || !doctor) return;

  // Remove existing modal if any
  const existingModal = document.getElementById('booking-modal-overlay');
  if (existingModal) existingModal.remove();

  let selectedSlot = doctor.availableSlots.find(s => !doctor.bookedSlots.includes(s)) || doctor.availableSlots[0];
  let currentStep = 'form'; // 'form' or 'success'
  let createdAppointment = null;

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'booking-modal-overlay';
  modalOverlay.className = 'modal-overlay';

  function renderModalInner() {
    if (currentStep === 'form') {
      modalOverlay.innerHTML = `
        <div class="modal-content">
          <!-- Modal Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-glass); padding-bottom: 1rem;">
            <div>
              <span class="badge ${initialType === 'Emergency' ? 'badge-rose' : 'badge-blue'}" style="margin-bottom: 4px;">
                ${initialType === 'Emergency' ? '🚨 Emergency Slot Booking' : '📅 Out-Patient Booking'}
              </span>
              <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--text-main);">Book Appointment</h3>
              <p style="font-size: 0.82rem; color: var(--text-muted);">${hospital.name}</p>
            </div>
            <button id="btn-close-modal" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;">
              <i data-lucide="x" style="width: 22px; height: 22px;"></i>
            </button>
          </div>

          <!-- Doctor Info Summary -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 1rem; display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem;">
            <img src="${doctor.image}" alt="${doctor.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-blue);" />
            <div>
              <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main);">${doctor.name}</h4>
              <span style="font-size: 0.82rem; color: var(--accent-cyan); font-weight: 600;">${doctor.specialty}</span>
              <span style="font-size: 0.78rem; color: var(--text-muted); display: block;">Consultation Fee: <strong style="color: var(--accent-emerald);">₹${doctor.fee}</strong></span>
            </div>
          </div>

          <!-- Booking Form -->
          <form id="booking-form" style="display: flex; flex-direction: column; gap: 1rem;">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.35rem;">Patient Full Name</label>
                <input type="text" id="apt-patient-name" class="glass-input" required placeholder="e.g. Rahul Sharma" value="Rahul Sharma" />
              </div>
              <div>
                <label style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.35rem;">Mobile Phone Number</label>
                <input type="tel" id="apt-patient-phone" class="glass-input" required placeholder="+91 98765 43210" value="+91 98220 11223" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.35rem;">Age (Years)</label>
                <input type="number" id="apt-patient-age" class="glass-input" required placeholder="32" value="32" />
              </div>
              <div>
                <label style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.35rem;">Gender</label>
                <select id="apt-patient-gender" class="glass-input" required>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.35rem;">Primary Symptoms / Reason for Visit</label>
              <input type="text" id="apt-patient-symptom" class="glass-input" placeholder="e.g. Fever + Headache + Body Pain" value="Fever + Headache + Body Pain" />
            </div>

            <!-- Time Slot Matrix Selection -->
            <div>
              <label style="font-size: 0.85rem; color: var(--text-main); font-weight: 700; display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Select Consultation Time Slot (Today):</span>
                <span style="font-weight: 400; color: var(--text-muted); font-size: 0.78rem;">Live Available Slots</span>
              </label>

              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.5rem;" id="slots-matrix-container">
                ${doctor.availableSlots.map(slot => {
                  const isBooked = doctor.bookedSlots.includes(slot);
                  const isSelected = slot === selectedSlot;
                  return `
                    <div class="slot-pill ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}" data-slot="${slot}">
                      ${slot}
                      ${isBooked ? '<span style="display:block; font-size: 0.65rem; color: #fca5a5;">Booked</span>' : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div id="booking-error-msg" style="color: var(--accent-rose); font-size: 0.85rem; font-weight: 600; display: none;"></div>

            <!-- Action Buttons -->
            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
              <button type="button" id="btn-cancel-modal" class="btn-secondary">Cancel</button>
              <button type="submit" class="btn-primary" style="padding: 0.75rem 1.5rem;">
                <i data-lucide="check-circle" style="width: 18px; height: 18px;"></i> Confirm & Issue Digital Token
              </button>
            </div>

          </form>

        </div>
      `;
    } else {
      // Success Step with Digital Token Ticket
      modalOverlay.innerHTML = `
        <div class="modal-content" style="text-align: center;">
          <div style="background: rgba(16, 185, 129, 0.15); width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; border: 2px solid var(--accent-emerald);">
            <i data-lucide="check" style="color: var(--accent-emerald); width: 36px; height: 36px;"></i>
          </div>

          <h3 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">Appointment Confirmed!</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">Your digital token has been locked in the live hospital queue system.</p>

          <!-- Digital Token Ticket Card -->
          <div class="token-card" style="margin-bottom: 1.5rem; text-align: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">YOUR DIGITAL TOKEN NUMBER</span>
            <div class="token-number" style="font-size: 3.2rem; margin: 0.25rem 0;">${createdAppointment.tokenNo}</div>
            
            <div style="border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 0.75rem; margin-top: 0.75rem; font-size: 0.85rem; color: var(--text-main);">
              <strong>${createdAppointment.doctorName}</strong> • ${createdAppointment.specialty}<br/>
              <span style="color: var(--text-muted);">${createdAppointment.hospitalName}</span><br/>
              <span style="color: var(--accent-cyan); font-weight: 600;">Time Slot: ${createdAppointment.timeSlot} Today</span>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 0.75rem; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.5rem;">
            💡 <strong>Queue Tip:</strong> You will get real-time token tracking notifications under "My Tokens".
          </div>

          <button id="btn-done-modal" class="btn-primary" style="width: 100%; justify-content: center; font-size: 1rem; padding: 0.75rem;">
            View My Tokens & Queue Status
          </button>
        </div>
      `;
    }

    attachModalListeners();
    if (window.lucide) lucide.createIcons();
  }

  function attachModalListeners() {
    modalOverlay.querySelector('#btn-close-modal')?.addEventListener('click', () => modalOverlay.remove());
    modalOverlay.querySelector('#btn-cancel-modal')?.addEventListener('click', () => modalOverlay.remove());

    modalOverlay.querySelectorAll('.slot-pill:not(.booked)').forEach(pill => {
      pill.addEventListener('click', (e) => {
        selectedSlot = e.currentTarget.dataset.slot;
        renderModalInner();
      });
    });

    const form = modalOverlay.querySelector('#booking-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const patientName = modalOverlay.querySelector('#apt-patient-name').value;
      const patientPhone = modalOverlay.querySelector('#apt-patient-phone').value;
      const patientAge = modalOverlay.querySelector('#apt-patient-age').value;
      const patientGender = modalOverlay.querySelector('#apt-patient-gender').value;
      const symptom = modalOverlay.querySelector('#apt-patient-symptom').value;

      const res = store.bookAppointment({
        hospitalId,
        doctorId,
        timeSlot: selectedSlot,
        patientName,
        patientPhone,
        patientAge,
        patientGender,
        symptom,
        type: initialType
      });

      if (res.success) {
        createdAppointment = res.appointment;
        currentStep = 'success';
        renderModalInner();
      } else {
        const errEl = modalOverlay.querySelector('#booking-error-msg');
        errEl.innerText = res.message;
        errEl.style.display = 'block';
      }
    });

    modalOverlay.querySelector('#btn-done-modal')?.addEventListener('click', () => {
      modalOverlay.remove();
      // Switch tab to my-appointments
      if (window.onNavigateTab) window.onNavigateTab('my-appointments');
    });
  }

  renderModalInner();
  document.body.appendChild(modalOverlay);
}
