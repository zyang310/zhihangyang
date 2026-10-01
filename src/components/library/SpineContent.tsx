import type { Book } from '../../data/library';

/** What's printed on a spine. Sizes come from --sw/--sh, so the shelf book and the open book match. */
export function SpineContent({ book, volume }: { book: Book; volume?: string }) {
  const year = /\d{4}/.exec(book.dates)?.[0];
  return (
    <>
      {volume && <span className="spine-vol">{volume}</span>}
      <span className="spine-title">{book.title}</span>
      {year && <span className="spine-year">{year}</span>}
    </>
  );
}
