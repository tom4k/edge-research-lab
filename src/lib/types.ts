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
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: string;
  type: string;
  doi?: string;
  featured?: boolean;
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
  projects: Project[];
  news: NewsItem[];
}
