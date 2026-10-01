import { useCallback, useEffect, useRef, useState } from 'react';
import { BOOKS } from './data/books';
import { hasQueryFlag, isReady, lifeVolumes, type Book } from './data/library';
import { useLibraryState } from './hooks/useLibraryState';
import { useMediaQuery } from './hooks/useMediaQuery';
import { Stage } from './components/library/Stage';
import { BookSpread } from './components/library/BookSpread';
import { Nameplate } from './components/library/Nameplate';
import { CardCatalog } from './components/library/CardCatalog';
import { HostDialogue } from './components/library/HostDialogue';
import { GREETING, type Choice } from './data/host';

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

  // Zhi's dialogue: which part of the conversation is showing, and whether it should take focus
  // (yes when the visitor clicked Zhi, no when Zhi greets on their own).
  const [dialogue, setDialogue] = useState<{ node: string; takeFocus: boolean } | null>(null);
  const greet = useCallback(() => setDialogue({ node: GREETING, takeFocus: true }), []);
  const closeDialogue = useCallback(() => setDialogue(null), []);
  const { introDone, greetOnArrival, markGreeted, open, setZoom, byId } = library;

  // Each new visitor gets a greeting once, a moment after the books settle.
  useEffect(() => {
    if (!introDone || !greetOnArrival) return;
    const timer = window.setTimeout(() => {
      markGreeted();
      setDialogue((current) => current ?? { node: GREETING, takeFocus: false });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [introDone, greetOnArrival, markGreeted]);

  // A book or the catalog takes over the screen, so Zhi stops talking.
  useEffect(() => {
    if (displayedId || catalogOpen) setDialogue(null);
  }, [displayedId, catalogOpen]);

  const choose = useCallback(
    (choice: Choice) => {
      if ('next' in choice) {
        setDialogue({ node: choice.next, takeFocus: true });
        return;
      }
      setDialogue(null);
      if ('open' in choice) open(choice.open);
      else if ('browse' in choice) setZoom('bookcase');
    },
    [open, setZoom],
  );
  const canOpen = useCallback((id: string) => byId.has(id), [byId]);

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
          zoom={library.zoom}
          onZoom={setZoom}
          onGreet={greet}
          dialogueOpen={dialogue !== null}
          reducedMotion={reducedMotion}
          debug={debug}
        />
        <Nameplate ref={catalogButtonRef} onOpenCatalog={() => setCatalogOpen(true)} />
        {dialogue && (
          <HostDialogue
            key={dialogue.node}
            node={dialogue.node}
            takeFocus={dialogue.takeFocus}
            reducedMotion={reducedMotion}
            canOpen={canOpen}
            onChoose={choose}
            onClose={closeDialogue}
          />
        )}
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
