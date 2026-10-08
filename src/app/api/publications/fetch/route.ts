import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

function extractScholarUserId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(/[?&]user=([a-zA-Z0-9_-]+)/) || trimmed.match(/user=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  // If user pasted just the 12-char Scholar ID e.g. "sRrfw8EAAAAJ"
  if (/^[a-zA-Z0-9_-]{10,16}$/.test(trimmed)) return trimmed;
  return null;
}

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

// Fetch publications directly and exclusively from Google Scholar Profile
async function fetchScholarPublications(scholarUserId: string, authorName: string) {
  const url = `https://scholar.google.com/citations?user=${encodeURIComponent(scholarUserId)}&cstart=0&pagesize=100&hl=en`;
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error(
        'Google Scholar blocked automated cloud server requests (HTTP 403). Cloud platforms like Vercel are blocked by Google bot protection. Please use the "Import BibTeX" button to import your Google Scholar publications.'
      );
    }
    if (res.status === 404) {
      throw new Error(`Google Scholar profile with ID "${scholarUserId}" was not found (404). Please verify the profile URL.`);
    }
    if (res.status === 429) {
      throw new Error('Google Scholar rate limit reached. Please try again in a few minutes or use Import BibTeX.');
    }
    throw new Error(`Google Scholar returned HTTP status ${res.status}`);
  }

  const html = await res.text();
  const publications: any[] = [];

  // Parse table rows from Google Scholar HTML
  const rowRegex = /<tr class="gsc_a_tr">([\s\S]*?)<\/tr>/g;
  let match;

  while ((match = rowRegex.exec(html)) !== null) {
    const rowContent = match[1];

    // Extract title & link
    const titleMatch = rowContent.match(/<a [^>]*class="gsc_a_at"[^>]*>([\s\S]*?)<\/a>/);
    const rawTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    const title = decodeHtmlEntities(rawTitle);

    const hrefMatch = rowContent.match(/href="([^"]+)"/);
    const link = hrefMatch ? `https://scholar.google.com${hrefMatch[1].replace(/&amp;/g, '&')}` : '';

    // Extract authors and venue
    const grayMatches = [...rowContent.matchAll(/<div class="gs_gray">([\s\S]*?)<\/div>/g)];
    const rawAuthors = grayMatches[0] ? grayMatches[0][1].replace(/<[^>]+>/g, '').trim() : authorName;
    const authors = decodeHtmlEntities(rawAuthors) || authorName;

    const rawVenue = grayMatches[1] ? grayMatches[1][1].replace(/<[^>]+>/g, '').trim() : 'Scholarly Publication';
    const venue = decodeHtmlEntities(rawVenue) || 'Scholarly Publication';

    // Extract year
    const yearMatch = rowContent.match(/<span class="gsc_a_h gsc_a_hc gs_ibl">(\d{4})<\/span>/);
    const year = yearMatch ? yearMatch[1] : '';

    if (title) {
      const isConf =
        venue.toLowerCase().includes('proc') ||
        venue.toLowerCase().includes('conf') ||
        venue.toLowerCase().includes('symp') ||
        venue.toLowerCase().includes('workshop');

      publications.push({
        title,
        authors,
        venue,
        year: year || String(new Date().getFullYear()),
        type: isConf ? 'Conference' : 'Journal',
        doi: '',
        url: link,
        externalId: `scholar:${scholarUserId}:${title.substring(0, 40).toLowerCase().replace(/\W+/g, '')}`
      });
    }
  }

  return publications;
}

// Fetch publications via SerpApi (Official industry proxy for Google Scholar with 100 free searches/mo)
async function fetchSerpApiScholarPublications(scholarUserId: string, apiKey: string, authorName: string) {
  const url = `https://serpapi.com/search.json?engine=google_scholar_author&author_id=${encodeURIComponent(scholarUserId)}&api_key=${encodeURIComponent(apiKey)}&num=100`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`SerpApi Google Scholar returned status ${res.status}`);
  }
  const data = await res.json();
  const articles = data.articles || [];
  return articles.map((art: any) => {
    const venue = art.publication || 'Scholarly Publication';
    const isConf =
      venue.toLowerCase().includes('proc') ||
      venue.toLowerCase().includes('conf') ||
      venue.toLowerCase().includes('symp') ||
      venue.toLowerCase().includes('workshop');

    return {
      title: art.title || 'Untitled Work',
      authors: art.authors || authorName,
      venue,
      year: art.year || String(new Date().getFullYear()),
      type: isConf ? 'Conference' : 'Journal',
      doi: '',
      url: art.link || '',
      externalId: `scholar:${scholarUserId}:${(art.citation_id || art.title || '').substring(0, 40).toLowerCase().replace(/\W+/g, '')}`
    };
  });
}

