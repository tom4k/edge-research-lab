const STORAGE_KEY = 'edgesys-lab-data-v1';
const AUTH_KEY = 'edgesys-admin-auth';
const uid = () => (globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);

const seedData = {
  settings: {
    labName: 'EdgeSys Research Lab',
    shortName: 'EdgeSys Lab',
    subtitle: 'Intelligent Distributed Computing',
    tagline: 'Research beyond the cloud.',
    heroTitle: 'Building intelligence at the edge of the network.',
    heroDescription: 'We design adaptive, efficient, and dependable computing systems spanning devices, vehicles, UAVs, edge servers, and the cloud.',
    description: 'Advancing edge intelligence, distributed systems, and dependable computing.',
    email: 'edgesys@example.edu',
    phone: '+91 00000 00000',
    location: 'Department of Computer Science and Engineering, Your Institution',
    website: 'https://example.edu'
  },
  stats: [
    { value: '48+', label: 'Peer-reviewed publications' },
    { value: '12', label: 'Active researchers' },
    { value: '9', label: 'Research projects' },
    { value: '6', label: 'Academic and industry partners' }
  ],
  research: [
    { id: uid(), title: 'Edge Intelligence', icon: 'EI', description: 'Learning, inference, and decision-making close to data sources under latency, energy, and resource constraints.', tags: ['TinyML', 'Federated Learning', 'Edge AI'] },
    { id: uid(), title: 'Fog & Distributed Computing', icon: 'FD', description: 'Scalable orchestration across heterogeneous compute nodes with resilience, locality, and elastic resource management.', tags: ['Scheduling', 'Consensus', 'Resilience'] },
    { id: uid(), title: 'Vehicular Edge Computing', icon: 'VE', description: 'Low-latency service provisioning for connected and autonomous mobility using roadside and airborne infrastructure.', tags: ['IoV', 'Mobility', 'V2X'] },
    { id: uid(), title: 'Resource Orchestration', icon: 'RO', description: 'Optimization and reinforcement learning for placement, migration, admission control, and workload balancing.', tags: ['DRL', 'Optimization', 'Placement'] },
    { id: uid(), title: 'UAV-Assisted Computing', icon: 'UA', description: 'Lifetime-aware deployment of aerial edge servers for transient demand, sparse coverage, and emergency response.', tags: ['UAV', 'Energy', 'Coverage'] },
    { id: uid(), title: 'Cloud–Edge Systems', icon: 'CE', description: 'End-to-end architectures that coordinate cloud-scale analytics with responsive and privacy-aware edge services.', tags: ['Cloud', 'Kubernetes', 'MLOps'] }
  ],
  people: [
    { id: uid(), name: 'Dr. Ananya Rao', role: 'Lab Director', group: 'Faculty', bio: 'Leads research in distributed optimization, edge intelligence, and dependable computing.', interests: 'Edge computing, distributed systems, reinforcement learning', email: 'ananya.rao@example.edu', image: '' },
    { id: uid(), name: 'Arjun Menon', role: 'Research Scholar', group: 'Researchers', bio: 'Works on UAV-assisted vehicular edge computing and service orchestration.', interests: 'VEC, UAV computing, Lyapunov optimization', email: 'arjun.menon@example.edu', image: '' },
    { id: uid(), name: 'Nisha Thomas', role: 'Research Scholar', group: 'Researchers', bio: 'Studies privacy-preserving collaborative learning across heterogeneous edge devices.', interests: 'Federated learning, privacy, TinyML', email: 'nisha.thomas@example.edu', image: '' },
    { id: uid(), name: 'Rahul Das', role: 'Project Associate', group: 'Project Staff', bio: 'Builds testbeds for cloud–edge orchestration, observability, and model serving.', interests: 'Kubernetes, MLOps, distributed platforms', email: 'rahul.das@example.edu', image: '' },
    { id: uid(), name: 'Meera Iyer', role: 'Graduate Researcher', group: 'Students', bio: 'Explores adaptive placement strategies for latency-sensitive IoT applications.', interests: 'IoT, service placement, multi-objective optimization', email: 'meera.iyer@example.edu', image: '' },
    { id: uid(), name: 'Kevin Joseph', role: 'Alumnus', group: 'Alumni', bio: 'Former lab member working on resilient distributed infrastructure.', interests: 'Fault tolerance, distributed storage', email: 'kevin.joseph@example.edu', image: '' }
  ],
  publications: [
    { id: uid(), title: 'Online UAV Lifetime-Aware Service Provisioning and Orchestration in Vehicular Edge Computing', authors: 'A. Menon, A. Rao', venue: 'Journal manuscript', year: '2026', type: 'Journal', doi: '', featured: true },
    { id: uid(), title: 'Adaptive Service Placement for Heterogeneous Edge Environments using Reinforcement Learning', authors: 'N. Thomas, A. Rao', venue: 'International Conference on Distributed Computing Systems', year: '2025', type: 'Conference', doi: '10.0000/example.2025.001', featured: true },
    { id: uid(), title: 'Workload-Aware Orchestration across Cloud and Edge Resources', authors: 'R. Das, M. Iyer, A. Rao', venue: 'Future Generation Computer Systems', year: '2025', type: 'Journal', doi: '10.0000/example.2025.002', featured: false },
    { id: uid(), title: 'Energy-Efficient Inference on Resource-Constrained Edge Devices', authors: 'M. Iyer, N. Thomas', venue: 'IEEE Edge Computing Workshop', year: '2024', type: 'Conference', doi: '', featured: false }
  ],
  projects: [
    { id: uid(), title: 'Lifetime-Aware UAV Edge Orchestration', summary: 'Dynamic deployment and migration strategies for aerial edge servers under finite energy and mobility constraints.', status: 'Ongoing', lead: 'Dr. Ananya Rao', funding: 'Institutional Research Grant', start: '2025', end: '2027', tags: ['UAV', 'VEC', 'Optimization'] },
    { id: uid(), title: 'Federated Intelligence for Edge IoT', summary: 'Privacy-preserving collaborative learning for heterogeneous and intermittently connected IoT devices.', status: 'Ongoing', lead: 'Dr. Ananya Rao', funding: 'National Research Programme', start: '2024', end: '2027', tags: ['Federated Learning', 'IoT'] },
    { id: uid(), title: 'Cloud–Edge MLOps Testbed', summary: 'A reproducible platform for training, deploying, monitoring, and updating ML models across edge clusters.', status: 'Completed', lead: 'Rahul Das', funding: 'Lab Infrastructure Grant', start: '2023', end: '2025', tags: ['MLOps', 'Kubernetes'] }
  ],
  news: [
    { id: uid(), title: 'New edge orchestration testbed commissioned', date: '2026-06-18', category: 'Lab Update', summary: 'The lab has expanded its experimental infrastructure with edge boards, GPU nodes, and network emulation facilities.' },
    { id: uid(), title: 'Research scholar presents work on vehicular edge computing', date: '2026-05-03', category: 'Presentation', summary: 'The work examines service placement and migration across fixed and aerial edge servers.' },
    { id: uid(), title: 'Applications invited for student research internships', date: '2026-04-12', category: 'Opportunity', summary: 'Openings are available in edge AI, distributed systems, and reinforcement learning.' }
  ]
};

