import { Publication } from './types';

/**
 * Parses BibTeX text (such as exported from Google Scholar) into clean Publication objects.
 */
export function parseGoogleScholarBibTeX(
  bibtexString: string,
  personId: string,
  personName: string
): Publication[] {
  if (!bibtexString || !bibtexString.trim()) return [];

  const publications: Publication[] = [];
  // Regex to match BibTeX entries: @type{key, fields...}
  const entryRegex = /@([a-zA-Z]+)\s*\{\s*([^,]*),([\s\S]*?)(?=(?:\r?\n@[a-zA-Z]+\s*\{)|\s*$)/g;
  let match;

  const cleanLatex = (str: string): string => {
    return str
      .replace(/\\&/g, '&')
      .replace(/\\%/g, '%')
      .replace(/\\_/g, '_')
      .replace(/\\#/g, '#')
      .replace(/[{}]/g, '')
      .replace(/[\r\n]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  while ((match = entryRegex.exec(bibtexString)) !== null) {
    const rawType = match[1].toLowerCase();
    const body = match[3];

    // Helper to extract a BibTeX field
    const getField = (fieldName: string): string => {
      // Matches field = {value} or field = "value"
      const bracedRegex = new RegExp(`${fieldName}\\s*=\\s*[{"]([\\s\\S]*?)[}"]`, 'i');
      const bm = body.match(bracedRegex);
      if (bm) return cleanLatex(bm[1]);

      // Matches field = value
      const unbracedRegex = new RegExp(`${fieldName}\\s*=\\s*([^,\\r\\n}]+)`, 'i');
      const um = body.match(unbracedRegex);
      if (um) return cleanLatex(um[1]);

      return '';
    };

    const title = getField('title');
    if (!title) continue;

    const rawAuthors = getField('author');
    const authors = rawAuthors
      ? rawAuthors
          .split(/\s+and\s+/i)
          .map((a) => {
            const parts = a.split(',').map((p) => p.trim());
            return parts.length > 1 ? `${parts[1]} ${parts[0]}` : parts[0];
          })
          .join(', ')
      : personName;

    const journal = getField('journal');
    const booktitle = getField('booktitle');
    const publisher = getField('publisher');
    const organization = getField('organization');
    const venue = journal || booktitle || publisher || organization || 'Scholarly Publication';

    const year = getField('year') || String(new Date().getFullYear());
    const doi = getField('doi');
    const url = getField('url') || (doi ? `https://doi.org/${doi}` : '');

    const isConf =
      rawType.includes('inproceedings') ||
      rawType.includes('conference') ||
      venue.toLowerCase().includes('proc') ||
      venue.toLowerCase().includes('conf') ||
      venue.toLowerCase().includes('symp') ||
      venue.toLowerCase().includes('workshop');

    publications.push({
      id: `pub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      authors,
      venue,
      year,
      type: isConf ? 'Conference' : 'Journal',
      doi: doi || '',
      url: url || '',
      featured: false,
      isLabRelevant: false,
      personId,
      externalId: `scholar:bibtex:${title.substring(0, 35).toLowerCase().replace(/\W+/g, '')}`
    });
  }

  return publications;
}
