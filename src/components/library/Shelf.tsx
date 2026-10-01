import type { Book as BookData } from '../../data/library';
import type { ShelfGeometry } from '../../data/scene';
import { Book } from './Book';

interface ShelfProps {
  geometry: ShelfGeometry;
  label: string;
  books: BookData[];
  volumes: Map<string, string>;
  isDraft: (book: BookData) => boolean;
  hiddenId: string | null;
  onActivate: (book: BookData) => void;
  onHover: (book: BookData | null, element?: HTMLElement) => void;
  /** Phones: tapping the shelf (not a book) zooms to it. */
  onShelfClick?: () => void;
}

/** Consecutive stacked books lie in one pile; standing books get a group each. */
function groupBooks(books: BookData[]): BookData[][] {
  const groups: BookData[][] = [];
  for (const book of books) {
    const last = groups[groups.length - 1];
    if (book.binding.stacked && last?.[0].binding.stacked) last.push(book);
    else groups.push([book]);
  }
  return groups;
}

export function Shelf({ geometry: g, label, books, volumes, isDraft, hiddenId, onActivate, onHover, onShelfClick }: ShelfProps) {
  const renderBook = (book: BookData) => (
    <Book
      key={book.id}
      book={book}
      shelfHeight={g.height}
      volume={volumes.get(book.id)}
      draft={isDraft(book)}
      hidden={hiddenId === book.id}
      onActivate={onActivate}
      onHover={onHover}
    />
  );

  return (
    <>
      <section
        className="lib-shelf"
        aria-label={label}
        style={{ left: `${g.left}%`, width: `${g.right - g.left}%`, bottom: `${100 - g.baseline}%`, height: `${g.height}%` }}
        onClick={
          onShelfClick &&
          ((event) => {
            if (!(event.target as Element).closest('.lib-book')) onShelfClick();
          })
        }
      >
        <div className="lib-row" data-shelf-row={g.id}>
          <span className="lib-bookend lib-bookend--l" aria-hidden="true" />
          {groupBooks(books).map((group) =>
            group[0].binding.stacked ? (
              <div className="lib-stack" key={group[0].id}>
                {group.map(renderBook)}
              </div>
            ) : (
              renderBook(group[0])
            ),
          )}
          <span className="lib-bookend lib-bookend--r" aria-hidden="true" />
        </div>
      </section>
      <div className="lib-label" style={{ left: `${(g.left + g.right) / 2}%`, top: `${g.labelY}%` }} aria-hidden="true">
        {label}
      </div>
    </>
  );
}
