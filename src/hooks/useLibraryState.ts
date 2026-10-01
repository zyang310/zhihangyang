import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Book, ShelfId } from '../data/library';

// Which book is open lives in the URL (#projects/bittle), so books are linkable and
// the browser's Back button closes them. Each book we open pushes a history entry
// tagged with its depth; closing pops all of them at once.

interface HistoryState {
  libraryDepth?: number;
}

/** Where the camera is zoomed: one shelf (phones), the whole bookcase, or nowhere (the room). */
export type ZoomTarget = ShelfId | 'bookcase';

// Once per browser session: the intro, and Zhi's greeting after it.
const INTRO_KEY = 'library:intro-seen';
const GREETED_KEY = 'library:greeted';

function sessionFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function setSessionFlag(key: string) {
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    // Storage unavailable (private mode); it just happens again next time.
  }
}

const cleanUrl = () => window.location.pathname + window.location.search;
const historyDepth = () => (window.history.state as HistoryState | null)?.libraryDepth ?? 0;

export function useLibraryState(books: Book[], reducedMotion: boolean) {
  const byId = useMemo(() => new Map(books.map((book) => [book.id, book])), [books]);

  const parseHash = useCallback(
    (hash: string): string | null => {
      const match = /^#([a-z]+)\/([\w-]+)$/.exec(hash);
      const book = match ? byId.get(match[2]) : undefined;
      return book && book.shelf === match?.[1] ? book.id : null;
    },
    [byId],
  );

  const [openId, setOpenId] = useState(() => parseHash(window.location.hash));
  const [introDone, setIntroDone] = useState(() => reducedMotion || openId !== null || sessionFlag(INTRO_KEY));
  // Someone following a link to a specific book came for that book, not a greeting.
  const [greetOnArrival] = useState(() => openId === null && !sessionFlag(GREETED_KEY));
  const [zoom, setZoom] = useState<ZoomTarget | null>(null);
  const closingRef = useRef(false);

  const open = useCallback(
    (id: string) => {
      const book = byId.get(id);
      if (!book) return;
      window.history.pushState({ libraryDepth: historyDepth() + 1 }, '', `#${book.shelf}/${book.id}`);
      setOpenId(id);
    },
    [byId],
  );

  const close = useCallback(() => {
    const depth = historyDepth();
    if (depth > 0) {
      closingRef.current = true;
      window.history.go(-depth);
      return;
    }
    window.history.replaceState(null, '', cleanUrl());
    setOpenId(null);
  }, []);

  // Back/forward buttons and hand-edited URLs.
  useEffect(() => {
    const sync = () => {
      if (closingRef.current) {
        closingRef.current = false;
        if (window.location.hash) window.history.replaceState(null, '', cleanUrl());
        setOpenId(null);
        return;
      }
      setOpenId(parseHash(window.location.hash));
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, [parseHash]);

  // Links to books anywhere on the page (cross-references, the card catalog) open them in place.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
      const id = link ? parseHash(link.getAttribute('href') ?? '') : null;
      if (!id) return;
      event.preventDefault();
      open(id);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [parseHash, open]);

  const finishIntro = useCallback(() => {
    setSessionFlag(INTRO_KEY);
    setIntroDone(true);
  }, []);

  const markGreeted = useCallback(() => setSessionFlag(GREETED_KEY), []);

  return {
    byId,
    openBook: openId ? (byId.get(openId) ?? null) : null,
    open,
    close,
    introDone,
    finishIntro,
    greetOnArrival,
    markGreeted,
    zoom,
    setZoom,
  };
}
