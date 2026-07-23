import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { seedData } from '@/lib/seedData';
import { LabData } from '@/lib/types';

export async function GET() {
  try {
    const hasDb = !!(process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL);
    if (!hasDb) {
      return NextResponse.json({ success: true, data: seedData, source: 'seed' });
    }

    const settingsDb = await prisma.labSetting.findUnique({ where: { id: 1 } });
    const researchDb = await prisma.researchArea.findMany();
    const peopleDb = await prisma.person.findMany();
    const publicationsDb = await prisma.publication.findMany();
    const projectsDb = await prisma.project.findMany();
    const newsDb = await prisma.newsItem.findMany();

    if (!settingsDb) {
      return NextResponse.json({ success: true, data: seedData, source: 'seed' });
    }

    const activePages = (settingsDb.activePages as any) || seedData.settings.activePages;

    const data: LabData = {
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

    return NextResponse.json({ success: true, data, source: 'database' });
  } catch (error) {
    console.error('Failed to fetch content from database:', error);
    return NextResponse.json({ success: true, data: seedData, source: 'fallback' });
  }
}

export async function POST(request: Request) {
  try {
    const body: LabData = await request.json();
    const hasDb = !!(process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL);

    if (!hasDb) {
      return NextResponse.json({ success: true, message: 'Saved to local state only (no database connected)', synced: false });
    }

    const { settings, research, people, publications, projects, news } = body;

    // 1. Update Lab Settings
    if (settings) {
      await prisma.labSetting.upsert({
        where: { id: 1 },
        update: {
          labName: settings.labName,
          shortName: settings.shortName,
          subtitle: settings.subtitle,
          tagline: settings.tagline,
          heroTitle: settings.heroTitle,
          heroDescription: settings.heroDescription,
          description: settings.description,
          email: settings.email,
          phone: settings.phone,
          location: settings.location,
          website: settings.website,
          activePages: settings.activePages as any
        },
        create: {
          id: 1,
          labName: settings.labName,
          shortName: settings.shortName,
          subtitle: settings.subtitle,
          tagline: settings.tagline,
          heroTitle: settings.heroTitle,
          heroDescription: settings.heroDescription,
          description: settings.description,
          email: settings.email,
          phone: settings.phone,
          location: settings.location,
          website: settings.website,
          activePages: settings.activePages as any
        }
      });
    }

    // 2. Sync Research Areas
    if (Array.isArray(research)) {
      await prisma.researchArea.deleteMany({});
      for (const item of research) {
        await prisma.researchArea.create({
          data: {
            id: item.id,
            title: item.title,
            icon: item.icon || 'EI',
            description: item.description,
            tags: item.tags || []
          }
        });
      }
    }

    // 3. Sync People
    if (Array.isArray(people)) {
      await prisma.person.deleteMany({});
      for (const p of people) {
        await prisma.person.create({
          data: {
            id: p.id,
            name: p.name,
            role: p.role,
            group: p.group,
            bio: p.bio,
            interests: p.interests,
            email: p.email,
            image: p.image || ''
          }
        });
      }
    }

    // 4. Sync Publications
    if (Array.isArray(publications)) {
      await prisma.publication.deleteMany({});
      for (const pub of publications) {
        await prisma.publication.create({
          data: {
            id: pub.id,
            title: pub.title,
            authors: pub.authors,
            venue: pub.venue,
            year: pub.year,
            type: pub.type || 'Journal',
            doi: pub.doi || '',
            featured: pub.featured || false
          }
        });
      }
    }

    // 5. Sync Projects
    if (Array.isArray(projects)) {
      await prisma.project.deleteMany({});
      for (const proj of projects) {
        await prisma.project.create({
          data: {
            id: proj.id,
            title: proj.title,
            summary: proj.summary,
            status: proj.status || 'Ongoing',
            lead: proj.lead,
            funding: proj.funding || '',
            start: proj.start,
            end: proj.end,
            tags: proj.tags || []
          }
        });
      }
    }

    // 6. Sync News Items
    if (Array.isArray(news)) {
      await prisma.newsItem.deleteMany({});
      for (const n of news) {
        await prisma.newsItem.create({
          data: {
            id: n.id,
            title: n.title,
            date: n.date,
            category: n.category || 'Lab Update',
            summary: n.summary
          }
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Content synced to Prisma database globally', synced: true });
  } catch (error) {
    console.error('Failed to sync content to database:', error);
    return NextResponse.json({ error: 'Database sync failed' }, { status: 500 });
  }
}
