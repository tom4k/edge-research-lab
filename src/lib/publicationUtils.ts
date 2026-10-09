import { Publication } from './types';

/**
 * Normalizes a DOI string by extracting the canonical DOI identifier,
 * stripping URL prefixes, resolver URLs, and converting to lowercase.
 * e.g., "https://doi.org/10.1109/TMC.2025.12345" -> "10.1109/tmc.2025.12345"
 * e.g., "doi: 10.1145/12345.678" -> "10.1145/12345.678"
 */
export function normalizeDoi(doi?: string): string {
  if (!doi) return '';
  const cleaned = doi.trim().toLowerCase();
  const match = cleaned.match(/10\.\d{4,9}\/[-._;()/:a-z0-9]+/i);
  if (match) {
    return match[0].replace(/\/+$/, '');
  }
  return cleaned
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .replace(/\/+$/, '')
    .trim();
}

/**
 * Normalizes a publication title for fallback matching when DOI is missing.
 */
export function normalizeTitle(title?: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Formats a publication count into 5's+ milestone buckets as requested:
 * - 25 publications -> "20+"
 * - 38 publications -> "35+"
 * - e.g. if count is 21-25 -> "20+", if 36-40 -> "35+"
 * - 0 publications -> "0"
 * - count under 5 -> `${count}+`
 */
export function formatPublicationMilestone(count: number): string {
  if (count <= 0) return '0';
  if (count < 5) return `${count}+`;
  const milestone = Math.floor((count - 1) / 5) * 5;
  return `${milestone > 0 ? milestone : 5}+`;
}

/**
 * Deduplicates lab-relevant publications so that papers co-authored by multiple
 * members of the lab only appear once.
 * 
 * 1. Uses DOI (primary globally-unique identifier) to identify duplicate entries.
 * 2. Uses normalized Title (or Title + Year) as a fallback when DOI is absent.
 * 3. Intelligently merges metadata (preserves featured flag, DOI, URLs, and richer author/venue text).
 */
export function getUniqueLabPublications(publications: Publication[]): Publication[] {
  if (!Array.isArray(publications)) return [];

  // Include only publications marked as lab-relevant
  const labRelevant = publications.filter((p) => p.isLabRelevant !== false);
  const seenDoiMap = new Map<string, Publication>();
  const seenTitleMap = new Map<string, Publication>();
  const uniqueList: Publication[] = [];

  for (const pub of labRelevant) {
    const normDoi = normalizeDoi(pub.doi);
    const normTitle = normalizeTitle(pub.title);
    const titleKey = normTitle.length >= 15 
      ? normTitle 
      : (normTitle ? `${normTitle}::${(pub.year || '').trim()}` : '');

    let existing: Publication | undefined;

    // 1. Primary match: by DOI
    if (normDoi && seenDoiMap.has(normDoi)) {
      existing = seenDoiMap.get(normDoi);
    }
    // 2. Fallback match: by Title (or Title + Year)
    else if (titleKey && seenTitleMap.has(titleKey)) {
      existing = seenTitleMap.get(titleKey);
    }

    if (existing) {
      // Merge best fields from duplicates
      if (pub.featured) existing.featured = true;
      if (!existing.doi && pub.doi) existing.doi = pub.doi;
      if (!existing.url && pub.url) existing.url = pub.url;
      if (
        (!existing.venue || existing.venue === 'Scholarly Publication') &&
        pub.venue &&
        pub.venue !== 'Scholarly Publication'
      ) {
        existing.venue = pub.venue;
      }
      if ((pub.authors?.length || 0) > (existing.authors?.length || 0)) {
        existing.authors = pub.authors;
      }

      // Link any newly discovered DOI or title key
      if (normDoi && !seenDoiMap.has(normDoi)) {
        seenDoiMap.set(normDoi, existing);
      }
      if (titleKey && !seenTitleMap.has(titleKey)) {
        seenTitleMap.set(titleKey, existing);
      }
    } else {
      const copy: Publication = { ...pub };
      uniqueList.push(copy);
      if (normDoi) {
        seenDoiMap.set(normDoi, copy);
      }
      if (titleKey) {
        seenTitleMap.set(titleKey, copy);
      }
    }
  }

  return uniqueList;
}