let data = loadData();
let adminSection = 'dashboard';
let editing = null;

const main = document.getElementById('main-content');
const nav = document.getElementById('primary-nav');
const menuToggle = document.getElementById('menu-toggle');

function cloneSeed() {
  return JSON.parse(JSON.stringify(seedData));
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

function saveData(message = 'Changes saved') {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  syncBranding();
  toast(message);
}

function syncBranding() {
  const s = data.settings;
  document.title = s.labName;
  document.getElementById('brand-name').textContent = s.shortName;
  document.getElementById('brand-subtitle').textContent = s.subtitle;
  document.getElementById('footer-name').textContent = s.shortName;
  document.getElementById('footer-description').textContent = s.description;
  document.getElementById('footer-email').textContent = s.email;
  document.getElementById('footer-email').href = `mailto:${s.email}`;
  document.getElementById('footer-location').textContent = s.location;
  document.getElementById('copyright-name').textContent = s.labName;
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'RL';
}

function toast(message) {
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  document.getElementById('toast-container').append(node);
  setTimeout(() => node.remove(), 3200);
}

function setActiveRoute(route) {
  nav.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.dataset.route === route));
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

function route() {
  const hash = location.hash.replace('#', '') || 'home';
  const [page] = hash.split('/');
  setActiveRoute(page);
  if (page === 'home') renderHome();
  else if (page === 'research') renderResearch();
  else if (page === 'people') renderPeople();
  else if (page === 'publications') renderPublications();
  else if (page === 'projects') renderProjects();
  else if (page === 'news') renderNews();
  else if (page === 'contact') renderContact();
  else if (page === 'admin') renderAdmin();
  else renderNotFound();
  window.scrollTo({ top: 0, behavior: 'auto' });
  requestAnimationFrame(activateReveals);
}