export async function POST(request: Request) {
  try {
    const { personId, scholarUrl, personName } = await request.json();

    if (!personId || !personName) {
      return NextResponse.json({ error: 'personId and personName are required' }, { status: 400 });
    }

    const scholarUserId = extractScholarUserId(scholarUrl);
    if (!scholarUserId) {
      return NextResponse.json(
        {
          error: `Invalid Google Scholar URL "${scholarUrl || ''}". Please use format: https://scholar.google.com/citations?user=...`
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERPAPI_KEY || process.env.GOOGLE_SCHOLAR_API_KEY;
    let scholarPubs: any[] = [];

    if (apiKey) {
      try {
        scholarPubs = await fetchSerpApiScholarPublications(scholarUserId, apiKey, personName);
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message || 'Failed to fetch from SerpApi Google Scholar API' },
          { status: 400 }
        );
      }
    } else {
      try {
        scholarPubs = await fetchScholarPublications(scholarUserId, personName);
      } catch (err: any) {
        const msg = err.message || '';
        if (msg.includes('403')) {
          return NextResponse.json(
            {
              error:
                'Google Scholar blocked automated cloud server requests (HTTP 403). Google has no official public API and blocks cloud hosts like Vercel. To enable automatic syncing, get a free key at serpapi.com and add SERPAPI_KEY to your Vercel Environment Variables.'
            },
            { status: 403 }
          );
        }
        return NextResponse.json(
          { error: msg || 'Failed to fetch publications from Google Scholar' },
          { status: 400 }
        );
      }
    }

    if (scholarPubs.length === 0) {
      return NextResponse.json(
        {
          error: `No publications found on Google Scholar profile for ${personName} (${scholarUserId}). Please verify the profile is public.`
        },
        { status: 404 }
      );
    }

    // Connect to database to sync if DB is configured
    const hasDb = !!(process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL);
    const finalPublications: any[] = [];

    // Find existing publications to preserve any curation (isLabRelevant / featured)
    let existingPersonPubs: any[] = [];
    if (hasDb) {
      existingPersonPubs = await prisma.publication.findMany({
        where: { personId }
      });
    }

    for (const pub of scholarPubs) {
      const normTitle = pub.title.toLowerCase().trim().replace(/[^\w\s]/g, '');
      const matched = existingPersonPubs.find(
        (ep) => ep.title.toLowerCase().trim().replace(/[^\w\s]/g, '') === normTitle
      );

      finalPublications.push({
        id: matched?.id || `pub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: pub.title,
        authors: pub.authors,
        venue: pub.venue,
        year: pub.year,
        type: pub.type,
        doi: pub.doi || '',
        url: pub.url || '',
        featured: matched?.featured || false,
        isLabRelevant: matched?.isLabRelevant || false,
        personId,
        externalId: pub.externalId
      });
    }

    if (hasDb) {
      // Clean up previous publications for this person (removes any old incorrect CrossRef entries)
      await prisma.publication.deleteMany({
        where: { personId }
      });

      // Insert the clean Google Scholar publications
      for (const pub of finalPublications) {
        await prisma.publication.create({
          data: {
            id: pub.id,
            title: pub.title,
            authors: pub.authors,
            venue: pub.venue,
            year: pub.year,
            type: pub.type,
            doi: pub.doi,
            url: pub.url,
            featured: pub.featured,
            isLabRelevant: pub.isLabRelevant,
            externalId: pub.externalId,
            personId
          }
        });
      }

      revalidatePath('/', 'layout');
    }

    return NextResponse.json({
      success: true,
      message: `Successfully fetched ${finalPublications.length} publications from Google Scholar for ${personName}`,
      publications: finalPublications,
      fetchedCount: finalPublications.length
    });
  } catch (error: any) {
    console.error('Error in Google Scholar publication sync:', error);
    return NextResponse.json({ error: error.message || 'Failed to sync Google Scholar publications' }, { status: 500 });
  }
}
