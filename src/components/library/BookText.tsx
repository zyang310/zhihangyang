import { missingForLive, parseBody, shelfLabel, type Book } from '../../data/library';

/** The story paragraphs; [[id|text]] references become links that pull the other book. */
export function BookStory({ book, byId }: { book: Book; byId: Map<string, Book> }) {
  const paragraphs = parseBody(book.body);
  if (!paragraphs.length) return null;
  return (
    <div className="page__story">
      {paragraphs.map((parts, i) => (
        <p key={i}>
          {parts.map((part, j) => {
            if (typeof part === 'string') return part;
            const target = byId.get(part.id);
            return target ? (
              <a key={j} className="page__xref" href={`#${target.shelf}/${target.id}`}>
                {part.text}
              </a>
            ) : (
              part.text
            );
          })}
        </p>
      ))}
    </div>
  );
}

/** Left page: facts, links, and image, or a frontispiece for books without them. */
export function BookFacts({ book, volume, compact = false }: { book: Book; volume?: string; compact?: boolean }) {
  const hasDetails = Boolean(book.facts?.length || book.links?.length || book.image || book.gallery?.length);
  const year = /\d{4}/.exec(book.dates)?.[0];

  if (!hasDetails) {
    if (compact) return null;
    return (
      <div className="page__frontis">
        <p className="page__kicker">{shelfLabel(book.shelf)}</p>
        {volume && <p className="page__frontis-vol">Volume {volume}</p>}
        {year && <p className="page__frontis-year">{year}</p>}
        <p className="page__ornament" aria-hidden="true">
          ❦
        </p>
      </div>
    );
  }

  return (
    <div className={compact ? 'page__facts page__facts--compact' : 'page__facts'}>
      {!compact && <p className="page__kicker">{shelfLabel(book.shelf)}</p>}
      {book.image && (
        <figure className="page__figure">
          <img src={book.image.src} alt={book.image.alt} />
        </figure>
      )}
      {book.gallery?.length ? (
        <div className="page__gallery">
          {book.gallery.map((photo) => (
            <a key={photo.src} href={photo.src} target="_blank" rel="noreferrer">
              <img src={photo.src} alt={photo.alt} />
            </a>
          ))}
        </div>
      ) : null}
      {book.facts?.length ? (
        <dl>
          {book.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {book.links?.length ? (
        <ul className="page__links">
          {book.links.map((link) => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {!compact && (
        <p className="page__ornament" aria-hidden="true">
          ❦
        </p>
      )}
    </div>
  );
}

/** Development only: what's missing before the book goes live, plus the writing prompts. */
export function WritingNotes({ book, draft }: { book: Book; draft: boolean }) {
  const missing = missingForLive(book);
  if (!draft && !book.prompts?.length) return null;
  return (
    <aside className="page__notes">
      {draft ? (
        <p>
          <strong>Draft.</strong> Hidden on the live site until it has {missing.join(' and ')}.
        </p>
      ) : (
        <p>
          <strong>Writing notes</strong> (only visible in development).
        </p>
      )}
      {book.prompts?.length ? (
        <>
          <p>{draft ? 'To finish it, answer:' : 'Ideas to make it stronger:'}</p>
          <ul>
            {book.prompts.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ul>
        </>
      ) : null}
    </aside>
  );
}