function pageHeading(eyebrow, title, text) {
  return `<section class="page-heading"><span class="eyebrow">${escapeHTML(eyebrow)}</span><h1>${escapeHTML(title)}</h1><p>${escapeHTML(text)}</p></section>`;
}

function renderHome() {
  const s = data.settings;
  main.innerHTML = `
    <div class="page">
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">${escapeHTML(s.subtitle)}</span>
          <h1>${escapeHTML(s.heroTitle).replace('edge', '<span>edge</span>')}</h1>
          <p>${escapeHTML(s.heroDescription)}</p>
          <div class="hero-actions">
            <a class="button" href="#research">Explore our research</a>
            <a class="button button-secondary" href="#publications">View publications</a>
          </div>
          <div class="hero-note"><span>Low-latency systems</span><span>Resource-efficient intelligence</span><span>Real-world testbeds</span></div>
        </div>
        <div class="hero-visual" aria-label="Animated edge computing network">
          <div class="network-orb">
            <div class="orb-core">EDGE</div>
            <div class="node">DEVICE</div><div class="node">UAV</div><div class="node">CLOUD</div><div class="node">V2X</div>
            <span class="connection c1"></span><span class="connection c2"></span><span class="connection c3"></span><span class="connection c4"></span>
          </div>
          <div class="hero-chip a">Adaptive orchestration</div><div class="hero-chip b">Distributed intelligence</div>
        </div>
      </section>

      <section class="section section-tight">
        <div class="stats-grid">${data.stats.map(x => `<div class="stat-card reveal"><strong>${escapeHTML(x.value)}</strong><span>${escapeHTML(x.label)}</span></div>`).join('')}</div>
      </section>

      <section class="section">
        <div class="section-heading reveal"><div><span class="eyebrow">Research themes</span><h2>Systems that respond, adapt, and scale.</h2><p>Our work connects algorithm design with realistic computing environments, mobility patterns, energy limits, and deployment constraints.</p></div><a class="button button-outline" href="#research">All research areas</a></div>
        <div class="grid grid-3">${data.research.slice(0, 6).map(researchCard).join('')}</div>
      </section>

      <section class="section section-dark">
        <div class="section-heading reveal"><div><span class="eyebrow">Featured work</span><h2>From foundational models to deployable platforms.</h2><p>We combine optimization, reinforcement learning, systems engineering, and empirical evaluation.</p></div></div>
        <div class="grid grid-3">${data.projects.slice(0, 3).map((p, i) => projectCard(p, i)).join('')}</div>
      </section>

      <section class="section">
        <div class="section-heading reveal"><div><span class="eyebrow">Latest publications</span><h2>Recent research outputs.</h2></div><a class="button button-outline" href="#publications">Publication archive</a></div>
        <div>${data.publications.slice(0, 3).map(publicationItem).join('')}</div>
      </section>

      <section class="section section-tight">
        <div class="card reveal" style="padding:42px; background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 12%,var(--surface)),color-mix(in srgb,var(--accent) 10%,var(--surface)));">
          <span class="eyebrow">Collaborate</span><h2 style="font-size:clamp(2rem,5vw,4rem);margin:0;max-width:850px;letter-spacing:-.05em;line-height:1.05;">Interested in edge intelligence, distributed systems, or joint research?</h2><p style="max-width:650px;margin-top:16px;">We welcome academic collaborations, student researchers, research internships, and industry-supported projects.</p><a class="button" href="#contact" style="margin-top:20px;">Start a conversation</a>
        </div>
      </section>
    </div>`;
}

