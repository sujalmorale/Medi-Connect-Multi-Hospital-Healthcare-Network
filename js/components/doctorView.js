import { store } from '../store.js';

export function renderDoctorView(containerEl, activeTab) {
  const state = store.state;
  const currentDoctor = state.doctors.find(d => d.id === store.activeDoctorId) || state.doctors[0];
  const doctorHospital = state.hospitals.find(h => h.id === currentDoctor.hospitalId);
  const queue = state.queueState[currentDoctor.id] || { currentlyServingToken: 'A-18', nextToken: 'A-19', totalInQueue: 3 };

  containerEl.innerHTML = `
    <!-- Doctor Profile Switcher Banner -->
    <div class="glass-card" style="padding: 1.5rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; background: linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%);">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <img src="${currentDoctor.image}" alt="${currentDoctor.name}" style="width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-cyan);" />
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-main);">${currentDoctor.name}</h2>
            <span class="badge ${currentDoctor.status === 'Available' ? 'badge-emerald' : currentDoctor.status === 'Emergency Duty' ? 'badge-rose' : 'badge-amber'}">${currentDoctor.status}</span>
          </div>
          <span style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 600;">${currentDoctor.specialty}</span>
          <span style="font-size: 0.78rem; color: var(--text-muted); display: block;">${doctorHospital ? doctorHospital.name : ''}</span>
        </div>
      </div>

      <!-- Select Doctor Profile -->
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Logged in Doctor:</span>
        <select id="doc-active-select" class="glass-input" style="width: auto; min-width: 220px;">
          ${state.doctors.map(d => `<option value="${d.id}" ${d.id === currentDoctor.id ? 'selected' : ''}>${d.name} (${d.specialty})</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Active Tab Render -->
    <div id="doctor-tab-content">
      ${renderDoctorTabContent(activeTab, currentDoctor, doctorHospital, queue, state)}
    </div>
  `;

  // Attach Doctor Selector
  containerEl.querySelector('#doc-active-select')?.addEventListener('change', (e) => {
    store.setActiveDoctor(e.target.value);
    renderDoctorView(containerEl, activeTab);
  });

  attachDoctorActionListeners(containerEl, currentDoctor);
  if (window.lucide) lucide.createIcons();
}

function renderDoctorTabContent(activeTab, doctor, hospital, queue, state) {
  if (activeTab === 'doctor-queue') {
    return renderQueueControllerHTML(doctor, queue, state);
  } else if (activeTab === 'doctor-slots') {
    return renderDoctorSlotsAndDutyHTML(doctor);
  } else {
    return renderDoctorScheduleHTML(doctor, queue, state);
  }
}

function renderDoctorScheduleHTML(doctor, queue, state) {
  const docAppointments = state.appointments.filter(a => a.doctorId === doctor.id);

  return `
    <div class="grid-responsive-2" style="margin-bottom: 2rem;">
      
      <!-- Live Queue Control Card -->
      <div class="glass-card" style="padding: 1.75rem; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.95) 100%); border-color: rgba(16, 185, 129, 0.3);">
        <span class="badge badge-emerald" style="margin-bottom: 0.75rem;"><span class="live-dot"></span> Live Queue Engine</span>
        
        <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 1rem; color: var(--text-main);">Current Token Status</h3>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; text-align: center;">
          <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 1rem;">
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">NOW SERVING</span>
            <div style="font-size: 2.4rem; font-weight: 800; color: var(--accent-emerald); font-family: var(--font-heading);">${queue.currentlyServingToken}</div>
          </div>

          <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 1rem;">
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">NEXT IN LINE</span>
            <div style="font-size: 2.4rem; font-weight: 800; color: var(--accent-cyan); font-family: var(--font-heading);">${queue.nextToken}</div>
          </div>
        </div>

        <button id="btn-call-next-patient" class="btn-primary" style="width: 100%; justify-content: center; font-size: 1rem; padding: 0.85rem; background: var(--gradient-success);">
          <i data-lucide="play-circle" style="width: 20px; height: 20px;"></i> Call Next Patient (Advance Token)
        </button>
      </div>

      <!-- Quick Metrics Card -->
      <div class="glass-card" style="padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">Today's Statistics</h3>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; padding: 0.5rem; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm);">
              <span style="color: var(--text-muted);">Total Appointments:</span>
              <strong style="color: var(--text-main);">${docAppointments.length} Patients</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; padding: 0.5rem; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm);">
              <span style="color: var(--text-muted);">Remaining in Queue:</span>
              <strong style="color: var(--accent-amber);">${docAppointments.filter(a => a.status === 'Confirmed').length} Patients</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; padding: 0.5rem; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm);">
              <span style="color: var(--text-muted);">Completed Today:</span>
              <strong style="color: var(--accent-emerald);">${docAppointments.filter(a => a.status === 'Completed').length} Patients</strong>
            </div>
          </div>
        </div>

        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-glass); font-size: 0.82rem; color: var(--text-muted);">
          Consultation Duration Avg: ~${queue.avgConsultationMin || 12} minutes per patient.
        </div>
      </div>

    </div>

    <!-- Patient Appointments List -->
    <div class="glass-card" style="padding: 1.5rem;">
      <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
        <i data-lucide="users" style="color: var(--accent-blue);"></i> Today's Patient Queue Timeline
      </h3>

      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${docAppointments.map(apt => `
          <div style="background: rgba(255,255,255,0.02); border: 1px solid ${apt.status === 'In-Consultation' ? 'var(--accent-emerald)' : 'var(--border-glass)'}; border-radius: var(--radius-sm); padding: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="background: rgba(37,99,235,0.15); border: 1px solid rgba(37,99,235,0.3); border-radius: var(--radius-sm); padding: 0.5rem 0.75rem; text-align: center;">
                <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">TOKEN</span>
                <strong style="font-size: 1.2rem; color: var(--accent-cyan); font-family: var(--font-heading);">${apt.tokenNo}</strong>
              </div>

              <div>
                <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main);">${apt.patientName} (${apt.patientAge}y, ${apt.patientGender})</h4>
                <span style="font-size: 0.82rem; color: var(--text-muted);"><i data-lucide="phone" style="width: 12px; height: 12px; vertical-align: middle;"></i> ${apt.patientPhone} • Slot: <strong>${apt.timeSlot}</strong></span>
                <p style="font-size: 0.8rem; color: var(--accent-amber); margin-top: 2px;">Symptom: ${apt.symptom}</p>
              </div>
            </div>

            <!-- Status Controls -->
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="badge ${getStatusBadgeClass(apt.status)}">${apt.status}</span>
              ${apt.status === 'Confirmed' ? `
                <button class="btn-secondary btn-start-consult" data-apt-id="${apt.id}" style="font-size: 0.78rem; padding: 0.4rem 0.8rem;">
                  Start Consultation
                </button>
              ` : ''}
              ${apt.status === 'In-Consultation' ? `
                <button class="btn-primary btn-complete-consult" data-apt-id="${apt.id}" style="font-size: 0.78rem; padding: 0.4rem 0.8rem; background: var(--gradient-success);">
                  Complete & Discharge
                </button>
              ` : ''}
            </div>

          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderQueueControllerHTML(doctor, queue, state) {
  return renderDoctorScheduleHTML(doctor, queue, state);
}

function renderDoctorSlotsAndDutyHTML(doctor) {
  return `
    <div class="glass-card" style="padding: 2rem; max-width: 700px; margin: 0 auto;">
      <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <i data-lucide="clock" style="color: var(--accent-cyan);"></i> Duty Status & Slot Availability Controller
      </h3>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem;">
        Set your real-time practice status for ${doctor.name}. Changes reflect instantly on patient searches.
      </p>

      <!-- Status Toggle Buttons -->
      <div style="margin-bottom: 2rem;">
        <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.75rem;">Select Active Duty Mode:</label>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button class="btn-duty-toggle ${doctor.status === 'Available' ? 'active-duty-green' : ''}" data-status="Available">
            <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i> Available (Standard OPD)
          </button>
          <button class="btn-duty-toggle ${doctor.status === 'Emergency Duty' ? 'active-duty-red' : ''}" data-status="Emergency Duty">
            <i data-lucide="siren" style="width: 16px; height: 16px;"></i> Emergency Duty Only
          </button>
          <button class="btn-duty-toggle ${doctor.status === 'On Leave' ? 'active-duty-amber' : ''}" data-status="On Leave">
            <i data-lucide="user-x" style="width: 16px; height: 16px;"></i> On Leave
          </button>
        </div>
      </div>

      <!-- Assigned Slots -->
      <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-main);">Configured OPD Slots:</h4>
      <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
        ${doctor.availableSlots.map(slot => `
          <div style="padding: 0.6rem 1rem; border-radius: var(--radius-sm); background: rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.3); font-size: 0.88rem; font-weight: 600; color: #93c5fd;">
            ${slot}
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

function attachDoctorActionListeners(container, doctor) {
  // Duty toggle styles
  const style = document.createElement('style');
  style.innerHTML = `
    .btn-duty-toggle {
      background: var(--bg-glass);
      border: 1px solid var(--border-glass);
      color: var(--text-muted);
      padding: 0.6rem 1.2rem;
      border-radius: var(--radius-sm);
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }
    .active-duty-green {
      background: rgba(16, 185, 129, 0.2) !important;
      border-color: var(--accent-emerald) !important;
      color: #34d399 !important;
    }
    .active-duty-red {
      background: rgba(244, 63, 94, 0.2) !important;
      border-color: var(--accent-rose) !important;
      color: #fb7185 !important;
    }
    .active-duty-amber {
      background: rgba(245, 158, 11, 0.2) !important;
      border-color: var(--accent-amber) !important;
      color: #fbbf24 !important;
    }
  `;
  container.appendChild(style);

  // Call Next Patient
  container.querySelector('#btn-call-next-patient')?.addEventListener('click', () => {
    store.advanceQueueToken(doctor.id);
    renderDoctorView(container, 'doctor-dash');
  });

  // Start Consultation
  container.querySelectorAll('.btn-start-consult').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const aptId = e.currentTarget.dataset.aptId;
      store.updateAppointmentStatus(aptId, 'In-Consultation');
      renderDoctorView(container, 'doctor-dash');
    });
  });

  // Complete Consultation
  container.querySelectorAll('.btn-complete-consult').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const aptId = e.currentTarget.dataset.aptId;
      store.updateAppointmentStatus(aptId, 'Completed');
      renderDoctorView(container, 'doctor-dash');
    });
  });

  // Duty mode change
  container.querySelectorAll('.btn-duty-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const newStatus = e.currentTarget.dataset.status;
      store.updateDoctorStatus(doctor.id, newStatus);
      renderDoctorView(container, 'doctor-slots');
    });
  });
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Confirmed': return 'badge-blue';
    case 'In-Consultation': return 'badge-emerald';
    case 'Completed': return 'badge-purple';
    case 'Cancelled': return 'badge-rose';
    default: return 'badge-blue';
  }
}
