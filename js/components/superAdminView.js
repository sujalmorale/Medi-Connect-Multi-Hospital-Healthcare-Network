import { store } from '../store.js';

export function renderSuperAdminView(containerEl, activeTab) {
  const state = store.state;

  containerEl.innerHTML = `
    <!-- Super Admin Header Banner -->
    <div class="glass-card" style="padding: 1.75rem 2rem; margin-bottom: 2rem; background: linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%); border-color: rgba(124, 58, 237, 0.3);">
      <span class="badge badge-purple" style="margin-bottom: 0.5rem;"><i data-lucide="shield-check" style="width: 12px; height: 12px;"></i> Master Network Control</span>
      <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-main);">Super Admin Control Center</h2>
      <p style="color: var(--text-muted); font-size: 0.95rem;">
        Monitor cross-hospital operations, review hospital onboarding requests, and audit system-wide appointment flow.
      </p>
    </div>

    <!-- Active Tab Content -->
    <div id="super-admin-content">
      ${renderSuperTabContent(activeTab, state)}
    </div>
  `;

  attachSuperAdminListeners(containerEl);
  if (window.lucide) lucide.createIcons();
}

function renderSuperTabContent(activeTab, state) {
  if (activeTab === 'super-hospitals') {
    return renderAllHospitalsHTML(state);
  } else if (activeTab === 'super-analytics') {
    return renderSystemAnalyticsHTML(state);
  } else {
    return renderOnboardingApprovalsHTML(state);
  }
}

function renderOnboardingApprovalsHTML(state) {
  const pending = state.pendingHospitals;

  return `
    <div class="glass-card" style="padding: 1.75rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h3 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="check-square" style="color: var(--accent-purple);"></i> Pending Hospital Onboarding Requests (${pending.length})
          </h3>
          <p style="color: var(--text-muted); font-size: 0.88rem;">Review medical license documentation and approve hospitals to join MediConnect network.</p>
        </div>
      </div>

      ${pending.length === 0 ? `
        <div style="padding: 3rem; text-align: center; color: var(--text-muted);">
          <i data-lucide="check-circle-2" style="width: 48px; height: 48px; margin-bottom: 1rem; color: var(--accent-emerald); opacity: 0.8;"></i>
          <p style="font-size: 1.1rem; font-weight: 600;">All hospital onboarding applications processed!</p>
          <p style="font-size: 0.85rem;">No pending approvals in queue.</p>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${pending.map(hosp => `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.25rem;">
              
              <div style="flex: 1; min-width: 280px;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
                  <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main);">${hosp.name}</h4>
                  <span class="badge badge-amber">Pending License Audit</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;"><i data-lucide="map-pin" style="width: 12px; height: 12px; vertical-align: middle;"></i> ${hosp.location}</p>
                <div style="font-size: 0.8rem; color: var(--text-dim); display: flex; gap: 1.5rem; flex-wrap: wrap;">
                  <span>License #: <strong>${hosp.licenseNumber}</strong></span>
                  <span>Contact Person: <strong>${hosp.contactPerson} (${hosp.phone})</strong></span>
                  <span>Applied On: ${hosp.appliedDate}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div style="display: flex; gap: 0.75rem;">
                <button class="btn-secondary btn-reject-hosp" data-hosp-id="${hosp.id}" style="border-color: rgba(244,63,94,0.4); color: #fb7185;">
                  <i data-lucide="x" style="width: 16px; height: 16px;"></i> Reject Application
                </button>
                <button class="btn-primary btn-approve-hosp" data-hosp-id="${hosp.id}" style="background: var(--gradient-success);">
                  <i data-lucide="check" style="width: 16px; height: 16px;"></i> Approve Hospital
                </button>
              </div>

            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function renderAllHospitalsHTML(state) {
  return `
    <div class="glass-card" style="padding: 1.5rem;">
      <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 1.25rem;">Registered Network Hospitals (${state.hospitals.length})</h3>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-glass); color: var(--text-muted); font-size: 0.78rem; text-transform: uppercase;">
              <th style="padding: 0.75rem;">Hospital Name</th>
              <th style="padding: 0.75rem;">Location</th>
              <th style="padding: 0.75rem;">Total Beds (Gen/ICU/ER)</th>
              <th style="padding: 0.75rem;">ER & Ambulance Status</th>
              <th style="padding: 0.75rem;">Rating</th>
              <th style="padding: 0.75rem;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${state.hospitals.map(h => `
              <tr style="border-bottom: 1px solid var(--border-glass);">
                <td style="padding: 0.75rem;">
                  <strong style="color: var(--text-main); font-size: 0.95rem; display: block;">${h.name}</strong>
                  <span style="font-size: 0.75rem; color: var(--accent-cyan);">${h.badge}</span>
                </td>
                <td style="padding: 0.75rem; color: var(--text-muted);">${h.location}</td>
                <td style="padding: 0.75rem;">${h.beds.general.total} / ${h.beds.icu.total} / ${h.beds.emergency.total}</td>
                <td style="padding: 0.75rem;">
                  <span class="badge ${h.emergencyAvailable ? 'badge-emerald' : 'badge-rose'}">
                    ${h.emergencyAvailable ? '24/7 ER Ready' : 'ER Restricted'}
                  </span>
                </td>
                <td style="padding: 0.75rem;"><strong style="color: #f59e0b;">★ ${h.rating}</strong></td>
                <td style="padding: 0.75rem;"><span class="badge badge-emerald">Approved</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSystemAnalyticsHTML(state) {
  const totalBeds = state.hospitals.reduce((acc, h) => acc + h.beds.general.total + h.beds.icu.total + h.beds.emergency.total, 0);
  const availBeds = state.hospitals.reduce((acc, h) => acc + h.beds.general.available + h.beds.icu.available + h.beds.emergency.available, 0);

  return `
    <div class="grid-responsive-3" style="margin-bottom: 2rem;">
      <div class="glass-card" style="padding: 1.5rem;">
        <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Total Platform Hospitals</span>
        <div style="font-size: 2.2rem; font-weight: 800; color: var(--accent-blue); font-family: var(--font-heading); margin: 0.35rem 0;">${state.hospitals.length} Facilities</div>
        <span style="font-size: 0.75rem; color: var(--accent-emerald);">+${state.pendingHospitals.length} pending applications</span>
      </div>

      <div class="glass-card" style="padding: 1.5rem;">
        <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Total Network Doctors</span>
        <div style="font-size: 2.2rem; font-weight: 800; color: var(--accent-cyan); font-family: var(--font-heading); margin: 0.35rem 0;">${state.doctors.length} Doctors</div>
        <span style="font-size: 0.75rem; color: var(--text-muted);">Across 6 medical specialties</span>
      </div>

      <div class="glass-card" style="padding: 1.5rem;">
        <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Network Bed Occupancy</span>
        <div style="font-size: 2.2rem; font-weight: 800; color: var(--accent-emerald); font-family: var(--font-heading); margin: 0.35rem 0;">${availBeds} Available</div>
        <span style="font-size: 0.75rem; color: var(--text-muted);">Out of ${totalBeds} total bed infrastructure</span>
      </div>
    </div>
  `;
}

function attachSuperAdminListeners(container) {
  container.querySelectorAll('.btn-approve-hosp').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const hospId = e.currentTarget.dataset.hospId;
      store.approveHospital(hospId);
      renderSuperAdminView(container, 'super-approvals');
    });
  });

  container.querySelectorAll('.btn-reject-hosp').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const hospId = e.currentTarget.dataset.hospId;
      store.rejectHospital(hospId);
      renderSuperAdminView(container, 'super-approvals');
    });
  });
}
