import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { shelfLabel, type Book } from '../../data/library';
import { BookStory, WritingNotes } from './BookText';

// The book in Zhi's hands doesn't open like the shelf books. There's no 3D model: it's held up
// cover-first. It lifts out of the photo (from the outline around the book in Zhi's hands) to
// the middle of the screen, with Zhi's notes about it alongside. Closing plays that in reverse.

interface Elements {
  backdrop: HTMLDivElement;
  book: HTMLElement;
  text: HTMLDivElement;
}

function buildTimeline({ backdrop, book, text }: Elements, id: string, reducedMotion: boolean) {
  const tl = gsap.timeline({ paused: true });
  if (reducedMotion) return tl.fromTo([backdrop, book, text], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 });

  const end = book.getBoundingClientRect();
  const start = document.querySelector(`[data-book-origin="${id}"]`)?.getBoundingClientRect();
  const from =
    start && start.width > 0
      ? {
          // Same size and place as the book in the photo, tipped as if it's being lifted out of Zhi's hands.
          x: start.left + start.width / 2 - (end.left + end.width / 2),
          y: start.top + start.height / 2 - (end.top + end.height / 2),
          scale: start.height / end.height,
          rotation: -8,
        }
      : // Opened from the catalog or on a phone, where the photo's book isn't on screen.
        { x: 0, y: 24, scale: 0.92, rotation: 0 };
  return tl
    .fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power1.out' }, 0)
    .fromTo(book, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: 'power1.out' }, 0)
    .fromTo(book, from, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.85, ease: 'power3.inOut' }, 0)
    .fromTo(text, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.6);
}

interface ReadingViewProps {
  /** The book Zhi is reading, if it should be open; null to close. */
  book: Book | null;
  byId: Map<string, Book>;
  isDraft: (book: Book) => boolean;
  showNotes: boolean;
  reducedMotion: boolean;
  onClose: () => void;
  /** Which book the view is showing (including while it animates). */
  onDisplayedChange: (id: string | null) => void;
}

export function ReadingView(props: ReadingViewProps) {
  const { byId, isDraft, showNotes } = props;
  const [shown, setShown] = useState<Book | null>(null);

  const backdropRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const closingRef = useRef(false);

  // Latest props for effects that should only re-run when `shown` changes.
  const latest = useRef(props);
  useLayoutEffect(() => {
    latest.current = props;
  });

  const elements = useCallback(
    (): Elements | null =>
      backdropRef.current && bookRef.current && textRef.current
        ? { backdrop: backdropRef.current, book: bookRef.current, text: textRef.current }
        : null,
    [],
  );

  // Open whatever is shown.
  useLayoutEffect(() => {
    const els = elements();
    if (!shown || !els) return;
    const tl = buildTimeline(els, shown.id, latest.current.reducedMotion);
    tlRef.current = tl;
    closingRef.current = false;
    latest.current.onDisplayedChange(shown.id);
    tl.eventCallback('onComplete', () => titleRef.current?.focus({ preventScroll: true })).play();
  }, [shown, elements]);

  // Reconcile: when the book is cleared, play the opening backwards, then unmount.
  useEffect(() => {
    const book = props.book;
    if (!shown) {
      if (book) setShown(book);
      return;
    }
    const tl = tlRef.current;
    if (book?.id === shown.id) {
      // Asked to reopen mid-close: turn around.
      if (closingRef.current && tl) {
        closingRef.current = false;
        tl.eventCallback('onReverseComplete', null).play();
      }
      return;
    }
    if (closingRef.current || !tl) return;

    let closing = tl;
    const els = elements();
    if (!tl.isActive() && els) {
      // Rebuild from where the photo's book is now (the window may have changed size).
      tl.kill();
      closing = buildTimeline(els, shown.id, latest.current.reducedMotion).progress(1);
      tlRef.current = closing;
    }
    closingRef.current = true;
    closing.eventCallback('onReverseComplete', () => {
      tlRef.current?.kill();
      tlRef.current = null;
      latest.current.onDisplayedChange(null);
      setShown(null);
    });
    closing.reverse();
  }, [props.book, shown, elements]);

  useEffect(() => {
    if (!shown) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      latest.current.onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shown]);

  if (!shown) return null;

  const titleId = `reading-title-${shown.id}`;
  const plainCover = { '--c': shown.binding.color } as CSSProperties;

  return (
    <div className="reading" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="reading__backdrop" ref={backdropRef} />
      <div className="reading__scroll">
        <div
          className="reading__layout"
          onClick={(event) => {
            if (event.target === event.currentTarget) latest.current.onClose();
          }}
        >
          <figure className="reading__book" ref={bookRef}>
            {shown.image ? (
              <img src={shown.image.src} alt={shown.image.alt} draggable={false} />
            ) : (
              // No cover photo yet (a draft): a plain cloth cover with the title.
              <div className="reading__plain cover" data-texture={shown.binding.texture} style={plainCover}>
                <div className="cover__frame">
                  <p className="cover__title">{shown.title}</p>
                </div>
              </div>
            )}
          </figure>
          <div className="reading__text" ref={textRef}>
            <p className="reading__kicker">{shelfLabel(shown.shelf)}</p>
            <h2 id={titleId} ref={titleRef} tabIndex={-1} className="reading__title">
              {shown.title}
            </h2>
            {shown.facts?.length ? (
              <dl className="reading__facts">
                {shown.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {shown.dates && <p className="reading__dates">{shown.dates}</p>}
            <BookStory book={shown} byId={byId} />
            {showNotes && <WritingNotes book={shown} draft={isDraft(shown)} />}
          </div>
        </div>
      </div>
      <button type="button" className="spread__close" onClick={() => latest.current.onClose()}>
        Close
      </button>
    </div>
  );
}
