import { store } from '../store.js';

export function renderPatientView(containerEl, activeTab, openBookingModal) {
  const state = store.state;

  if (activeTab === 'hospitals') {
    renderHospitalsAndDoctors(containerEl, state, openBookingModal);
  } else if (activeTab === 'ai-recommender') {
    renderAIRecommender(containerEl, state, openBookingModal);
  } else if (activeTab === 'emergency') {
    renderEmergencyFinder(containerEl, state, openBookingModal);
  } else if (activeTab === 'beds') {
    renderLiveBedTracker(containerEl, state);
  } else if (activeTab === 'my-appointments') {
    renderMyAppointments(containerEl, state);
  }
}

/**
 * 1. Hospitals & Doctors Catalog with Live Filters & Booking Trigger
 */
function renderHospitalsAndDoctors(containerEl, state, openBookingModal) {
  containerEl.innerHTML = `
    <!-- Hero Banner with Unified Search -->
    <div class="glass-card" style="padding: 2.5rem 2rem; margin-bottom: 2rem; background: linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(13, 148, 136, 0.15) 100%); border-color: rgba(37, 99, 235, 0.3);">
      <div style="max-width: 800px; margin: 0 auto; text-align: center;">
        <span class="badge badge-blue" style="margin-bottom: 1rem;"><i data-lucide="shield-check" style="width: 12px; height: 12px;"></i> Unified Multi-Hospital Platform</span>
        <h1 style="font-size: 2.25rem; font-weight: 800; margin-bottom: 0.75rem; background: linear-gradient(90deg, #ffffff, #93c5fd); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          Book Doctor Appointments & Check Live Bed Availability
        </h1>
        <p style="color: var(--text-muted); font-size: 1.05rem; margin-bottom: 1.75rem;">
          No need to visit multiple hospital websites. Search across premier hospitals, check live slot availability, and get instant digital tokens.
        </p>

        <!-- Search Inputs -->
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <div style="flex: 2; min-width: 260px; position: relative;">
            <i data-lucide="search" style="position: absolute; left: 14px; top: 14px; color: var(--text-muted); width: 18px; height: 18px;"></i>
            <input type="text" id="search-query" class="glass-input" style="padding-left: 2.75rem;" placeholder="Search Mumbai hospital, doctor (e.g. Dr. Shashank Joshi), specialty...">
          </div>
          <div style="flex: 1; min-width: 170px;">
            <select id="filter-area" class="glass-input">
              <option value="">All Mumbai Live Locations</option>
              <option value="Bandra">Bandra West</option>
              <option value="Andheri">Andheri West</option>
              <option value="South Mumbai">South Mumbai (Breach Candy)</option>
              <option value="Mulund">Mulund West</option>
              <option value="Girgaon">Girgaon / Grant Road</option>
              <option value="Powai">Powai</option>
              <option value="Vile Parle">Vile Parle West</option>
              <option value="Navi Mumbai">Navi Mumbai (Belapur & Uran)</option>
              <option value="Borivali">Borivali & Kandivali</option>
              <option value="Goregaon">Goregaon & Oshiwara</option>
              <option value="Thane">Thane & Vikhroli</option>
              <option value="Dadar">Dadar & Worli</option>
              <option value="Santacruz">Santacruz & Ghatkopar</option>
            </select>
          </div>
          <div style="flex: 1; min-width: 170px;">
            <select id="filter-department" class="glass-input">
              <option value="">All Specialties</option>
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
        </div>
      </div>
    </div>

    <!-- Quick Category Pills -->
    <div style="display: flex; gap: 0.75rem; margin-bottom: 2rem; overflow-x: auto; padding-bottom: 0.5rem;">
      <span style="color: var(--text-muted); font-size: 0.88rem; align-self: center; font-weight: 600;">Mumbai Locations:</span>
      <button class="pill-btn active" data-spec="" data-area="">All</button>
      <button class="pill-btn" data-spec="" data-area="Bandra"><i data-lucide="map-pin" style="width: 13px; height: 13px;"></i> Bandra</button>
      <button class="pill-btn" data-spec="" data-area="Andheri"><i data-lucide="map-pin" style="width: 13px; height: 13px;"></i> Andheri</button>
      <button class="pill-btn" data-spec="" data-area="South Mumbai"><i data-lucide="map-pin" style="width: 13px; height: 13px;"></i> South Mumbai</button>
      <button class="pill-btn" data-spec="" data-area="Mulund"><i data-lucide="map-pin" style="width: 13px; height: 13px;"></i> Mulund</button>
      <button class="pill-btn" data-spec="" data-area="Powai"><i data-lucide="map-pin" style="width: 13px; height: 13px;"></i> Powai</button>
      <button class="pill-btn" data-spec="" data-area="Vile Parle"><i data-lucide="map-pin" style="width: 13px; height: 13px;"></i> Vile Parle</button>
    </div>

    <!-- Multi-Hospital & Doctor Grid -->
    <h2 style="font-size: 1.5rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
      <span><i data-lucide="building" style="vertical-align: middle; color: var(--accent-blue);"></i> Registered Hospitals & Specialists</span>
      <span style="font-size: 0.88rem; color: var(--text-muted); font-weight: 400;">Showing ${state.hospitals.length} Verified Hospitals</span>
    </h2>

    <div class="grid-responsive-2" id="hospitals-list-container">
      ${renderHospitalCardsHTML(state.hospitals, state.doctors, openBookingModal)}
    </div>
  `;

  // Attach search listeners
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .pill-btn {
      background: var(--bg-glass);
      border: 1px solid var(--border-glass);
      color: var(--text-muted);
      padding: 0.4rem 0.9rem;
      border-radius: var(--radius-full);
      font-size: 0.82rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      white-space: nowrap;
      transition: all 0.2s ease;
    }
    .pill-btn:hover, .pill-btn.active {
      background: rgba(37, 99, 235, 0.2);
      border-color: var(--accent-blue);
      color: white;
    }
  `;
  containerEl.appendChild(styleEl);

  const filterInput = containerEl.querySelector('#search-query');
  const areaSelect = containerEl.querySelector('#filter-area');
  const deptSelect = containerEl.querySelector('#filter-department');
  const listContainer = containerEl.querySelector('#hospitals-list-container');

  function filterContent() {
    const query = filterInput.value.toLowerCase();
    const area = areaSelect.value.toLowerCase();
    const dept = deptSelect.value.toLowerCase();

    const filteredHospitals = state.hospitals.filter(hosp => {
      const nameMatch = hosp.name.toLowerCase().includes(query) || hosp.location.toLowerCase().includes(query) || hosp.area.toLowerCase().includes(query);
      const areaMatch = !area || hosp.location.toLowerCase().includes(area) || hosp.area.toLowerCase().includes(area);
      const deptMatch = !dept || hosp.departments.some(d => d.toLowerCase().includes(dept));
      const docMatch = state.doctors.some(d => d.hospitalId === hosp.id && (d.name.toLowerCase().includes(query) || d.specialty.toLowerCase().includes(query)));
      return (nameMatch || docMatch) && areaMatch && deptMatch;
    });

    listContainer.innerHTML = renderHospitalCardsHTML(filteredHospitals, state.doctors, openBookingModal);
    attachCardBookListeners(listContainer, openBookingModal);
    if (window.lucide) lucide.createIcons();
  }

  filterInput.addEventListener('input', filterContent);
  areaSelect.addEventListener('change', filterContent);
  deptSelect.addEventListener('change', filterContent);

  containerEl.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      containerEl.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const areaVal = e.currentTarget.dataset.area || '';
      const specVal = e.currentTarget.dataset.spec || '';
      areaSelect.value = areaVal;
      deptSelect.value = specVal;
      filterContent();
    });
  });

  attachCardBookListeners(containerEl, openBookingModal);
  if (window.lucide) lucide.createIcons();
}

function renderHospitalCardsHTML(hospitals, doctors, openBookingModal) {
  if (hospitals.length === 0) {
    return `
      <div class="glass-card" style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-muted);">
        <i data-lucide="search-x" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p style="font-size: 1.1rem; font-weight: 600;">No hospitals or doctors match your search filters.</p>
        <p style="font-size: 0.9rem;">Try clearing your search query or selecting a different specialty.</p>
      </div>
    `;
  }

  return hospitals.map(hosp => {
    const hospDoctors = doctors.filter(d => d.hospitalId === hosp.id);

    return `
      <div class="glass-card" style="display: flex; flex-direction: column; overflow: hidden;">
        <!-- Hospital Image Banner -->
        <div style="position: relative; height: 160px; overflow: hidden; background: #1e293b;">
          <img src="${hosp.image}" alt="${hosp.name}" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.85);" onError="this.src='https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80'" />
          <div style="position: absolute; top: 12px; left: 12px; display: flex; gap: 6px;">
            <span class="badge badge-emerald"><i data-lucide="check-circle" style="width: 10px; height: 10px;"></i> ${hosp.badge}</span>
            <span class="badge badge-blue"><i data-lucide="map-pin" style="width: 10px; height: 10px;"></i> ${hosp.distanceKm} km away</span>
          </div>
          <div style="position: absolute; bottom: 12px; right: 12px;">
            <span class="badge badge-amber" style="font-size: 0.85rem;"><i data-lucide="star" style="width: 12px; height: 12px; fill: #f59e0b;"></i> ${hosp.rating} (${hosp.reviewCount})</span>
          </div>
        </div>

        <!-- Hospital Info Body -->
        <div style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column;">
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; color: var(--text-main);">${hosp.name}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;"><i data-lucide="map-pin" style="width: 13px; height: 13px; vertical-align: middle;"></i> ${hosp.location}</p>

          <!-- Live Bed Summary Cards -->
          <div style="background: var(--bg-glass); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 0.75rem; display: flex; justify-content: space-around; margin-bottom: 1.25rem;">
            <div style="text-align: center;">
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">General Beds</span>
              <strong style="color: var(--accent-emerald); font-size: 1.1rem;">${hosp.beds.general.available}</strong>
              <span style="font-size: 0.7rem; color: var(--text-dim);"> / ${hosp.beds.general.total}</span>
            </div>
            <div style="width: 1px; background: var(--border-glass);"></div>
            <div style="text-align: center;">
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">ICU Beds</span>
              <strong style="color: ${hosp.beds.icu.available > 0 ? 'var(--accent-cyan)' : 'var(--accent-rose)'}; font-size: 1.1rem;">${hosp.beds.icu.available}</strong>
              <span style="font-size: 0.7rem; color: var(--text-dim);"> / ${hosp.beds.icu.total}</span>
            </div>
            <div style="width: 1px; background: var(--border-glass);"></div>
            <div style="text-align: center;">
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Emergency</span>
              <strong style="color: ${hosp.beds.emergency.available > 0 ? 'var(--accent-rose)' : 'var(--text-dim)'}; font-size: 1.1rem;">${hosp.beds.emergency.available}</strong>
              <span style="font-size: 0.7rem; color: var(--text-dim);"> / ${hosp.beds.emergency.total}</span>
            </div>
          </div>

          <!-- Doctors Roster List -->
          <h4 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--text-main);">Available Doctors (${hospDoctors.length}):</h4>
          
          <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; flex: 1;">
            ${hospDoctors.map(doc => `
              <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 0.85rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
                <div style="display: flex; align-items: flex-start; gap: 0.75rem; flex: 1; min-width: 240px;">
                  <img src="${doc.image}" alt="${doc.name}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-blue);" />
                  <div>
                    <strong style="font-size: 0.95rem; display: block; color: var(--text-main);">${doc.name}</strong>
                    <span style="font-size: 0.78rem; color: var(--accent-cyan); font-weight: 600;">${doc.specialty}</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">₹${doc.fee} Fee • ${doc.experience} exp</span>
                    ${doc.locationAddress ? `<span style="font-size: 0.72rem; color: #94a3b8; display: block; margin-top: 3px;"><i data-lucide="map-pin" style="width: 10px; height: 10px; vertical-align: middle;"></i> ${doc.locationAddress}</span>` : ''}
                    ${doc.contactPhone ? `<span style="font-size: 0.72rem; color: var(--accent-emerald); font-weight: 600; display: block; margin-top: 2px;"><i data-lucide="phone" style="width: 10px; height: 10px; vertical-align: middle;"></i> Ph: ${doc.contactPhone}</span>` : ''}
                  </div>
                </div>
                <button class="btn-primary btn-book-doc" data-hosp-id="${hosp.id}" data-doc-id="${doc.id}" style="padding: 0.45rem 0.9rem; font-size: 0.8rem; white-space: nowrap;">
                  Book Slot
                </button>
              </div>
            `).join('')}
          </div>

          <!-- Emergency Contact Strip -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); border-top: 1px solid var(--border-glass); padding-top: 0.75rem; margin-top: auto;">
            <span><i data-lucide="phone" style="width: 12px; height: 12px; vertical-align: middle;"></i> Ambulance: <strong style="color: var(--text-main);">${hosp.ambulanceContact}</strong></span>
            <span class="badge ${hosp.emergencyAvailable ? 'badge-emerald' : 'badge-rose'}">
              ${hosp.emergencyAvailable ? '24/7 ER Open' : 'ER Full'}
            </span>
          </div>

        </div>
      </div>
    `;
  }).join('');
}

function attachCardBookListeners(container, openBookingModal) {
  container.querySelectorAll('.btn-book-doc').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const hospId = e.currentTarget.dataset.hospId;
      const docId = e.currentTarget.dataset.docId;
      if (openBookingModal) openBookingModal(hospId, docId);
    });
  });
}

/**
 * 2. AI Doctor Recommendation (Symptom Checker)
 */
function renderAIRecommender(containerEl, state, openBookingModal) {
  containerEl.innerHTML = `
    <div class="glass-card" style="padding: 2.5rem 2rem; max-width: 900px; margin: 0 auto; border-color: rgba(139, 92, 246, 0.3); background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);">
      
      <div style="text-align: center; margin-bottom: 2rem;">
        <span class="badge badge-purple" style="margin-bottom: 0.75rem;"><i data-lucide="sparkles" style="width: 12px; height: 12px;"></i> AI Specialist Recommendation Engine</span>
        <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem;">Confused which doctor to visit?</h2>
        <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto;">
          Enter your current symptoms below. Our intelligent triage system will recommend the appropriate specialist and suggest available doctors across hospitals.
        </p>
      </div>

      <!-- Quick Symptom Badges Selector -->
      <div style="margin-bottom: 1.5rem;">
        <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.5rem;">Click common symptoms to add:</label>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;" id="symptom-quick-tags">
          <span class="sym-tag" data-tag="Fever">+ Fever</span>
          <span class="sym-tag" data-tag="Headache">+ Headache</span>
          <span class="sym-tag" data-tag="Body Pain">+ Body Pain</span>
          <span class="sym-tag" data-tag="Chest Pain">+ Chest Pain</span>
          <span class="sym-tag" data-tag="Breathlessness">+ Breathlessness</span>
          <span class="sym-tag" data-tag="Skin Rash">+ Skin Rash</span>
          <span class="sym-tag" data-tag="Stomach Ache">+ Stomach Ache</span>
          <span class="sym-tag" data-tag="Joint Pain">+ Joint Pain</span>
        </div>
      </div>

      <!-- Input Textarea & Button -->
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
        <input type="text" id="ai-symptom-input" class="glass-input" style="flex: 1; min-width: 280px; font-size: 1rem;" placeholder="e.g. Fever + Headache + Body Pain" value="Fever + Headache + Body Pain" />
        <button id="btn-analyze-symptoms" class="btn-primary" style="background: linear-gradient(135deg, #7c3aed, #2563eb); font-size: 1rem; padding: 0.75rem 1.75rem;">
          <i data-lucide="sparkles" style="width: 18px; height: 18px;"></i> Analyze & Recommend
        </button>
      </div>

      <!-- Result Card Container -->
      <div id="ai-result-container">
        <!-- Default Pre-Analyzed State for Fever + Headache + Body Pain -->
        ${renderAIResultHTML(store.recommendSpecialist("Fever + Headache + Body Pain"), openBookingModal)}
      </div>

    </div>
  `;

  const symStyles = document.createElement('style');
  symStyles.innerHTML = `
    .sym-tag {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-glass);
      color: var(--text-muted);
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .sym-tag:hover {
      background: rgba(139, 92, 246, 0.2);
      border-color: var(--accent-purple);
      color: white;
    }
  `;
  containerEl.appendChild(symStyles);

  const inputEl = containerEl.querySelector('#ai-symptom-input');
  const resultContainer = containerEl.querySelector('#ai-result-container');

  containerEl.querySelectorAll('.sym-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      const text = e.currentTarget.dataset.tag;
      if (!inputEl.value.includes(text)) {
        inputEl.value = inputEl.value ? `${inputEl.value} + ${text}` : text;
      }
    });
  });

  containerEl.querySelector('#btn-analyze-symptoms').addEventListener('click', () => {
    const query = inputEl.value.trim();
    if (!query) return;
    const res = store.recommendSpecialist(query);
    resultContainer.innerHTML = renderAIResultHTML(res, openBookingModal);
    attachCardBookListeners(resultContainer, openBookingModal);
    if (window.lucide) lucide.createIcons();
  });

  attachCardBookListeners(resultContainer, openBookingModal);
  if (window.lucide) lucide.createIcons();
}

function renderAIResultHTML(aiResult, openBookingModal) {
  if (!aiResult) return '';

  const { recommendation, matchingDoctors, matchConfidence } = aiResult;
  const isEmergency = recommendation.urgency.includes('Emergency');

  return `
    <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid ${isEmergency ? 'rgba(244, 63, 94, 0.4)' : 'rgba(139, 92, 246, 0.4)'}; border-radius: var(--radius-md); padding: 1.75rem; animation: fadeIn 0.3s ease-out;">
      
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-glass); padding-bottom: 1rem;">
        <div>
          <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Recommended Specialist</span>
          <h3 style="font-size: 1.6rem; font-weight: 800; color: ${isEmergency ? '#f43f5e' : '#a78bfa'}; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="${isEmergency ? 'alert-triangle' : 'stethoscope'}" style="width: 24px; height: 24px;"></i>
            ${recommendation.specialist}
          </h3>
        </div>
        <div style="text-align: right;">
          <span class="badge ${isEmergency ? 'badge-rose' : 'badge-emerald'}" style="margin-bottom: 4px;">
            Urgency: ${recommendation.urgency}
          </span>
          <span style="display: block; font-size: 0.78rem; color: var(--text-muted);">AI Confidence: ${matchConfidence}% Match</span>
        </div>
      </div>

      <p style="color: var(--text-main); font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.6;">
        <strong>Clinical Guidance:</strong> ${recommendation.advice}
      </p>

      <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-main);">
        Suggested ${recommendation.specialist} Doctors Across Hospitals:
      </h4>

      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${matchingDoctors.map(doc => {
          const hosp = store.state.hospitals.find(h => h.id === doc.hospitalId);
          return `
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <img src="${doc.image}" alt="${doc.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-purple);" />
                <div>
                  <h5 style="font-size: 1rem; font-weight: 700; color: var(--text-main);">${doc.name}</h5>
                  <span style="font-size: 0.82rem; color: var(--text-muted);"><i data-lucide="building" style="width: 12px; height: 12px; vertical-align: middle;"></i> ${hosp ? hosp.name : 'Partner Hospital'} (${hosp ? hosp.distanceKm : 3} km)</span>
                  <div style="font-size: 0.78rem; color: var(--accent-emerald); font-weight: 600; margin-top: 2px;">
                    Next Available: ${doc.availableSlots[0] || '10:00 AM Today'} • ₹${doc.fee}
                  </div>
                </div>
              </div>

              <button class="btn-primary btn-book-doc" data-hosp-id="${doc.hospitalId}" data-doc-id="${doc.id}" style="padding: 0.5rem 1.1rem; font-size: 0.85rem;">
                <i data-lucide="calendar" style="width: 14px; height: 14px;"></i> Book Slot Now
              </button>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}

/**
 * 3. Emergency Hospital Finder Dashboard
 */
function renderEmergencyFinder(containerEl, state, openBookingModal) {
  containerEl.innerHTML = `
    <div class="glass-card" style="padding: 2rem; margin-bottom: 2rem; border-color: rgba(244, 63, 94, 0.4); background: linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%);">
      
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
        <div>
          <span class="badge badge-rose" style="margin-bottom: 0.5rem;"><i data-lucide="siren" style="width: 12px; height: 12px;"></i> Live Emergency Radar</span>
          <h2 style="font-size: 1.8rem; font-weight: 800; color: #f43f5e;">Emergency Hospital Finder</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem;">Nearby ER facilities sorted by distance, real-time ICU beds, and ambulance availability.</p>
        </div>

        <div style="background: rgba(244, 63, 94, 0.2); border: 1px solid rgba(244, 63, 94, 0.4); padding: 0.75rem 1.25rem; border-radius: var(--radius-md); text-align: center;">
          <span style="font-size: 0.75rem; color: #fca5a5; display: block; font-weight: 600;">24/7 NATIONAL EMERGENCY HELPLINE</span>
          <strong style="font-size: 1.4rem; color: white; font-family: var(--font-heading);">☎ 108 / +91 98765 11223</strong>
        </div>
      </div>

      <!-- Quick Emergency Filters -->
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
        <label class="glass-card" style="padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" id="chk-icu-available" checked style="accent-color: var(--accent-rose);" />
          <span style="font-size: 0.85rem; font-weight: 600;">ICU Beds Available Only</span>
        </label>

        <label class="glass-card" style="padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" id="chk-ambulance-available" checked style="accent-color: var(--accent-rose);" />
          <span style="font-size: 0.85rem; font-weight: 600;">Ambulance Service Ready</span>
        </label>
      </div>

      <!-- Emergency Hospital List -->
      <div class="grid-responsive-3" id="emergency-hospitals-grid">
        ${renderEmergencyCardsHTML(state.hospitals, openBookingModal)}
      </div>

    </div>
  `;

  const icuChk = containerEl.querySelector('#chk-icu-available');
  const ambChk = containerEl.querySelector('#chk-ambulance-available');
  const grid = containerEl.querySelector('#emergency-hospitals-grid');

  function updateEmergencyGrid() {
    const icuOnly = icuChk.checked;
    const ambOnly = ambChk.checked;

    const filtered = state.hospitals.filter(h => {
      if (!h.emergencyAvailable) return false;
      if (icuOnly && h.beds.icu.available <= 0) return false;
      if (ambOnly && !h.ambulanceAvailable) return false;
      return true;
    });

    grid.innerHTML = renderEmergencyCardsHTML(filtered, openBookingModal);
    attachEmergencyActionListeners(grid, openBookingModal);
    if (window.lucide) lucide.createIcons();
  }

  icuChk.addEventListener('change', updateEmergencyGrid);
  ambChk.addEventListener('change', updateEmergencyGrid);
  attachEmergencyActionListeners(grid, openBookingModal);
  if (window.lucide) lucide.createIcons();
}

function renderEmergencyCardsHTML(hospitals, openBookingModal) {
  if (hospitals.length === 0) {
    return `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;">No emergency facilities matching current criteria.</div>`;
  }

  return hospitals.map(hosp => `
    <div class="glass-card" style="padding: 1.5rem; border-color: rgba(244, 63, 94, 0.3); display: flex; flex-direction: column;">
      
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main);">${hosp.name}</h3>
          <span style="font-size: 0.8rem; color: var(--text-muted);"><i data-lucide="navigation" style="width: 12px; height: 12px; vertical-align: middle;"></i> ${hosp.distanceKm} km away • ${hosp.location}</span>
        </div>
        <span class="live-dot live-dot-red"></span>
      </div>

      <!-- Emergency Metrics -->
      <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: var(--radius-sm); padding: 0.75rem; margin-bottom: 1rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; text-align: center;">
        <div>
          <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">ICU Beds</span>
          <strong style="color: ${hosp.beds.icu.available > 0 ? '#38bdf8' : '#f43f5e'}; font-size: 1.1rem;">${hosp.beds.icu.available}</strong>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">ER Beds</span>
          <strong style="color: #f43f5e; font-size: 1.1rem;">${hosp.beds.emergency.available}</strong>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">Ambulance</span>
          <strong style="color: ${hosp.ambulanceAvailable ? '#34d399' : '#f43f5e'}; font-size: 0.85rem; display: block; margin-top: 3px;">
            ${hosp.ambulanceAvailable ? 'Ready' : 'Busy'}
          </strong>
        </div>
      </div>

      <!-- Call Ambulance Button & Emergency Booking -->
      <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: auto;">
        <a href="tel:${hosp.ambulanceContact}" class="btn-emergency" style="justify-content: center; width: 100%; text-decoration: none; font-size: 0.88rem; padding: 0.6rem;">
          <i data-lucide="phone-call" style="width: 16px; height: 16px;"></i> Call Ambulance (${hosp.ambulanceContact})
        </a>
        <button class="btn-secondary btn-emergency-book" data-hosp-id="${hosp.id}" style="justify-content: center; font-size: 0.82rem; padding: 0.5rem;">
          <i data-lucide="zap" style="width: 14px; height: 14px; color: var(--accent-amber);"></i> Book Emergency Token
        </button>
      </div>

    </div>
  `).join('');
}

function attachEmergencyActionListeners(container, openBookingModal) {
  container.querySelectorAll('.btn-emergency-book').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const hospId = e.currentTarget.dataset.hospId;
      const docs = store.state.doctors.filter(d => d.hospitalId === hospId);
      const emergencyDoc = docs.find(d => d.status === 'Emergency Duty') || docs[0];
      if (openBookingModal && emergencyDoc) {
        openBookingModal(hospId, emergencyDoc.id, 'Emergency');
      }
    });
  });
}

