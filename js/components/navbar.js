import { store } from '../store.js';

export function renderNavbar(containerEl, activeTab, onTabChange) {
  const currentRole = store.currentRole;
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';

  containerEl.innerHTML = `
    <header class="glass-card" style="border-radius: 0 0 var(--radius-md) var(--radius-md); margin-bottom: 2rem; position: sticky; top: 0; z-index: 100;">
      <div style="max-width: 1300px; margin: 0 auto; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        
        <!-- Brand Logo -->
        <div style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;" id="nav-brand">
          <div style="background: var(--gradient-brand); width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-glow-blue);">
            <i data-lucide="cross" style="color: white; width: 26px; height: 26px;"></i>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; background: linear-gradient(90deg, #38bdf8, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">MediConnect</span>
              <span class="live-dot" title="Live Real-Time Engine Active"></span>
            </div>
            <span style="font-size: 0.72rem; color: var(--text-muted); display: block; font-weight: 500;">Multi-Hospital Healthcare Network</span>
          </div>
        </div>

        <!-- Role Selector Switcher Bar -->
        <div style="background: var(--bg-glass); border: 1px solid var(--border-glass); padding: 4px; border-radius: var(--radius-full); display: flex; gap: 4px;">
          <button class="role-btn ${currentRole === 'patient' ? 'active-role' : ''}" data-role="patient" style="padding: 0.4rem 1rem; border-radius: var(--radius-full); border: none; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
            <i data-lucide="user" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></i> Patient
          </button>
          <button class="role-btn ${currentRole === 'hospAdmin' ? 'active-role' : ''}" data-role="hospAdmin" style="padding: 0.4rem 1rem; border-radius: var(--radius-full); border: none; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
            <i data-lucide="building-2" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></i> Hosp Admin
          </button>
          <button class="role-btn ${currentRole === 'doctor' ? 'active-role' : ''}" data-role="doctor" style="padding: 0.4rem 1rem; border-radius: var(--radius-full); border: none; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
            <i data-lucide="stethoscope" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></i> Doctor
          </button>
          <button class="role-btn ${currentRole === 'superAdmin' ? 'active-role' : ''}" data-role="superAdmin" style="padding: 0.4rem 1rem; border-radius: var(--radius-full); border: none; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
            <i data-lucide="shield-check" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></i> Super Admin
          </button>
        </div>

        <!-- Right Quick Actions (Emergency SOS + Theme Toggle) -->
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <button id="btn-emergency-quick" class="btn-emergency" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
            <i data-lucide="siren" style="width: 18px; height: 18px;"></i>
            <span>Emergency SOS</span>
          </button>

          <button id="btn-theme-toggle" class="btn-secondary" style="padding: 0.5rem; border-radius: 50%; width: 38px; height: 38px; justify-content: center;" title="Toggle Light/Dark Theme">
            <i data-lucide="${isLight ? 'moon' : 'sun'}" style="width: 18px; height: 18px;"></i>
          </button>
        </div>

      </div>

      <!-- Role-Specific Navigation Sub-Bar -->
      <div style="background: rgba(0, 0, 0, 0.2); border-top: 1px solid var(--border-glass); padding: 0.5rem 1.5rem;">
        <div style="max-width: 1300px; margin: 0 auto; display: flex; align-items: center; gap: 1.5rem; overflow-x: auto;">
          ${renderRoleNavLinks(currentRole, activeTab)}
        </div>
      </div>
    </header>
  `;

  // Apply active role style
  const roleStyles = document.createElement('style');
  roleStyles.id = 'role-custom-styles';
  roleStyles.innerHTML = `
    .active-role {
      background: var(--gradient-brand) !important;
      color: white !important;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
    }
    .role-btn {
      background: transparent;
      color: var(--text-muted);
    }
    .role-btn:hover:not(.active-role) {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.05);
    }
    .nav-link {
      color: var(--text-muted);
      font-size: 0.88rem;
      font-weight: 500;
      text-decoration: none;
      padding: 0.3rem 0.75rem;
      border-radius: var(--radius-sm);
      transition: all 0.2s ease;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      white-space: nowrap;
    }
    .nav-link:hover, .nav-link.active {
      color: var(--accent-cyan);
      background: rgba(6, 182, 212, 0.1);
    }
  `;
  if (!document.getElementById('role-custom-styles')) {
    document.head.appendChild(roleStyles);
  }

  // Attach Event Listeners
  containerEl.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const newRole = e.currentTarget.dataset.role;
      store.setRole(newRole);
    });
  });

  containerEl.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = e.currentTarget.dataset.tab;
      if (onTabChange) onTabChange(targetTab);
    });
  });

  document.getElementById('nav-brand')?.addEventListener('click', () => {
    if (onTabChange) onTabChange('hospitals');
  });

  document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    renderNavbar(containerEl, activeTab, onTabChange);
    lucide.createIcons();
  });

  document.getElementById('btn-emergency-quick')?.addEventListener('click', () => {
    if (onTabChange) onTabChange('emergency');
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

function renderRoleNavLinks(role, activeTab) {
  if (role === 'patient') {
    return `
      <a class="nav-link ${activeTab === 'hospitals' ? 'active' : ''}" data-tab="hospitals">
        <i data-lucide="building" style="width: 15px; height: 15px;"></i> Hospitals & Doctors
      </a>
      <a class="nav-link ${activeTab === 'ai-recommender' ? 'active' : ''}" data-tab="ai-recommender">
        <i data-lucide="sparkles" style="width: 15px; height: 15px;"></i> AI Doctor Advisor
      </a>
      <a class="nav-link ${activeTab === 'emergency' ? 'active' : ''}" data-tab="emergency">
        <i data-lucide="siren" style="width: 15px; height: 15px;"></i> Emergency Hospital Finder
      </a>
      <a class="nav-link ${activeTab === 'beds' ? 'active' : ''}" data-tab="beds">
        <i data-lucide="bed-double" style="width: 15px; height: 15px;"></i> Real-Time Beds
      </a>
      <a class="nav-link ${activeTab === 'my-appointments' ? 'active' : ''}" data-tab="my-appointments">
        <i data-lucide="ticket" style="width: 15px; height: 15px;"></i> My Tokens & Appointments
      </a>
    `;
  } else if (role === 'hospAdmin') {
    return `
      <a class="nav-link ${activeTab === 'admin-dash' ? 'active' : ''}" data-tab="admin-dash">
        <i data-lucide="layout-dashboard" style="width: 15px; height: 15px;"></i> Hospital Overview
      </a>
      <a class="nav-link ${activeTab === 'admin-doctors' ? 'active' : ''}" data-tab="admin-doctors">
        <i data-lucide="users" style="width: 15px; height: 15px;"></i> Doctors & Schedules
      </a>
      <a class="nav-link ${activeTab === 'admin-beds' ? 'active' : ''}" data-tab="admin-beds">
        <i data-lucide="bed" style="width: 15px; height: 15px;"></i> Bed Inventory Control
      </a>
      <a class="nav-link ${activeTab === 'admin-appointments' ? 'active' : ''}" data-tab="admin-appointments">
        <i data-lucide="calendar-check" style="width: 15px; height: 15px;"></i> Appointments & Records
      </a>
    `;
  } else if (role === 'doctor') {
    return `
      <a class="nav-link ${activeTab === 'doctor-dash' ? 'active' : ''}" data-tab="doctor-dash">
        <i data-lucide="calendar" style="width: 15px; height: 15px;"></i> Today's Consultations
      </a>
      <a class="nav-link ${activeTab === 'doctor-queue' ? 'active' : ''}" data-tab="doctor-queue">
        <i data-lucide="play-circle" style="width: 15px; height: 15px;"></i> Live Queue Controller
      </a>
      <a class="nav-link ${activeTab === 'doctor-slots' ? 'active' : ''}" data-tab="doctor-slots">
        <i data-lucide="clock" style="width: 15px; height: 15px;"></i> Availability & Duty Toggle
      </a>
    `;
  } else if (role === 'superAdmin') {
    return `
      <a class="nav-link ${activeTab === 'super-approvals' ? 'active' : ''}" data-tab="super-approvals">
        <i data-lucide="check-square" style="width: 15px; height: 15px;"></i> Hospital Onboarding Approvals
      </a>
      <a class="nav-link ${activeTab === 'super-hospitals' ? 'active' : ''}" data-tab="super-hospitals">
        <i data-lucide="building-2" style="width: 15px; height: 15px;"></i> All Hospitals Directory
      </a>
      <a class="nav-link ${activeTab === 'super-analytics' ? 'active' : ''}" data-tab="super-analytics">
        <i data-lucide="bar-chart-3" style="width: 15px; height: 15px;"></i> System Network Analytics
      </a>
    `;
  }
}