function researchCard(item) {
  return `<article class="card reveal"><div class="card-icon">${escapeHTML(item.icon || 'R')}</div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p><div class="card-meta">${(item.tags || []).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('')}</div></article>`;
}

function renderResearch() {
  main.innerHTML = `<div class="page">${pageHeading('Research', 'Computing across the continuum.', 'Our research spans intelligent edge systems, distributed platforms, mobility-aware computing, and resource orchestration.')}
    <section class="section"><div class="grid grid-3">${data.research.map(researchCard).join('')}</div></section>
    <section class="section section-dark"><div class="section-heading"><div><span class="eyebrow">Methodology</span><h2>Rigorous models. Practical systems.</h2><p>We formulate constrained optimization problems, design online and learning-based algorithms, develop testbeds, and evaluate methods using real workloads and mobility traces.</p></div></div><div class="grid grid-4">${['System modelling','Algorithm design','Prototype development','Empirical evaluation'].map((x,i)=>`<div class="card reveal"><div class="card-icon">0${i+1}</div><h3>${x}</h3><p>${['Translate real deployment constraints into measurable objectives and formal decision models.','Develop optimization, heuristic, and reinforcement-learning methods with clear baselines.','Implement reproducible platforms spanning edge boards, servers, containers, and network emulators.','Measure latency, energy, utilization, service quality, scalability, and robustness.'][i]}</p></div>`).join('')}</div></section>
  </div>`;
}

function personCard(p) {
  const visual = p.image ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy">` : `<div class="avatar-fallback">${initials(p.name)}</div>`;
  return `<article class="card people-card reveal" data-group="${escapeHTML(p.group)}"><div class="person-visual">${visual}</div><div class="person-body"><div class="person-role">${escapeHTML(p.group)} · ${escapeHTML(p.role)}</div><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.bio)}</p><div class="card-meta">${String(p.interests || '').split(',').filter(Boolean).slice(0,3).map(x=>`<span class="tag">${escapeHTML(x.trim())}</span>`).join('')}</div><a class="card-link" href="mailto:${escapeHTML(p.email)}">${escapeHTML(p.email)}</a></div></article>`;
}

function renderPeople() {
  const groups = ['All', ...new Set(data.people.map(p => p.group))];
  main.innerHTML = `<div class="page">${pageHeading('People', 'A multidisciplinary research community.', 'Meet the faculty, research scholars, project staff, students, alumni, and collaborators who shape the lab.')}
    <section class="section"><div class="toolbar"><input class="input" id="people-search" type="search" placeholder="Search people or interests"><select class="select" id="people-group">${groups.map(g=>`<option>${escapeHTML(g)}</option>`).join('')}</select></div><div class="grid grid-3" id="people-grid">${data.people.map(personCard).join('')}</div></section></div>`;
  const search = document.getElementById('people-search');
  const group = document.getElementById('people-group');
  const filter = () => {
    const q = search.value.toLowerCase();
    const g = group.value;
    document.getElementById('people-grid').innerHTML = data.people.filter(p => (g === 'All' || p.group === g) && `${p.name} ${p.role} ${p.interests}`.toLowerCase().includes(q)).map(personCard).join('') || '<div class="empty-state">No matching people found.</div>';
    activateReveals();
  };
  search.addEventListener('input', filter); group.addEventListener('change', filter);
}

function publicationItem(p) {
  return `<article class="publication-item reveal"><div class="publication-year">${escapeHTML(p.year)}</div><div><span class="tag">${escapeHTML(p.type)}</span><h3>${escapeHTML(p.title)}</h3><div class="publication-authors">${escapeHTML(p.authors)}</div><div class="publication-venue">${escapeHTML(p.venue)}</div></div><div class="publication-actions">${p.doi ? `<a class="button button-small button-outline" href="https://doi.org/${encodeURIComponent(p.doi)}" target="_blank" rel="noopener">DOI</a>` : ''}<button class="button button-small button-secondary copy-citation" data-id="${p.id}">Copy citation</button></div></article>`;
}

