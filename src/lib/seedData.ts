import { LabData, AdminUser } from './types';

export const initialAdminUsers: (AdminUser & { passwordHash: string })[] = [
  {
    id: 'user-super-admin-01',
    username: 'superadmin',
    name: 'Lab Director (Super Admin)',
    email: 'tomkurian.23phd21003@iiitkottayam.ac.in',
    role: 'superadmin',
    createdAt: '2026-01-01T00:00:00.000Z',
    passwordHash: 'super123!' // In demo auth model verified via JWT API route
  },
  {
    id: 'user-admin-01',
    username: 'admin',
    name: 'Lab Admin',
    email: 'admin@example.edu',
    role: 'admin',
    createdAt: '2026-01-15T00:00:00.000Z',
    passwordHash: 'admin123'
  }
];

export const seedData: LabData = {
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
    website: 'https://example.edu',
    themePreset: 'cyber-blue',
    activePages: {
      research: true,
      people: true,
      publications: true,
      projects: true,
      news: true,
      contact: true
    }
  },
  stats: [
    { value: '48+', label: 'Peer-reviewed publications' },
    { value: '12', label: 'Active researchers' },
    { value: '9', label: 'Research projects' },
    { value: '6', label: 'Academic and industry partners' }
  ],
  research: [
    { id: 'res-1', title: 'Edge Intelligence', icon: 'EI', description: 'Learning, inference, and decision-making close to data sources under latency, energy, and resource constraints.', tags: ['TinyML', 'Federated Learning', 'Edge AI'] },
    { id: 'res-2', title: 'Fog & Distributed Computing', icon: 'FD', description: 'Scalable orchestration across heterogeneous compute nodes with resilience, locality, and elastic resource management.', tags: ['Scheduling', 'Consensus', 'Resilience'] },
    { id: 'res-3', title: 'Vehicular Edge Computing', icon: 'VE', description: 'Low-latency service provisioning for connected and autonomous mobility using roadside and airborne infrastructure.', tags: ['IoV', 'Mobility', 'V2X'] },
    { id: 'res-4', title: 'Resource Orchestration', icon: 'RO', description: 'Optimization and reinforcement learning for placement, migration, admission control, and workload balancing.', tags: ['DRL', 'Optimization', 'Placement'] },
    { id: 'res-5', title: 'UAV-Assisted Computing', icon: 'UA', description: 'Lifetime-aware deployment of aerial edge servers for transient demand, sparse coverage, and emergency response.', tags: ['UAV', 'Energy', 'Coverage'] },
    { id: 'res-6', title: 'Cloud–Edge Systems', icon: 'CE', description: 'End-to-end architectures that coordinate cloud-scale analytics with responsive and privacy-aware edge services.', tags: ['Cloud', 'Kubernetes', 'MLOps'] }
  ],
  people: [
    { id: 'ppl-1', name: 'Dr. Ananya Rao', role: 'Lab Director', group: 'Faculty', bio: 'Leads research in distributed optimization, edge intelligence, and dependable computing.', interests: 'Edge computing, distributed systems, reinforcement learning', email: 'ananya.rao@example.edu', image: '' },
    { id: 'ppl-2', name: 'Arjun Menon', role: 'Research Scholar', group: 'Researchers', bio: 'Works on UAV-assisted vehicular edge computing and service orchestration.', interests: 'VEC, UAV computing, Lyapunov optimization', email: 'arjun.menon@example.edu', image: '' },
    { id: 'ppl-3', name: 'Nisha Thomas', role: 'Research Scholar', group: 'Researchers', bio: 'Studies privacy-preserving collaborative learning across heterogeneous edge devices.', interests: 'Federated learning, privacy, TinyML', email: 'nisha.thomas@example.edu', image: '' },
    { id: 'ppl-4', name: 'Rahul Das', role: 'Project Associate', group: 'Project Staff', bio: 'Builds testbeds for cloud–edge orchestration, observability, and model serving.', interests: 'Kubernetes, MLOps, distributed platforms', email: 'rahul.das@example.edu', image: '' },
    { id: 'ppl-5', name: 'Meera Iyer', role: 'Graduate Researcher', group: 'Students', bio: 'Explores adaptive placement strategies for latency-sensitive IoT applications.', interests: 'IoT, service placement, multi-objective optimization', email: 'meera.iyer@example.edu', image: '' },
    { id: 'ppl-6', name: 'Kevin Joseph', role: 'Alumnus', group: 'Alumni', bio: 'Former lab member working on resilient distributed infrastructure.', interests: 'Fault tolerance, distributed storage', email: 'kevin.joseph@example.edu', image: '' }
  ],
  publications: [
    { id: 'pub-1', title: 'Online UAV Lifetime-Aware Service Provisioning and Orchestration in Vehicular Edge Computing', authors: 'A. Menon, A. Rao', venue: 'Journal manuscript', year: '2026', type: 'Journal', doi: '', featured: true },
    { id: 'pub-2', title: 'Adaptive Service Placement for Heterogeneous Edge Environments using Reinforcement Learning', authors: 'N. Thomas, A. Rao', venue: 'International Conference on Distributed Computing Systems', year: '2025', type: 'Conference', doi: '10.0000/example.2025.001', featured: true },
    { id: 'pub-3', title: 'Workload-Aware Orchestration across Cloud and Edge Resources', authors: 'R. Das, M. Iyer, A. Rao', venue: 'Future Generation Computer Systems', year: '2025', type: 'Journal', doi: '10.0000/example.2025.002', featured: false },
    { id: 'pub-4', title: 'Energy-Efficient Inference on Resource-Constrained Edge Devices', authors: 'M. Iyer, N. Thomas', venue: 'IEEE Edge Computing Workshop', year: '2024', type: 'Conference', doi: '', featured: false }
  ],
  projects: [
    { id: 'proj-1', title: 'Lifetime-Aware UAV Edge Orchestration', summary: 'Dynamic deployment and migration strategies for aerial edge servers under finite energy and mobility constraints.', status: 'Ongoing', lead: 'Dr. Ananya Rao', funding: 'Institutional Research Grant', start: '2025', end: '2027', tags: ['UAV', 'VEC', 'Optimization'] },
    { id: 'proj-2', title: 'Federated Intelligence for Edge IoT', summary: 'Privacy-preserving collaborative learning for heterogeneous and intermittently connected IoT devices.', status: 'Ongoing', lead: 'Dr. Ananya Rao', funding: 'National Research Programme', start: '2024', end: '2027', tags: ['Federated Learning', 'IoT'] },
    { id: 'proj-3', title: 'Cloud–Edge MLOps Testbed', summary: 'A reproducible platform for training, deploying, monitoring, and updating ML models across edge clusters.', status: 'Completed', lead: 'Rahul Das', funding: 'Lab Infrastructure Grant', start: '2023', end: '2025', tags: ['MLOps', 'Kubernetes'] }
  ],
  news: [
    { id: 'news-1', title: 'New edge orchestration testbed commissioned', date: '2026-06-18', category: 'Lab Update', summary: 'The lab has expanded its experimental infrastructure with edge boards, GPU nodes, and network emulation facilities.' },
    { id: 'news-2', title: 'Research scholar presents work on vehicular edge computing', date: '2026-05-03', category: 'Presentation', summary: 'The work examines service placement and migration across fixed and aerial edge servers.' },
    { id: 'news-3', title: 'Applications invited for student research internships', date: '2026-04-12', category: 'Opportunity', summary: 'Openings are available in edge AI, distributed systems, and reinforcement learning.' }
  ]
};