/**
 * 4. Real-Time Hospital Bed Availability Dashboard
 */
function renderLiveBedTracker(containerEl, state) {
  containerEl.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.8rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="bed-double" style="color: var(--accent-cyan);"></i> Live Hospital Bed Availability Dashboard
          </h2>
          <p style="color: var(--text-muted); font-size: 0.92rem;">
            Real-time synchronization across all registered hospitals. Updates instantly when hospital admins adjust inventory.
          </p>
        </div>
        <span class="badge badge-emerald" style="padding: 0.5rem 1rem; font-size: 0.85rem;"><span class="live-dot"></span> Live Sync Enabled</span>
      </div>

      <!-- Beds Grid -->
      <div class="grid-responsive-2">
        ${state.hospitals.map(hosp => `
          <div class="glass-card" style="padding: 1.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
              <div>
                <h3 style="font-size: 1.25rem; font-weight: 700;">${hosp.name}</h3>
                <span style="font-size: 0.82rem; color: var(--text-muted);"><i data-lucide="map-pin" style="width: 12px; height: 12px; vertical-align: middle;"></i> ${hosp.location}</span>
              </div>
              <span class="badge badge-blue">${hosp.distanceKm} km</span>
            </div>

            <!-- Beds Progress Bars -->
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              
              <!-- General Beds -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem;">
                  <span style="font-weight: 600; color: var(--text-main);">General Ward Beds</span>
                  <span><strong style="color: var(--accent-emerald);">${hosp.beds.general.available} Available</strong> / ${hosp.beds.general.total} Total</span>
                </div>
                <div style="height: 10px; background: rgba(255,255,255,0.06); border-radius: var(--radius-full); overflow: hidden;">
                  <div style="height: 100%; width: ${(hosp.beds.general.available / hosp.beds.general.total) * 100}%; background: var(--gradient-success); transition: width 0.4s ease;"></div>
                </div>
              </div>

              <!-- ICU Beds -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem;">
                  <span style="font-weight: 600; color: var(--text-main);">ICU Beds</span>
                  <span><strong style="color: ${hosp.beds.icu.available > 0 ? 'var(--accent-cyan)' : 'var(--accent-rose)'};">${hosp.beds.icu.available} Available</strong> / ${hosp.beds.icu.total} Total</span>
                </div>
                <div style="height: 10px; background: rgba(255,255,255,0.06); border-radius: var(--radius-full); overflow: hidden;">
                  <div style="height: 100%; width: ${(hosp.beds.icu.available / hosp.beds.icu.total) * 100}%; background: linear-gradient(90deg, #06b6d4, #3b82f6); transition: width 0.4s ease;"></div>
                </div>
              </div>

              <!-- Emergency Beds -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem;">
                  <span style="font-weight: 600; color: var(--text-main);">Emergency Trauma Beds</span>
                  <span><strong style="color: ${hosp.beds.emergency.available > 0 ? 'var(--accent-rose)' : 'var(--text-dim)'};">${hosp.beds.emergency.available} Available</strong> / ${hosp.beds.emergency.total} Total</span>
                </div>
                <div style="height: 10px; background: rgba(255,255,255,0.06); border-radius: var(--radius-full); overflow: hidden;">
                  <div style="height: 100%; width: ${(hosp.beds.emergency.available / hosp.beds.emergency.total) * 100}%; background: var(--gradient-emergency); transition: width 0.4s ease;"></div>
                </div>
              </div>

            </div>

          </div>
        `).join('')}
      </div>

    </div>
  `;
  if (window.lucide) lucide.createIcons();
}

/**
 * 5. My Tokens & Appointments Dashboard
 */
function renderMyAppointments(containerEl, state) {
  const appointments = state.appointments;

  containerEl.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <i data-lucide="ticket" style="color: var(--accent-blue);"></i> My Digital Tokens & Appointments
      </h2>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Track your real-time token position, queue status, and appointment details.</p>

      ${appointments.length === 0 ? `
        <div class="glass-card" style="padding: 3rem; text-align: center; color: var(--text-muted);">
          <i data-lucide="calendar-x" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;"></i>
          <p style="font-size: 1.1rem; font-weight: 600;">No active appointments found.</p>
          <p style="font-size: 0.9rem;">Book a doctor slot from the Hospitals directory to get your digital token.</p>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${appointments.map(apt => {
            const queue = state.queueState[apt.doctorId];
            const isCurrentlyServing = queue && queue.currentlyServingToken === apt.tokenNo;

            return `
              <div class="glass-card" style="padding: 1.5rem; border-color: ${isCurrentlyServing ? 'var(--accent-emerald)' : 'var(--border-glass)'};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                  
                  <!-- Token Display Box -->
                  <div class="token-card" style="min-width: 140px; text-align: center; padding: 1rem;">
                    <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Digital Token</span>
                    <div class="token-number">${apt.tokenNo}</div>
                    <span class="badge ${apt.type === 'Emergency' ? 'badge-rose' : 'badge-blue'}" style="margin-top: 4px; font-size: 0.7rem;">
                      ${apt.type}
                    </span>
                  </div>

                  <!-- Details -->
                  <div style="flex: 1; min-width: 250px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                      <div>
                        <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-main);">${apt.doctorName}</h3>
                        <span style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 600;">${apt.specialty}</span>
                      </div>
                      <span class="badge ${getStatusBadgeClass(apt.status)}">${apt.status}</span>
                    </div>

                    <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.5rem;"><i data-lucide="building" style="width: 13px; height: 13px; vertical-align: middle;"></i> ${apt.hospitalName}</p>
                    <p style="font-size: 0.85rem; color: var(--text-main);"><i data-lucide="clock" style="width: 13px; height: 13px; vertical-align: middle;"></i> Slot: <strong>${apt.timeSlot}</strong> (${apt.date})</p>
                    <p style="font-size: 0.82rem; color: var(--text-dim); margin-top: 4px;">Patient: ${apt.patientName} (${apt.patientAge}y, ${apt.patientGender}) • Symptom: ${apt.symptom}</p>
                  </div>

                  <!-- Real-Time Queue Tracker Status Box -->
                  <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 1rem; min-width: 220px; text-align: center;">
                    <span style="font-size: 0.75rem; color: var(--text-muted); display: block; font-weight: 600;">LIVE QUEUE STATUS</span>
                    
                    <div style="margin: 0.5rem 0;">
                      <span style="font-size: 0.8rem; color: var(--text-muted);">Currently Serving Token:</span>
                      <strong style="font-size: 1.3rem; color: var(--accent-emerald); display: block;">${queue ? queue.currentlyServingToken : 'A-18'}</strong>
                    </div>

                    ${isCurrentlyServing ? `
                      <span class="badge badge-emerald" style="animation: pulseLive 1.5s infinite;"><i data-lucide="bell" style="width: 12px; height: 12px;"></i> YOUR TURN! Proceed to Consultation Room</span>
                    ` : `
                      <span style="font-size: 0.78rem; color: var(--text-muted);">Est. Waiting Time: ~15 mins</span>
                    `}
                  </div>

                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
  if (window.lucide) lucide.createIcons();
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
