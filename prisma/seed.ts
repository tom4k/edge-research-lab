import { PrismaClient } from '@prisma/client';
import { initialAdminUsers, seedData } from '../src/lib/seedData';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Vercel Postgres Database...');

  // Seed Admin Users
  for (const user of initialAdminUsers) {
    await prisma.adminUser.upsert({
      where: { username: user.username },
      update: {},
      create: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash: user.passwordHash
      }
    });
  }

  // Seed Lab Settings
  await prisma.labSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      labName: seedData.settings.labName,
      shortName: seedData.settings.shortName,
      subtitle: seedData.settings.subtitle,
      tagline: seedData.settings.tagline,
      heroTitle: seedData.settings.heroTitle,
      heroDescription: seedData.settings.heroDescription,
      description: seedData.settings.description,
      email: seedData.settings.email,
      phone: seedData.settings.phone,
      location: seedData.settings.location,
      website: seedData.settings.website,
      activePages: seedData.settings.activePages as any
    }
  });

  // Seed Research Areas
  for (const item of seedData.research) {
    await prisma.researchArea.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        title: item.title,
        icon: item.icon,
        description: item.description,
        tags: item.tags
      }
    });
  }

  // Seed People
  for (const person of seedData.people) {
    await prisma.person.upsert({
      where: { id: person.id },
      update: {},
      create: {
        id: person.id,
        name: person.name,
        role: person.role,
        group: person.group,
        bio: person.bio,
        interests: person.interests,
        email: person.email,
        image: person.image
      }
    });
  }

  // Seed Publications
  for (const pub of seedData.publications) {
    await prisma.publication.upsert({
      where: { id: pub.id },
      update: {},
      create: {
        id: pub.id,
        title: pub.title,
        authors: pub.authors,
        venue: pub.venue,
        year: pub.year,
        type: pub.type,
        doi: pub.doi,
        featured: pub.featured || false
      }
    });
  }

  // Seed Projects
  for (const proj of seedData.projects) {
    await prisma.project.upsert({
      where: { id: proj.id },
      update: {},
      create: {
        id: proj.id,
        title: proj.title,
        summary: proj.summary,
        status: proj.status,
        lead: proj.lead,
        funding: proj.funding,
        start: proj.start,
        end: proj.end,
        tags: proj.tags
      }
    });
  }

  // Seed News Items
  for (const news of seedData.news) {
    await prisma.newsItem.upsert({
      where: { id: news.id },
      update: {},
      create: {
        id: news.id,
        title: news.title,
        date: news.date,
        category: news.category,
        summary: news.summary
      }
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