function renderPublications() {
  const years = ['All', ...new Set(data.publications.map(p => p.year).sort().reverse())];
  const types = ['All', ...new Set(data.publications.map(p => p.type))];
  main.innerHTML = `<div class="page">${pageHeading('Publications', 'Research contributions and scholarly outputs.', 'Search journal articles, conference papers, reports, preprints, and other research outputs.')}
  <section class="section"><div class="toolbar"><input id="pub-search" class="input" type="search" placeholder="Search title, author, or venue"><select id="pub-year" class="select">${years.map(x=>`<option>${x}</option>`).join('')}</select><select id="pub-type" class="select">${types.map(x=>`<option>${x}</option>`).join('')}</select></div><div id="publication-list">${[...data.publications].sort((a,b)=>b.year-a.year).map(publicationItem).join('')}</div></section></div>`;
  const filter = () => {
    const q = document.getElementById('pub-search').value.toLowerCase();
    const y = document.getElementById('pub-year').value;
    const t = document.getElementById('pub-type').value;
    const results = data.publications.filter(p => (y === 'All' || p.year === y) && (t === 'All' || p.type === t) && `${p.title} ${p.authors} ${p.venue}`.toLowerCase().includes(q));
    document.getElementById('publication-list').innerHTML = results.sort((a,b)=>b.year-a.year).map(publicationItem).join('') || '<div class="empty-state">No publications match your search.</div>';
    bindCitationButtons(); activateReveals();
  };
  ['pub-search','pub-year','pub-type'].forEach(id => document.getElementById(id).addEventListener(id==='pub-search'?'input':'change', filter));
  bindCitationButtons();
}

