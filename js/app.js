import { store } from './store.js';
import { renderNavbar } from './components/navbar.js';
import { renderPatientView } from './components/patientView.js';
import { renderHospAdminView } from './components/hospAdminView.js';
import { renderDoctorView } from './components/doctorView.js';
import { renderSuperAdminView } from './components/superAdminView.js';
import { openBookingModal } from './components/bookingModal.js';

let activeTab = 'hospitals';

function initApp() {
  const headerContainer = document.getElementById('navbar-root');
  const mainContainer = document.getElementById('main-content-root');

  function handleTabChange(newTab) {
    activeTab = newTab;
    render();
  }

  window.onNavigateTab = handleTabChange;

  function render() {
    const currentRole = store.currentRole;

    // Sanity check active tab per role
    if (currentRole === 'patient' && !['hospitals', 'ai-recommender', 'emergency', 'beds', 'my-appointments'].includes(activeTab)) {
      activeTab = 'hospitals';
    } else if (currentRole === 'hospAdmin' && !['admin-dash', 'admin-doctors', 'admin-beds', 'admin-appointments'].includes(activeTab)) {
      activeTab = 'admin-dash';
    } else if (currentRole === 'doctor' && !['doctor-dash', 'doctor-queue', 'doctor-slots'].includes(activeTab)) {
      activeTab = 'doctor-dash';
    } else if (currentRole === 'superAdmin' && !['super-approvals', 'super-hospitals', 'super-analytics'].includes(activeTab)) {
      activeTab = 'super-approvals';
    }

    // Render Navigation Header
    renderNavbar(headerContainer, activeTab, handleTabChange);

    // Render Main View according to role
    if (currentRole === 'patient') {
      renderPatientView(mainContainer, activeTab, openBookingModal);
    } else if (currentRole === 'hospAdmin') {
      renderHospAdminView(mainContainer, activeTab);
    } else if (currentRole === 'doctor') {
      renderDoctorView(mainContainer, activeTab);
    } else if (currentRole === 'superAdmin') {
      renderSuperAdminView(mainContainer, activeTab);
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // Subscribe to reactive store changes
  store.subscribe(() => {
    render();
  });

  // Initial render
  render();
}

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
