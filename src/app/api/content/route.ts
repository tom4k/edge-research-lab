import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { sql } from '@/lib/db';
import { getLabData } from '@/lib/getLabData';
import { LabData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getLabData();
  return NextResponse.json({ success: true, data, source: 'server' });
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
          themePreset: settings.themePreset || 'cyber-blue',
          themeMode: settings.themeMode || 'dark',
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
          themePreset: settings.themePreset || 'cyber-blue',
          themeMode: settings.themeMode || 'dark',
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
      if (sql) {
        try {
          const orderIds = people.map((p) => p.id);
          await sql`
            INSERT INTO lab_collections (collection_name, items, updated_at)
            VALUES ('people_order', ${JSON.stringify(orderIds)}, NOW())
            ON CONFLICT (collection_name)
            DO UPDATE SET items = ${JSON.stringify(orderIds)}, updated_at = NOW();
          `;
        } catch (err) {
          console.warn('Could not sync people_order to lab_collections:', err);
        }
      }

      const incomingPersonIds = people.map((p) => p.id);
      await prisma.person.deleteMany({
        where: { id: { notIn: incomingPersonIds } }
      });
      for (const p of people) {
        await prisma.person.upsert({
          where: { id: p.id },
          update: {
            name: p.name,
            role: p.role,
            group: p.group,
            bio: p.bio || '',
            interests: p.interests,
            email: p.email,
            image: p.image || '',
            scholarUrl: p.scholarUrl || '',
            orcid: p.orcid || '',
            dblpId: p.dblpId || ''
          },
          create: {
            id: p.id,
            name: p.name,
            role: p.role,
            group: p.group,
            bio: p.bio || '',
            interests: p.interests,
            email: p.email,
            image: p.image || '',
            scholarUrl: p.scholarUrl || '',
            orcid: p.orcid || '',
            dblpId: p.dblpId || ''
          }
        });
      }
    }

    // 4. Sync Publications
    if (Array.isArray(publications)) {
      const incomingPubIds = publications.map((pub) => pub.id);
      await prisma.publication.deleteMany({
        where: { id: { notIn: incomingPubIds } }
      });

      if (publications.length > 0) {
        for (let i = 0; i < publications.length; i += 50) {
          const chunk = publications.slice(i, i + 50);
          await prisma.publication.createMany({
            data: chunk.map((pub) => ({
              id: pub.id,
              title: pub.title,
              authors: pub.authors,
              venue: pub.venue,
              year: pub.year,
              type: pub.type || 'Journal',
              doi: pub.doi || '',
              url: pub.url || '',
              featured: pub.featured || false,
              isLabRelevant: pub.isLabRelevant ?? false,
              externalId: pub.externalId || null,
              personId: pub.personId || null
            })),
            skipDuplicates: true
          });
        }
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

    // 7. Sync Patents
    if (sql && Array.isArray(body.patents)) {
      try {
        await sql`
          INSERT INTO lab_collections (collection_name, items, updated_at)
          VALUES ('patents', ${JSON.stringify(body.patents)}, NOW())
          ON CONFLICT (collection_name)
          DO UPDATE SET items = ${JSON.stringify(body.patents)}, updated_at = NOW();
        `;
      } catch (err) {
        console.warn('Could not sync patents to lab_collections:', err);
      }
    }

    // Purge cached Next.js pages so all devices get the fresh database content immediately
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, message: 'Content synced to Prisma database globally', synced: true });
  } catch (error) {
    console.error('Failed to sync content to database:', error);
    return NextResponse.json({ error: 'Database sync failed' }, { status: 500 });
  }
}
