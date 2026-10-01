import { useEffect, useRef } from 'react';
import { SHELVES, plainText, type Book } from '../../data/library';

interface CardCatalogProps {
  open: boolean;
  books: Book[];
  volumes: Map<string, string>;
  isDraft: (book: Book) => boolean;
  onClose: () => void;
}

function snippet(body: string, words = 22): string {
  const all = plainText(body).split(' ').filter(Boolean);
  return all.length > words ? `${all.slice(0, words).join(' ')}…` : all.join(' ');
}

/** A plain list of every book, grouped by shelf: the fast path past the 3D shelf. */
export function CardCatalog({ open, books, volumes, isDraft, onClose }: CardCatalogProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!open) return;
    headingRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="catalog-title">
      <div className="catalog-fade absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="catalog-panel absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper-100 text-ink-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink-900/15 px-6 py-4">
          <h2 id="catalog-title" ref={headingRef} tabIndex={-1} className="font-book text-2xl font-semibold tracking-wide outline-none">
            Card catalog
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-sm px-2 py-1 font-catalog text-xs tracking-[0.2em] text-ink-700 uppercase hover:bg-ink-900/5 focus-visible:bg-ink-900/5 focus-visible:outline-none"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {SHELVES.map((shelf) => {
            const list = books.filter((book) => book.shelf === shelf.id);
            if (!list.length) return null;
            return (
              <section key={shelf.id} className="mb-7" aria-labelledby={`catalog-${shelf.id}`}>
                <h3 id={`catalog-${shelf.id}`} className="mb-3 font-catalog text-xs tracking-[0.2em] text-ink-500 uppercase">
                  {shelf.label}
                </h3>
                <ul className="space-y-2.5">
                  {list.map((book) => (
                    <li key={book.id}>
                      <a href={`#${book.shelf}/${book.id}`} onClick={onClose} className="catalog-card block">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="font-book text-lg leading-snug font-semibold">
                            {volumes.has(book.id) && <span className="mr-1.5 font-normal text-ink-500">{volumes.get(book.id)}.</span>}
                            {book.title}
                          </span>
                          <span className="shrink-0 font-catalog text-xs text-ink-500">{book.dates || 'n.d.'}</span>
                        </span>
                        {book.body && (
                          <span className="mt-1 block font-book text-[0.95rem] leading-snug text-ink-700">{snippet(book.body)}</span>
                        )}
                        {isDraft(book) && (
                          <span className="mt-1.5 inline-block font-catalog text-[0.65rem] tracking-[0.18em] text-[#8c2a1c] uppercase">
                            Draft · dev only
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
