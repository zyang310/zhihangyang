// Types and helpers for the bookshelf. The content itself lives in books.ts.

/** 'reading' isn't on the bookcase: it's the book in Zhi's hands in the armchair. */
export type ShelfId = 'life' | 'experience' | 'projects' | 'reading';

export const SHELVES: { id: ShelfId; label: string }[] = [
  { id: 'life', label: 'Life Story' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'reading', label: 'Currently Reading' },
];

export function shelfLabel(id: ShelfId): string {
  return SHELVES.find((shelf) => shelf.id === id)?.label ?? id;
}

export interface Binding {
  texture: 'cloth' | 'leather';
  color: string;
  /** Share of the shelf's usable height, 0–1. */
  height: number;
  /** Spine thickness as a share of the book's height. Derived from the word count when omitted. */
  thickness?: number;
  /** Lie flat in a stack instead of standing. */
  stacked?: boolean;
}

export interface Book {
  /** Used in the URL: #<shelf>/<id> */
  id: string;
  shelf: ShelfId;
  title: string;
  dates: string;
  binding: Binding;
  /** Paragraphs separated by blank lines. [[book-id|text]] links to another book. */
  body: string;
  facts?: { label: string; value: string }[];
  links?: { label: string; href: string }[];
  image?: { src: string; alt: string };
  /** Writing prompts shown on unfinished books in development. */
  prompts?: string[];
}

export const PROMPTS = {
  life: [
    'What happened this year: spring, summer, and fall?',
    'What changed for you?',
    'Which other books (projects, experience) does it connect to?',
  ],
  experience: [
    'Where and when?',
    'Three concrete things you did.',
    'What changed because of you? Numbers help.',
    'What did you learn?',
  ],
  project: [
    'What problem does it solve, and for whom?',
    'What did you build?',
    'What was your role, and how big was the team?',
    'What stack did you use?',
    'What was the hardest decision or bug?',
    'What was the result? Add a link and a screenshot.',
  ],
  reading: [
    'Title and author (put the author in facts).',
    'Why did you pick it up?',
    'One idea that has stuck with you so far.',
  ],
};

/** A book appears on the live site once it has a title, dates, and at least this many words. */
export const MIN_WORDS = 40;

const XREF = /\[\[([\w-]+)(?:\|([^\]]+))?\]\]/g;

export type Inline = string | { id: string; text: string };

export function parseBody(body: string): Inline[][] {
  return body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .map((paragraph) => {
      const parts: Inline[] = [];
      let last = 0;
      for (const match of paragraph.matchAll(XREF)) {
        if (match.index > last) parts.push(paragraph.slice(last, match.index));
        parts.push({ id: match[1], text: match[2] ?? match[1] });
        last = match.index + match[0].length;
      }
      if (last < paragraph.length) parts.push(paragraph.slice(last));
      return parts;
    });
}

export function plainText(body: string): string {
  return body.replace(XREF, (_, id: string, text?: string) => text ?? id).replace(/\s+/g, ' ').trim();
}

export function wordCount(body: string): number {
  const text = plainText(body);
  return text ? text.split(' ').length : 0;
}

export function isReady(book: Book): boolean {
  return Boolean(book.title.trim() && book.dates.trim()) && wordCount(book.body) >= MIN_WORDS;
}

/** Book size in % of the frame height: h = height, t = spine thickness, d = depth (cover width). */
export function bookSize(book: Book, shelfHeight: number) {
  const h = shelfHeight * book.binding.height;
  const ratio = book.binding.thickness ?? 0.1 + (0.13 * Math.min(wordCount(book.body), 240)) / 240;
  return { h, t: h * ratio, d: h * 0.68, ratio };
}

export function toRoman(n: number): string {
  const numerals: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let out = '';
  for (const [value, numeral] of numerals) {
    while (n >= value) {
      out += numeral;
      n -= value;
    }
  }
  return out;
}

/** Volume numbers for the Life Story set, in shelf order. */
export function lifeVolumes(books: Book[]): Map<string, string> {
  return new Map(books.filter((b) => b.shelf === 'life').map((b, i) => [b.id, toRoman(i + 1)]));
}

export function hasQueryFlag(name: string): boolean {
  return new URLSearchParams(window.location.search).has(name);
}
