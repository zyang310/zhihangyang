import { useCallback, useEffect, useRef, useState } from 'react';
import { BOOKS } from './data/books';
import { hasQueryFlag, isReady, lifeVolumes, type Book } from './data/library';
import { useLibraryState } from './hooks/useLibraryState';
import { useMediaQuery } from './hooks/useMediaQuery';
import { Stage } from './components/library/Stage';
import { BookSpread } from './components/library/BookSpread';
import { Nameplate } from './components/library/Nameplate';
import { CardCatalog } from './components/library/CardCatalog';

// Unfinished books show in development, or anywhere with ?drafts.
const showDrafts = import.meta.env.DEV || hasQueryFlag('drafts');
const debug = hasQueryFlag('debug');
const books = showDrafts ? BOOKS : BOOKS.filter(isReady);
const volumes = lifeVolumes(books);
const isDraft = (book: Book) => !isReady(book);

function App() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const library = useLibraryState(books, reducedMotion);
  const [displayedId, setDisplayedId] = useState<string | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const chromeRef = useRef<HTMLDivElement>(null);
  const catalogButtonRef = useRef<HTMLButtonElement>(null);
  const previousDisplayed = useRef<string | null>(null);

  // While a book or the catalog is open, the shelf behind it is inert. When a book
  // goes back on the shelf, focus returns to it.
  useEffect(() => {
    const chrome = chromeRef.current;
    chrome?.toggleAttribute('inert', displayedId !== null || catalogOpen);
    const previous = previousDisplayed.current;
    previousDisplayed.current = displayedId;
    if (previous && !displayedId && !catalogOpen) {
      chrome?.querySelector<HTMLElement>(`[data-book-id="${previous}"]`)?.focus({ preventScroll: true });
    }
  }, [displayedId, catalogOpen]);

  const closeCatalog = useCallback(() => {
    setCatalogOpen(false);
    requestAnimationFrame(() => catalogButtonRef.current?.focus({ preventScroll: true }));
  }, []);

  return (
    <>
      <div ref={chromeRef}>
        <Stage
          books={books}
          volumes={volumes}
          isDraft={isDraft}
          hiddenId={displayedId}
          introDone={library.introDone}
          onIntroDone={library.finishIntro}
          onOpen={library.open}
          zoomShelf={library.zoomShelf}
          onZoomShelf={library.setZoomShelf}
          reducedMotion={reducedMotion}
          debug={debug}
        />
        <Nameplate ref={catalogButtonRef} onOpenCatalog={() => setCatalogOpen(true)} />
      </div>
      <BookSpread
        book={library.openBook}
        byId={library.byId}
        volumes={volumes}
        isDraft={isDraft}
        showNotes={showDrafts}
        reducedMotion={reducedMotion}
        onClose={library.close}
        onDisplayedChange={setDisplayedId}
      />
      <CardCatalog open={catalogOpen} books={books} volumes={volumes} isDraft={isDraft} onClose={closeCatalog} />
    </>
  );
}

export default App;
