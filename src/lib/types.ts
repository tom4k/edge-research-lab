export type UserRole = 'superadmin' | 'admin';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface PageVisibilityMap {
  research: boolean;
  people: boolean;
  publications: boolean;
  patents?: boolean;
  projects: boolean;
  news: boolean;
  contact: boolean;
}

export interface LabSettings {
  labName: string;
  shortName: string;
  subtitle: string;
  tagline: string;
  heroTitle: string;
  heroDescription: string;
  description: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  themePreset?: string;
  activePages: PageVisibilityMap;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface ResearchArea {
  id: string;
  title: string;
  icon: string;
  description: string;
  tags: string[];
}

export interface Person {
  id: string;
  name: string;
  role: string;
  group: string;
  bio: string;
  interests: string;
  email: string;
  image?: string;
  scholarUrl?: string;
  orcid?: string;
  dblpId?: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: string;
  type: string;
  doi?: string;
  url?: string;
  featured?: boolean;
  isLabRelevant?: boolean;
  externalId?: string;
  personId?: string;
}

export interface Patent {
  id: string;
  title: string;
  inventors: string;
  patentNumber: string;
  jurisdiction: string;
  year: string;
  status: 'Granted' | 'Filed' | 'Published' | 'Pending';
  summary?: string;
  url?: string;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  status: string;
  lead: string;
  funding: string;
  start: string;
  end: string;
  tags: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
}

export interface LabData {
  settings: LabSettings;
  stats: StatItem[];
  research: ResearchArea[];
  people: Person[];
  publications: Publication[];
  patents: Patent[];
  projects: Project[];
  news: NewsItem[];
}
