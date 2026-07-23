import { prisma } from '@/lib/prisma';
import { seedData } from '@/lib/seedData';
import { LabData } from '@/lib/types';

export async function getLabData(): Promise<LabData> {
  try {
    const hasDb = !!(process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL);
    if (!hasDb) {
      return seedData;
    }

    const settingsDb = await prisma.labSetting.findUnique({ where: { id: 1 } });
    const researchDb = await prisma.researchArea.findMany();
    const peopleDb = await prisma.person.findMany();
    const publicationsDb = await prisma.publication.findMany();
    const projectsDb = await prisma.project.findMany();
    const newsDb = await prisma.newsItem.findMany();

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
        activePages
      },
      stats: [
        { value: `${publicationsDb.length}+`, label: 'Peer-reviewed publications' },
        { value: `${peopleDb.length}`, label: 'Active researchers' },
        { value: `${projectsDb.length}`, label: 'Research projects' },
        { value: '6', label: 'Academic and industry partners' }
      ],
      research: researchDb.map(r => ({
        id: r.id,
        title: r.title,
        icon: r.icon,
        description: r.description,
        tags: r.tags
      })),
      people: peopleDb.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        group: p.group,
        bio: p.bio,
        interests: p.interests,
        email: p.email,
        image: p.image || ''
      })),
      publications: publicationsDb.map(pub => ({
        id: pub.id,
        title: pub.title,
        authors: pub.authors,
        venue: pub.venue,
        year: pub.year,
        type: pub.type,
        doi: pub.doi || '',
        featured: pub.featured
      })),
      projects: projectsDb.map(proj => ({
        id: proj.id,
        title: proj.title,
        summary: proj.summary,
        status: proj.status,
        lead: proj.lead,
        funding: proj.funding || '',
        start: proj.start,
        end: proj.end,
        tags: proj.tags
      })),
      news: newsDb.map(n => ({
        id: n.id,
        title: n.title,
        date: n.date,
        category: n.category,
        summary: n.summary
      }))
    };
  } catch (error) {
    console.error('Server getLabData error:', error);
    return seedData;
  }
}