function bindCitationButtons() {
  document.querySelectorAll('.copy-citation').forEach(btn => btn.addEventListener('click', async () => {
    const p = data.publications.find(x => x.id === btn.dataset.id);
    if (!p) return;
    const citation = `${p.authors} (${p.year}). ${p.title}. ${p.venue}.${p.doi ? ` https://doi.org/${p.doi}` : ''}`;
    try {
      await navigator.clipboard.writeText(citation);
    } catch {
      const area = document.createElement('textarea');
      area.value = citation;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    toast('Citation copied');
  }));
}

function projectCard(p, index = 0) {
  return `<article class="card project-card reveal"><div class="project-number">${String(index + 1).padStart(2,'0')}</div><div class="status ${p.status === 'Completed' ? 'completed' : ''}">${escapeHTML(p.status)}</div><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.summary)}</p><div class="card-meta">${(p.tags || []).map(t=>`<span class="tag">${escapeHTML(t)}</span>`).join('')}</div><span class="card-link">${escapeHTML(p.start)}–${escapeHTML(p.end)} · ${escapeHTML(p.lead)}</span></article>`;
}

function renderProjects() {
  main.innerHTML = `<div class="page">${pageHeading('Projects', 'Research translated into focused programmes.', 'Explore ongoing and completed projects across edge intelligence, distributed systems, mobility, and cloud–edge infrastructure.')}
  <section class="section"><div class="grid grid-3">${data.projects.map(projectCard).join('')}</div></section></div>`;
}

function newsCard(n) {
  const date = new Date(`${n.date}T00:00:00`).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
  return `<article class="card reveal"><span class="tag">${escapeHTML(n.category)}</span><h3>${escapeHTML(n.title)}</h3><p>${escapeHTML(n.summary)}</p><div class="card-meta"><span class="tag">${date}</span></div></article>`;
}

function renderNews() {
  main.innerHTML = `<div class="page">${pageHeading('News & events', 'Updates from the lab.', 'Announcements, research milestones, events, opportunities, talks, and achievements.')}
  <section class="section"><div class="grid grid-3">${[...data.news].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(newsCard).join('')}</div></section></div>`;
}

function renderContact() {
  const s = data.settings;
  main.innerHTML = `<div class="page">${pageHeading('Contact', 'Start a research conversation.', 'Contact us regarding collaboration, doctoral research, internships, funded projects, invited talks, or access to research outputs.')}
  <section class="section"><div class="contact-layout"><div class="contact-panel reveal"><span class="eyebrow">Lab information</span><h2>${escapeHTML(s.labName)}</h2><p>${escapeHTML(s.location)}</p><p><strong>Email</strong><br><a href="mailto:${escapeHTML(s.email)}">${escapeHTML(s.email)}</a></p><p><strong>Phone</strong><br>${escapeHTML(s.phone)}</p><p><strong>Research focus</strong><br>Edge computing, fog computing, distributed systems, intelligent orchestration, IoT, and vehicular computing.</p></div><form class="contact-form reveal" id="contact-form"><div class="form-row"><div class="field"><label for="contact-name">Name</label><input class="input" id="contact-name" required></div><div class="field"><label for="contact-email">Email</label><input class="input" id="contact-email" type="email" required></div></div><div class="field"><label for="contact-subject">Subject</label><input class="input" id="contact-subject" required></div><div class="field"><label for="contact-message">Message</label><textarea class="textarea" id="contact-message" required></textarea></div><button class="button" type="submit">Send enquiry</button><small style="color:var(--muted)">Demo mode: form submissions are stored only in this browser.</small></form></div></section></div>`;
  document.getElementById('contact-form').addEventListener('submit', e => { e.preventDefault(); const submissions = JSON.parse(localStorage.getItem('edgesys-contact-submissions') || '[]'); submissions.push({ name: document.getElementById('contact-name').value, email: document.getElementById('contact-email').value, subject: document.getElementById('contact-subject').value, message: document.getElementById('contact-message').value, date: new Date().toISOString() }); localStorage.setItem('edgesys-contact-submissions', JSON.stringify(submissions)); e.target.reset(); toast('Enquiry saved successfully'); });
}

function renderNotFound() {
  main.innerHTML = `<section class="section"><div class="empty-state"><h1>Page not found</h1><p>The requested page does not exist.</p><a class="button" href="#home">Return home</a></div></section>`;
}

function isAuthenticated() { return sessionStorage.getItem(AUTH_KEY) === 'true'; }

function renderAdmin() {
  if (!isAuthenticated()) return renderAdminLogin();
  main.innerHTML = `<div class="page admin-shell"><aside class="admin-sidebar"><h2>Lab CMS</h2><nav class="admin-nav">${[
    ['dashboard','Dashboard'],['settings','Site settings'],['research','Research areas'],['people','People'],['publications','Publications'],['projects','Projects'],['news','News & events'],['data','Import / export']
  ].map(([id,label])=>`<button data-admin-section="${id}" class="${adminSection===id?'active':''}">${label}</button>`).join('')}<button id="admin-logout">Sign out</button></nav></aside><section class="admin-content"><div id="admin-view"></div></section></div>`;
  document.querySelectorAll('[data-admin-section]').forEach(btn => btn.addEventListener('click', () => { adminSection = btn.dataset.adminSection; renderAdmin(); }));
  document.getElementById('admin-logout').addEventListener('click', () => { sessionStorage.removeItem(AUTH_KEY); renderAdmin(); toast('Signed out'); });
  renderAdminSection();
}

function renderAdminLogin() {
  main.innerHTML = `<section class="page"><div class="login-card"><span class="eyebrow">Administrator</span><h1>Content dashboard</h1><p>Sign in to manage the website content.</p><form id="admin-login"><div class="field"><label>Username</label><input class="input" id="admin-user" autocomplete="username" required></div><div class="field"><label>Password</label><input class="input" id="admin-pass" type="password" autocomplete="current-password" required></div><button class="button" type="submit">Sign in</button><div class="credentials-note">Demo credentials: <strong>admin</strong> / <strong>admin123</strong><br>This static prototype uses browser storage and is not intended for production authentication.</div></form></div></section>`;
  document.getElementById('admin-login').addEventListener('submit', e => { e.preventDefault(); if (document.getElementById('admin-user').value === 'admin' && document.getElementById('admin-pass').value === 'admin123') { sessionStorage.setItem(AUTH_KEY, 'true'); renderAdmin(); toast('Welcome to the dashboard'); } else toast('Invalid demo credentials'); });
}

function renderAdminSection() {
  const view = document.getElementById('admin-view');
  if (adminSection === 'dashboard') {
    view.innerHTML = `<div class="admin-topbar"><div><span class="eyebrow">Overview</span><h1>Dashboard</h1></div><a class="button button-outline" href="#home">View website</a></div><div class="stats-grid"><div class="stat-card"><strong>${data.people.length}</strong><span>People</span></div><div class="stat-card"><strong>${data.publications.length}</strong><span>Publications</span></div><div class="stat-card"><strong>${data.projects.length}</strong><span>Projects</span></div><div class="stat-card"><strong>${data.news.length}</strong><span>News items</span></div></div><div class="admin-panel" style="margin-top:24px"><h2>Content management</h2><p>Use the navigation to update lab information, people, publications, projects, research areas, and news. Changes are saved locally and appear immediately on the public website.</p></div>`;
  } else if (adminSection === 'settings') renderSettingsAdmin(view);
  else if (adminSection === 'data') renderDataAdmin(view);
  else renderCollectionAdmin(view, adminSection);
}

function renderSettingsAdmin(view) {
  const s = data.settings;
  const fields = [
    ['labName','Lab name'],['shortName','Short name'],['subtitle','Subtitle'],['tagline','Tagline'],['heroTitle','Hero title'],['heroDescription','Hero description'],['description','Footer description'],['email','Email'],['phone','Phone'],['location','Location'],['website','Website']
  ];
  view.innerHTML = `<div class="admin-topbar"><div><span class="eyebrow">Brand & contact</span><h1>Site settings</h1></div></div><form class="admin-panel admin-form" id="settings-form">${fields.map(([key,label])=>`<div class="field ${['heroDescription','description','location'].includes(key)?'span-2':''}"><label for="set-${key}">${label}</label>${['heroDescription','description','location'].includes(key)?`<textarea class="textarea" id="set-${key}" name="${key}">${escapeHTML(s[key])}</textarea>`:`<input class="input" id="set-${key}" name="${key}" value="${escapeHTML(s[key])}">`}</div>`).join('')}<div class="span-2"><button class="button" type="submit">Save settings</button></div></form>`;
  document.getElementById('settings-form').addEventListener('submit', e => { e.preventDefault(); const form = new FormData(e.target); Object.keys(s).forEach(k => { if (form.has(k)) data.settings[k] = form.get(k).trim(); }); saveData('Site settings updated'); });
}

const schemas = {
  research: { title:'Research areas', singular:'Research area', fields:[['title','Title','text'],['icon','Two-letter icon','text'],['description','Description','textarea'],['tags','Tags (comma-separated)','text']] },
  people: { title:'People', singular:'Person', fields:[['name','Name','text'],['role','Role','text'],['group','Group','text'],['bio','Biography','textarea'],['interests','Research interests','text'],['email','Email','email'],['image','Image URL','text']] },
  publications: { title:'Publications', singular:'Publication', fields:[['title','Title','text'],['authors','Authors','text'],['venue','Venue','text'],['year','Year','text'],['type','Type','text'],['doi','DOI','text']] },
  projects: { title:'Projects', singular:'Project', fields:[['title','Title','text'],['summary','Summary','textarea'],['status','Status','text'],['lead','Lead investigator','text'],['funding','Funding','text'],['start','Start year','text'],['end','End year','text'],['tags','Tags (comma-separated)','text']] },
  news: { title:'News & events', singular:'News item', fields:[['title','Title','text'],['date','Date','date'],['category','Category','text'],['summary','Summary','textarea']] }
};

function renderCollectionAdmin(view, collection) {
  const schema = schemas[collection];
  const items = data[collection];
  view.innerHTML = `<div class="admin-topbar"><div><span class="eyebrow">Content</span><h1>${schema.title}</h1></div><button class="button" id="add-item">Add ${schema.singular}</button></div>${items.length ? `<table class="admin-table"><thead><tr><th>Title / name</th><th>Details</th><th>Actions</th></tr></thead><tbody>${items.map(item => `<tr><td><strong>${escapeHTML(item.title || item.name)}</strong></td><td>${escapeHTML(item.role || item.venue || item.status || item.category || item.description || '')}</td><td><div class="row-actions"><button data-edit="${item.id}">Edit</button><button data-delete="${item.id}">Delete</button></div></td></tr>`).join('')}</tbody></table>` : '<div class="empty-state">No items yet.</div>'}`;
  document.getElementById('add-item').addEventListener('click', () => openEditor(collection));
  view.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openEditor(collection, btn.dataset.edit)));
  view.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => { const item = items.find(x=>x.id===btn.dataset.delete); if (confirm(`Delete “${item.title || item.name}”?`)) { data[collection] = items.filter(x=>x.id!==btn.dataset.delete); saveData('Item deleted'); renderAdmin(); } }));
}

