import { prisma } from '@/lib/prisma';
import { sql } from '@/lib/db';
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

    let patentsDb: any[] = seedData.patents;
    let galleryDb: any[] = seedData.gallery || [];
    let peopleOrder: string[] = [];
    if (sql) {
      try {
        const rows = await sql`SELECT collection_name, items FROM lab_collections WHERE collection_name IN ('patents', 'people_order', 'gallery')`;
        if (rows && rows.length > 0) {
          for (const row of rows) {
            const parsed = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
            if (row.collection_name === 'patents' && Array.isArray(parsed)) {
              patentsDb = parsed;
            } else if (row.collection_name === 'gallery' && Array.isArray(parsed)) {
              galleryDb = parsed;
            } else if (row.collection_name === 'people_order' && Array.isArray(parsed)) {
              peopleOrder = parsed;
            }
          }
        }
      } catch {}
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

    const sortedPeople = (peopleDb as any[]).map((p: any) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      group: p.group,
      bio: p.bio,
      interests: p.interests,
      email: p.email,
      image: p.image || '',
      scholarUrl: p.scholarUrl || '',
      orcid: p.orcid || '',
      dblpId: p.dblpId || ''
    }));

    if (peopleOrder.length > 0) {
      sortedPeople.sort((a, b) => {
        const idxA = peopleOrder.indexOf(a.id);
        const idxB = peopleOrder.indexOf(b.id);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }

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
        themeMode: (settingsDb.themeMode as 'light' | 'dark') || 'dark',
        activePages
      },
      stats: [
        {
          value: `${
            publicationsDb.filter((p: any) => p.isLabRelevant !== false).length > 0
              ? publicationsDb.filter((p: any) => p.isLabRelevant !== false).length + '+'
              : '0'
          }`,
          label: 'Peer-reviewed publications'
        },
        { value: `${peopleDb.filter((p: any) => p.group !== 'Alumni').length}`, label: 'Active researchers' },
        { value: `${projectsDb.length}`, label: 'Research projects' },
        { value: `${patentsDb.length}`, label: 'Patents' }
      ],
      patents: patentsDb,
      gallery: galleryDb,
      research: (researchDb as any[]).map((r: any) => ({
        id: r.id,
        title: r.title,
        icon: r.icon,
        description: r.description,
        tags: r.tags || []
      })),
      people: sortedPeople,
      publications: (publicationsDb as any[]).map((pub: any) => ({
        id: pub.id,
        title: pub.title,
        authors: pub.authors,
        venue: pub.venue,
        year: pub.year,
        type: pub.type,
        doi: pub.doi || '',
        url: pub.url || '',
        featured: pub.featured || false,
        isLabRelevant: pub.isLabRelevant ?? false,
        externalId: pub.externalId || '',
        personId: pub.personId || ''
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
