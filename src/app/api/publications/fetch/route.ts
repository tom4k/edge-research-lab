import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

function extractScholarUserId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/user=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Helper to query CrossRef API for clean metadata
async function fetchCrossRefPublications(authorName: string) {
  try {
    const query = encodeURIComponent(authorName);
    const res = await fetch(`https://api.crossref.org/works?query.author=${query}&rows=15`, {
      headers: {
        'User-Agent': 'EdgeSysResearchLab/1.0 (mailto:edgesys@example.edu)'
      }
    });

    if (!res.ok) return [];

    const json = await res.json();
    const items = json?.message?.items || [];

    return items.map((item: any) => {
      const title = item.title && item.title.length > 0 ? item.title[0] : 'Untitled Work';
      const authors = (item.author || [])
        .map((a: any) => `${a.given || ''} ${a.family || ''}`.trim())
        .filter(Boolean)
        .join(', ') || authorName;
      
      const venue = (item['container-title'] && item['container-title'].length > 0)
        ? item['container-title'][0]
        : item.publisher || 'Academic Publication';

      let year = '2025';
      if (item.published?.['date-parts']?.[0]?.[0]) {
        year = String(item.published['date-parts'][0][0]);
      } else if (item['published-print']?.['date-parts']?.[0]?.[0]) {
        year = String(item['published-print'][0][0]);
      } else if (item['published-online']?.['date-parts']?.[0]?.[0]) {
        year = String(item['published-online'][0][0]);
      }

      const type = item.type === 'proceedings-article' ? 'Conference' : 'Journal';
      const doi = item.DOI || '';
      const url = item.URL || (doi ? `https://doi.org/${doi}` : '');

      return {
        title,
        authors,
        venue,
        year,
        type,
        doi,
        url,
        externalId: doi ? `doi:${doi}` : `crossref:${item.id || title.substring(0, 30)}`
      };
    });
  } catch (error) {
    console.warn('CrossRef API fetch warning:', error);
    return [];
  }
}

// Helper to parse publications from Google Scholar Profile
async function fetchScholarPublications(scholarUserId: string, authorName: string) {
  try {
    const url = `https://scholar.google.com/citations?user=${scholarUserId}&cstart=0&pagesize=100&hl=en`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) return [];

    const html = await res.text();
    const publications: any[] = [];

    // Parse table rows from Google Scholar HTML
    const rowRegex = /<tr class="gsc_a_tr">([\s\S]*?)<\/tr>/g;
    let match;

    while ((match = rowRegex.exec(html)) !== null) {
      const rowContent = match[1];

      // Extract title & link
      const titleMatch = rowContent.match(/<a [^>]*class="gsc_a_at"[^>]*>([\s\S]*?)<\/a>/);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      const hrefMatch = rowContent.match(/href="([^"]+)"/);
      const link = hrefMatch ? `https://scholar.google.com${hrefMatch[1].replace(/&amp;/g, '&')}` : '';

      // Extract authors and venue
      const grayMatches = [...rowContent.matchAll(/<div class="gs_gray">([\s\S]*?)<\/div>/g)];
      const authors = grayMatches[0] ? grayMatches[0][1].replace(/<[^>]+>/g, '').trim() : authorName;
      const venue = grayMatches[1] ? grayMatches[1][1].replace(/<[^>]+>/g, '').trim() : 'Scholarly Publication';

      // Extract year
      const yearMatch = rowContent.match(/<span class="gsc_a_h gsc_a_hc gs_ibl">(\d{4})<\/span>/);
      const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

      if (title) {
        publications.push({
          title,
          authors: authors || authorName,
          venue: venue || 'Scholarly Publication',
          year,
          type: venue.toLowerCase().includes('proc') || venue.toLowerCase().includes('conf') ? 'Conference' : 'Journal',
          doi: '',
          url: link,
          externalId: `scholar:${scholarUserId}:${title.substring(0, 40).toLowerCase().replace(/\W+/g, '')}`
        });
      }
    }

    return publications;
  } catch (error) {
    console.warn('Google Scholar scraping warning:', error);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const { personId, scholarUrl, personName } = await request.json();

    if (!personId || !personName) {
      return NextResponse.json({ error: 'personId and personName are required' }, { status: 400 });
    }

    const scholarUserId = extractScholarUserId(scholarUrl);
    let fetchedPubs: any[] = [];

    // 1. Try Google Scholar if valid URL provided
    if (scholarUserId) {
      fetchedPubs = await fetchScholarPublications(scholarUserId, personName);
    }

    // 2. Query CrossRef API (always or as enrichment)
    const crossRefPubs = await fetchCrossRefPublications(personName);

    // Combine & deduplicate publications by normalized title
    const titleMap = new Map<string, any>();

    for (const pub of [...fetchedPubs, ...crossRefPubs]) {
      const normTitle = pub.title.toLowerCase().trim().replace(/[^\w\s]/g, '');
      if (!titleMap.has(normTitle)) {
        titleMap.set(normTitle, pub);
      }
    }

    const combined = Array.from(titleMap.values());

    // Save to Database if DB is connected
    const hasDb = !!(process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL);
    let savedCount = 0;

    if (hasDb && combined.length > 0) {
      for (const pub of combined) {
        // Upsert or create publication for person
        const existing = await prisma.publication.findFirst({
          where: {
            personId,
            title: pub.title
          }
        });

        if (!existing) {
          await prisma.publication.create({
            data: {
              title: pub.title,
              authors: pub.authors,
              venue: pub.venue,
              year: pub.year,
              type: pub.type,
              doi: pub.doi || '',
              url: pub.url || '',
              externalId: pub.externalId,
              isLabRelevant: false, // Default to false until Admin curates
              personId
            }
          });
          savedCount++;
        }
      }

      revalidatePath('/', 'layout');
    }

    return NextResponse.json({
      success: true,
      message: `Fetched ${combined.length} publications (${savedCount} new saved)`,
      publications: combined,
      fetchedCount: combined.length,
      savedCount
    });
  } catch (error: any) {
    console.error('Error fetching publications:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch publications' }, { status: 500 });
  }
}
