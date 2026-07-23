import { prisma } from '@/lib/prisma';
import { seedData } from '@/lib/seedData';
import { LabData } from '@/lib/types';

export async function getLabData(): Promise<LabData> {
  // Ensure this function is only executed on the server side
  if (typeof window !== 'undefined') {
    return seedData;
  }

  try {
    const hasDb = !!(process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL);
    if (!hasDb) {
      return seedData;
    }

    const [settingsDb, researchDb, peopleDb, publicationsDb, projectsDb, newsDb] = await Promise.all([
      prisma.labSetting.findUnique({ where: { id: 1 } }),
      prisma.researchArea.findMany(),
      prisma.person.findMany(),
      prisma.publication.findMany(),
      prisma.project.findMany(),
      prisma.newsItem.findMany()
    ]);

    if (!settingsDb) {
      return seedData;
    }

    const activePages = (settingsDb.activePages as any) || seedData.settings.activePages;

    return {
      settings: {
        labName: settingsDb.labName,
        shortName: settingsDb.shortName,
        subtitle: settingsDb.subtitle,
        tagline: settingsDb.tagline,
        heroTitle: settingsDb.heroTitle,
        heroDescription: settingsDb.heroDescription,
        description: settingsDb.description,
        email: settingsDb.email,
        phone: settingsDb.phone,
        location: settingsDb.location,
        website: settingsDb.website,
        themePreset: settingsDb.themePreset || 'cyber-blue',
        activePages
      },
      stats: [
        { value: `${publicationsDb.length}+`, label: 'Peer-reviewed publications' },
        { value: `${peopleDb.length}`, label: 'Active researchers' },
        { value: `${projectsDb.length}`, label: 'Research projects' },
        { value: '6', label: 'Academic and industry partners' }
      ],
      research: (researchDb as any[]).map((r: any) => ({
        id: r.id,
        title: r.title,
        icon: r.icon,
        description: r.description,
        tags: r.tags || []
      })),
      people: (peopleDb as any[]).map((p: any) => ({
        id: p.id,
        name: p.name,
        role: p.role,
        group: p.group,
        bio: p.bio,
        interests: p.interests,
        email: p.email,
        image: p.image || ''
      })),
      publications: (publicationsDb as any[]).map((pub: any) => ({
        id: pub.id,
        title: pub.title,
        authors: pub.authors,
        venue: pub.venue,
        year: pub.year,
        type: pub.type,
        doi: pub.doi || '',
        featured: pub.featured || false
      })),
      projects: (projectsDb as any[]).map((proj: any) => ({
        id: proj.id,
        title: proj.title,
        summary: proj.summary,
        status: proj.status,
        lead: proj.lead,
        funding: proj.funding || '',
        start: proj.start,
        end: proj.end,
        tags: proj.tags || []
      })),
      news: (newsDb as any[]).map((n: any) => ({
        id: n.id,
        title: n.title,
        date: n.date,
        category: n.category,
        summary: n.summary
      }))
    };
  } catch (error) {
    console.warn('Server getLabData DB query warning, falling back to seedData:', error);
    return seedData;
  }
}
