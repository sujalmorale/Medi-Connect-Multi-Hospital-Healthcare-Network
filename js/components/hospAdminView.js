import { store } from '../store.js';

export function renderHospAdminView(containerEl, activeTab) {
  const state = store.state;
  const currentHospital = state.hospitals.find(h => h.id === store.activeHospitalId) || state.hospitals[0];

  containerEl.innerHTML = `
    <!-- Hospital Header Selector -->
    <div class="glass-card" style="padding: 1.5rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; background: linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%);">
      <div>
        <span class="badge badge-blue" style="margin-bottom: 0.35rem;"><i data-lucide="building-2" style="width: 12px; height: 12px;"></i> Hospital Administrator Control Portal</span>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main);">${currentHospital.name}</h2>
        <span style="font-size: 0.85rem; color: var(--text-muted);"><i data-lucide="map-pin" style="width: 12px; height: 12px; vertical-align: middle;"></i> ${currentHospital.location}</span>
      </div>

      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Switch Managed Hospital:</span>
        <select id="hosp-admin-select" class="glass-input" style="width: auto; min-width: 240px;">
          ${state.hospitals.map(h => `<option value="${h.id}" ${h.id === currentHospital.id ? 'selected' : ''}>${h.name}</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Active Tab Render -->
    <div id="hosp-admin-tab-content">
      ${renderTabContent(activeTab, currentHospital, state)}
    </div>
  `;

  // Selector listener
  containerEl.querySelector('#hosp-admin-select')?.addEventListener('change', (e) => {
    store.setActiveHospital(e.target.value);
    renderHospAdminView(containerEl, activeTab);
  });

  attachAdminTabListeners(containerEl, currentHospital);
  if (window.lucide) lucide.createIcons();
}

function renderTabContent(activeTab, hospital, state) {
  if (activeTab === 'admin-doctors') {
    return renderDoctorManagementHTML(hospital, state);
  } else if (activeTab === 'admin-beds') {
    return renderBedInventoryHTML(hospital);
  } else if (activeTab === 'admin-appointments') {
    return renderAppointmentsLogHTML(hospital, state);
  } else {
    return renderOverviewHTML(hospital, state);
  }
}

function renderOverviewHTML(hospital, state) {
  const hospitalDoctors = state.doctors.filter(d => d.hospitalId === hospital.id);
  const hospitalAppointments = state.appointments.filter(a => a.hospitalId === hospital.id);

  return `
    <!-- Key Analytics Cards -->
    <div class="grid-responsive-3" style="margin-bottom: 2rem;">
      
      <div class="glass-card" style="padding: 1.5rem; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%); border-color: rgba(16, 185, 129, 0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">General Beds Available</span>
          <i data-lucide="bed" style="color: var(--accent-emerald);"></i>
        </div>
        <div style="font-size: 2.2rem; font-weight: 800; color: var(--accent-emerald); font-family: var(--font-heading);">${hospital.beds.general.available}</div>
        <span style="font-size: 0.75rem; color: var(--text-muted);">Out of ${hospital.beds.general.total} total capacity</span>
      </div>

      <div class="glass-card" style="padding: 1.5rem; background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%); border-color: rgba(6, 182, 212, 0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">ICU Beds Available</span>
          <i data-lucide="activity" style="color: var(--accent-cyan);"></i>
        </div>
        <div style="font-size: 2.2rem; font-weight: 800; color: var(--accent-cyan); font-family: var(--font-heading);">${hospital.beds.icu.available}</div>
        <span style="font-size: 0.75rem; color: var(--text-muted);">Out of ${hospital.beds.icu.total} ICU units</span>
      </div>

      <div class="glass-card" style="padding: 1.5rem; background: linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%); border-color: rgba(244, 63, 94, 0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Emergency Trauma Beds</span>
          <i data-lucide="siren" style="color: var(--accent-rose);"></i>
        </div>
        <div style="font-size: 2.2rem; font-weight: 800; color: var(--accent-rose); font-family: var(--font-heading);">${hospital.beds.emergency.available}</div>
        <span style="font-size: 0.75rem; color: var(--text-muted);">Out of ${hospital.beds.emergency.total} ER bays</span>
      </div>

    </div>

    <!-- Overview Grid -->
    <div class="grid-responsive-2">
      <!-- Active Doctors Summary -->
      <div class="glass-card" style="padding: 1.5rem;">
        <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <i data-lucide="stethoscope" style="color: var(--accent-blue);"></i> Active Doctor Roster (${hospitalDoctors.length})
        </h3>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${hospitalDoctors.map(doc => `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <img src="${doc.image}" alt="${doc.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />
                <div>
                  <strong style="font-size: 0.9rem; display: block;">${doc.name}</strong>
                  <span style="font-size: 0.78rem; color: var(--accent-cyan);">${doc.specialty}</span>
                </div>
              </div>
              <span class="badge ${doc.status === 'Available' ? 'badge-emerald' : doc.status === 'Emergency Duty' ? 'badge-rose' : 'badge-amber'}">
                ${doc.status}
              </span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Quick Recent Appointments -->
      <div class="glass-card" style="padding: 1.5rem;">
        <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <i data-lucide="calendar" style="color: var(--accent-purple);"></i> Today's Appointment Queue (${hospitalAppointments.length})
        </h3>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${hospitalAppointments.map(apt => `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 0.9rem; display: block;">Token #${apt.tokenNo} - ${apt.patientName}</strong>
                <span style="font-size: 0.78rem; color: var(--text-muted);">${apt.doctorName} • ${apt.timeSlot}</span>
              </div>
              <span class="badge badge-blue">${apt.status}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderDoctorManagementHTML(hospital, state) {
  const hospitalDoctors = state.doctors.filter(d => d.hospitalId === hospital.id);

  return `
    <div style="margin-bottom: 2rem;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
        <div>
          <h3 style="font-size: 1.5rem; font-weight: 800;">Doctor Roster & Schedule Management</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Add doctors, configure consultation fees, and assign department slots.</p>
        </div>

        <button id="btn-add-doctor-modal" class="btn-primary">
          <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i> Add New Doctor
        </button>
      </div>

      <div class="grid-responsive-2">
        ${hospitalDoctors.map(doc => `
          <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <img src="${doc.image}" alt="${doc.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-blue);" />
              <div>
                <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main);">${doc.name}</h4>
                <span style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 600;">${doc.specialty}</span>
                <span style="font-size: 0.78rem; color: var(--text-muted); display: block;">${doc.qualifications} • ${doc.experience} exp</span>
              </div>
            </div>

            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 0.75rem; margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.5rem;">
                <span style="color: var(--text-muted);">Consultation Fee:</span>
                <strong style="color: var(--accent-emerald);">₹${doc.fee}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                <span style="color: var(--text-muted);">Current Status:</span>
                <span class="badge ${doc.status === 'Available' ? 'badge-emerald' : doc.status === 'Emergency Duty' ? 'badge-rose' : 'badge-amber'}">${doc.status}</span>
              </div>
            </div>

            <h5 style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem;">Assigned Time Slots (${doc.availableSlots.length}):</h5>
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1rem;">
              ${doc.availableSlots.map(slot => `
                <span style="font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: var(--radius-sm); background: rgba(37,99,235,0.15); border: 1px solid rgba(37,99,235,0.3); color: #93c5fd;">
                  ${slot}
                </span>
              `).join('')}
            </div>

          </div>
        `).join('')}
      </div>

    </div>

    <!-- Modal Container for Add Doctor -->
    <div id="add-doctor-modal-overlay" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 1rem; color: var(--text-main);">Add Doctor to Roster</h3>
        
        <form id="add-doctor-form" style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.35rem;">Doctor Full Name</label>
            <input type="text" id="doc-name-input" class="glass-input" required placeholder="e.g. Dr. Alok Nath" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.35rem;">Specialty</label>
              <select id="doc-spec-input" class="glass-input" required>
                <option value="General Physician">General Physician</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Orthopedic Specialist">Orthopedic Specialist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
                <option value="Ophthalmologist">Ophthalmologist (Eye)</option>
                <option value="ENT Specialist">ENT Specialist</option>
                <option value="Oncologist">Oncologist (Cancer)</option>
                <option value="Gynecologist">Gynecologist & Obstetrician</option>
                <option value="Nephrologist">Nephrologist (Kidney)</option>
                <option value="Pulmonologist">Pulmonologist (Chest)</option>
                <option value="Psychiatrist">Psychiatrist (Mental Health)</option>
                <option value="Urologist">Urologist</option>
                <option value="Endocrinologist">Endocrinologist (Diabetes)</option>
                <option value="Rheumatologist">Rheumatologist</option>
                <option value="Dentist">Dentist / Dental Surgeon</option>
              </select>
            </div>

            <div>
              <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.35rem;">Consultation Fee (₹)</label>
              <input type="number" id="doc-fee-input" class="glass-input" required placeholder="500" value="600" />
            </div>
          </div>

          <div>
            <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.35rem;">Qualifications & Experience</label>
            <input type="text" id="doc-qual-input" class="glass-input" placeholder="e.g. MD (General Medicine), 10 Years" value="MD, MBBS • 10 Years Exp" />
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
            <button type="button" id="btn-cancel-add-doc" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">Save Doctor</button>
          </div>
        </form>

      </div>
    </div>
  `;
}

function renderBedInventoryHTML(hospital) {
  return `
    <div class="glass-card" style="padding: 2rem; max-width: 800px; margin: 0 auto;">
      <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <i data-lucide="bed" style="color: var(--accent-emerald);"></i> Live Bed Inventory Management
      </h3>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem;">
        Update real-time available bed counts for ${hospital.name}. Any adjustments broadcast instantly to patients and emergency responders.
      </p>

      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- General Beds Control -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <strong style="font-size: 1.1rem; display: block; color: var(--text-main);">General Ward Beds</strong>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Total Capacity: ${hospital.beds.general.total} beds</span>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button class="btn-secondary btn-bed-ctrl" data-cat="general" data-delta="-1" style="width: 36px; height: 36px; padding: 0; justify-content: center; font-weight: 800; font-size: 1.2rem;">-</button>
            <span style="font-size: 1.5rem; font-weight: 800; color: var(--accent-emerald); width: 45px; text-align: center;" id="count-general">${hospital.beds.general.available}</span>
            <button class="btn-secondary btn-bed-ctrl" data-cat="general" data-delta="1" style="width: 36px; height: 36px; padding: 0; justify-content: center; font-weight: 800; font-size: 1.2rem;">+</button>
          </div>
        </div>

        <!-- ICU Beds Control -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <strong style="font-size: 1.1rem; display: block; color: var(--text-main);">ICU Beds</strong>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Total Capacity: ${hospital.beds.icu.total} beds</span>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button class="btn-secondary btn-bed-ctrl" data-cat="icu" data-delta="-1" style="width: 36px; height: 36px; padding: 0; justify-content: center; font-weight: 800; font-size: 1.2rem;">-</button>
            <span style="font-size: 1.5rem; font-weight: 800; color: var(--accent-cyan); width: 45px; text-align: center;" id="count-icu">${hospital.beds.icu.available}</span>
            <button class="btn-secondary btn-bed-ctrl" data-cat="icu" data-delta="1" style="width: 36px; height: 36px; padding: 0; justify-content: center; font-weight: 800; font-size: 1.2rem;">+</button>
          </div>
        </div>

        <!-- Emergency Trauma Beds Control -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <strong style="font-size: 1.1rem; display: block; color: var(--text-main);">Emergency Trauma Beds</strong>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Total Capacity: ${hospital.beds.emergency.total} beds</span>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button class="btn-secondary btn-bed-ctrl" data-cat="emergency" data-delta="-1" style="width: 36px; height: 36px; padding: 0; justify-content: center; font-weight: 800; font-size: 1.2rem;">-</button>
            <span style="font-size: 1.5rem; font-weight: 800; color: var(--accent-rose); width: 45px; text-align: center;" id="count-emergency">${hospital.beds.emergency.available}</span>
            <button class="btn-secondary btn-bed-ctrl" data-cat="emergency" data-delta="1" style="width: 36px; height: 36px; padding: 0; justify-content: center; font-weight: 800; font-size: 1.2rem;">+</button>
          </div>
        </div>

      </div>

    </div>
  `;
}

function renderAppointmentsLogHTML(hospital, state) {
  const hospAppointments = state.appointments.filter(a => a.hospitalId === hospital.id);

  return `
    <div class="glass-card" style="padding: 1.5rem;">
      <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
        <i data-lucide="file-text" style="color: var(--accent-blue);"></i> Hospital Appointment Records & Tokens (${hospAppointments.length})
      </h3>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-glass); color: var(--text-muted); font-size: 0.78rem; text-transform: uppercase;">
              <th style="padding: 0.75rem;">Token #</th>
              <th style="padding: 0.75rem;">Patient Name</th>
              <th style="padding: 0.75rem;">Doctor</th>
              <th style="padding: 0.75rem;">Time Slot</th>
              <th style="padding: 0.75rem;">Type</th>
              <th style="padding: 0.75rem;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${hospAppointments.map(apt => `
              <tr style="border-bottom: 1px solid var(--border-glass);">
                <td style="padding: 0.75rem;"><strong style="color: var(--accent-cyan); font-family: var(--font-heading); font-size: 1.1rem;">${apt.tokenNo}</strong></td>
                <td style="padding: 0.75rem;">
                  <strong style="display: block;">${apt.patientName}</strong>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">${apt.patientPhone}</span>
                </td>
                <td style="padding: 0.75rem;">${apt.doctorName}</td>
                <td style="padding: 0.75rem;">${apt.timeSlot}</td>
                <td style="padding: 0.75rem;"><span class="badge ${apt.type === 'Emergency' ? 'badge-rose' : 'badge-blue'}">${apt.type}</span></td>
                <td style="padding: 0.75rem;"><span class="badge badge-emerald">${apt.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

    </div>
  `;
}

function attachAdminTabListeners(container, hospital) {
  // Modal listeners for Add Doctor
  const modal = container.querySelector('#add-doctor-modal-overlay');
  const btnOpen = container.querySelector('#btn-add-doctor-modal');
  const btnCancel = container.querySelector('#btn-cancel-add-doc');
  const form = container.querySelector('#add-doctor-form');

  btnOpen?.addEventListener('click', () => modal.style.display = 'flex');
  btnCancel?.addEventListener('click', () => modal.style.display = 'none');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = container.querySelector('#doc-name-input').value;
    const specialty = container.querySelector('#doc-spec-input').value;
    const fee = container.querySelector('#doc-fee-input').value;
    const qualifications = container.querySelector('#doc-qual-input').value;

    store.addDoctor({ hospitalId: hospital.id, name, specialty, fee, qualifications });
    modal.style.display = 'none';
    renderHospAdminView(container, 'admin-doctors');
  });

  // Bed control buttons
  container.querySelectorAll('.btn-bed-ctrl').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cat = e.currentTarget.dataset.cat;
      const delta = parseInt(e.currentTarget.dataset.delta);
      const currentVal = hospital.beds[cat].available;
      const newVal = currentVal + delta;
      store.updateBeds(hospital.id, cat, newVal);
      renderHospAdminView(container, 'admin-beds');
    });
  });
}