function openEditor(collection, id = null) {
  const schema = schemas[collection];
  const item = id ? data[collection].find(x => x.id === id) : {};
  editing = { collection, id };
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="modal-header"><h2>${id ? 'Edit' : 'Add'} ${schema.singular}</h2><button class="icon-button" id="close-modal" aria-label="Close">×</button></div><form class="admin-form" id="item-form" style="margin-top:24px">${schema.fields.map(([key,label,type])=>`<div class="field ${type==='textarea'?'span-2':''}"><label for="field-${key}">${label}</label>${type==='textarea'?`<textarea class="textarea" id="field-${key}" name="${key}" required>${escapeHTML(item[key] || '')}</textarea>`:`<input class="input" id="field-${key}" name="${key}" type="${type}" value="${escapeHTML(Array.isArray(item[key]) ? item[key].join(', ') : item[key] || '')}" ${['title','name'].includes(key)?'required':''}>`}</div>`).join('')}<div class="span-2"><button class="button" type="submit">Save ${schema.singular}</button></div></form></div>`;
  document.body.append(modal);
  const close = () => modal.remove();
  document.getElementById('close-modal').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.getElementById('item-form').addEventListener('submit', e => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.target));
    ['tags'].forEach(key => { if (key in form) form[key] = form[key].split(',').map(x=>x.trim()).filter(Boolean); });
    const next = { ...(item || {}), ...form, id: id || uid() };
    if (id) data[collection] = data[collection].map(x => x.id === id ? next : x); else data[collection].push(next);
    saveData(`${schema.singular} saved`); close(); renderAdmin();
  });
}

function renderDataAdmin(view) {
  view.innerHTML = `<div class="admin-topbar"><div><span class="eyebrow">Backup</span><h1>Import / export</h1></div></div><div class="admin-panel"><h2>Export website content</h2><p>Download a JSON backup of all website content.</p><button class="button" id="export-data">Download JSON</button></div><div class="admin-panel"><h2>Import website content</h2><p>Select a previously exported JSON file. Existing content will be replaced after validation.</p><input class="input" type="file" id="import-data" accept="application/json"></div><div class="admin-panel"><h2>Reset prototype</h2><p>Restore the original demonstration content.</p><button class="button button-danger" id="admin-reset">Reset all content</button></div>`;
  document.getElementById('export-data').addEventListener('click', () => { const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='edgesys-lab-content.json'; a.click(); URL.revokeObjectURL(a.href); });
  document.getElementById('import-data').addEventListener('change', e => { const file=e.target.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{ try{ const parsed=JSON.parse(reader.result); if(!parsed.settings || !parsed.people || !parsed.publications) throw new Error(); data=parsed; saveData('Content imported'); renderAdmin(); } catch { toast('Invalid content file'); } }; reader.readAsText(file); });
  document.getElementById('admin-reset').addEventListener('click', resetDemoData);
}

function resetDemoData() {
  if (!confirm('Reset all content to the original demonstration data?')) return;
  data = cloneSeed();
  saveData('Demo content restored');
  route();
}

function activateReveals() {
  const nodes = document.querySelectorAll('.reveal:not(.visible)');
  if (!('IntersectionObserver' in window)) return nodes.forEach(n => n.classList.add('visible'));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .08 });
  nodes.forEach(n => observer.observe(n));
}

menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

document.getElementById('theme-toggle').addEventListener('click', () => {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('edgesys-theme', next);
});

document.getElementById('reset-demo').addEventListener('click', resetDemoData);
document.getElementById('current-year').textContent = new Date().getFullYear();
document.documentElement.dataset.theme = localStorage.getItem('edgesys-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
window.addEventListener('hashchange', route);
syncBranding();
route();
