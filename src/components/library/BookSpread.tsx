import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { bookSize, shelfLabel, type Book } from '../../data/library';
import { BookFacts, BookStory, WritingNotes } from './BookText';
import { SpineContent } from './SpineContent';

// The open book is a second, larger 3D book in a fixed overlay. Opening starts it exactly
// over the shelf book's spine (rotated 90° so its spine faces us), then turns it to show the
// cover, flies it to the center, and swings the cover open. Closing plays that in reverse.

type Mode = 'spread' | 'single';
interface Dims {
  mode: Mode;
  W: number;
  H: number;
  T: number;
}

interface Elements {
  root: HTMLDivElement;
  cover: HTMLDivElement;
  backdrop: HTMLDivElement;
}

function measure(book: Book): Dims {
  const { ratio } = bookSize(book, 1);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spreadH = Math.min(vh * 0.8, 720);
  const spreadW = spreadH * 0.7;
  if (vw >= spreadW * 2 + 96 && vh >= 460) return { mode: 'spread', W: spreadW, H: spreadH, T: spreadH * ratio };
  const W = Math.min(vw - 28, 560);
  const H = Math.min(vh - 140, W / 0.55);
  return { mode: 'single', W, H, T: H * ratio };
}

function openPose(d: Dims) {
  const closedX = Math.round(window.innerWidth / 2 - d.W / 2);
  return {
    closedX,
    openX: d.mode === 'spread' ? Math.round(window.innerWidth / 2) : closedX,
    y: Math.round(window.innerHeight / 2 - d.H / 2),
  };
}

/** Where the book starts its flight: its spine on the shelf, or its cover in Zhi's hands in the armchair. */
function origin(id: string): { rect: DOMRect; facing: 'spine' | 'cover' } | null {
  const spine = document.querySelector(`[data-book-id="${id}"] .lib-spine`)?.getBoundingClientRect();
  if (spine && spine.width > 0) return { rect: spine, facing: 'spine' };
  const cover = document.querySelector(`[data-book-origin="${id}"]`)?.getBoundingClientRect();
  if (cover && cover.width > 0) return { rect: cover, facing: 'cover' };
  return null;
}

function buildTimeline({ root, cover, backdrop }: Elements, book: Book, d: Dims, reducedMotion: boolean) {
  const pose = openPose(d);
  const start = reducedMotion ? null : origin(book.id);
  const tl = gsap.timeline({ paused: true });
  gsap.set(cover, { z: d.T / 2, rotationY: 0, autoAlpha: 1, transformOrigin: '0% 50%' });

  if (!start) {
    gsap.set(root, { x: pose.openX, y: pose.y, z: -d.T / 2, '--zoom': 1, rotation: 0, rotationY: 0, transformOrigin: '0% 50%' });
    gsap.set(cover, { rotationY: -180, autoAlpha: d.mode === 'single' ? 0 : 1 });
    return tl.fromTo([backdrop, root], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: 'power1.out' });
  }

  const { rect } = start;
  if (start.facing === 'spine') {
    // Pivot on the spine: with the origin at the left edge, rotateY(90°) leaves the spine facing us.
    const stacked = Boolean(book.binding.stacked);
    gsap.set(root, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2 - d.H / 2,
      z: 0,
      '--zoom': (stacked ? rect.width : rect.height) / d.H,
      rotation: stacked ? -90 : 0,
      rotationY: 90,
      autoAlpha: 1,
      transformOrigin: '0% 50%',
    });
  } else {
    // The photo's book can't leave Zhi's hands, so this one fades in over it, cover first.
    gsap.set(root, {
      x: rect.left,
      y: rect.top + rect.height / 2 - d.H / 2,
      z: 0,
      '--zoom': rect.height / d.H,
      rotation: 0,
      rotationY: 0,
      autoAlpha: 0,
      transformOrigin: '0% 50%',
    });
    tl.to(root, { autoAlpha: 1, duration: 0.25, ease: 'power1.out' }, 0);
  }
  tl.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power1.out' }, 0)
    .to(root, { x: pose.closedX, y: pose.y, '--zoom': 1, rotation: 0, rotationY: 0, duration: 0.85, ease: 'power3.inOut' }, 0)
    .to(cover, { rotationY: -180, duration: 0.95, ease: 'power2.inOut' }, 0.72)
    // Settle the open pages at z = 0 so the text renders crisply.
    .to(root, { x: pose.openX, z: -d.T / 2, duration: 0.8, ease: 'power2.inOut' }, 0.85);
  if (d.mode === 'single') tl.to(cover, { autoAlpha: 0, duration: 0.3 }, 1.4);
  return tl;
}

interface BookSpreadProps {
  /** The book that should be open; null to close. */
  book: Book | null;
  byId: Map<string, Book>;
  volumes: Map<string, string>;
  isDraft: (book: Book) => boolean;
  showNotes: boolean;
  reducedMotion: boolean;
  onClose: () => void;
  /** Which book the overlay is showing (including while it animates). */
  onDisplayedChange: (id: string | null) => void;
}

export function BookSpread(props: BookSpreadProps) {
  const { book, byId, volumes, isDraft, showNotes } = props;
  const [shown, setShown] = useState<Book | null>(null);
  const [dims, setDims] = useState<Dims | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const phaseRef = useRef<'idle' | 'opening' | 'open' | 'closing'>('idle');

  // Latest props/dims for effects that should only re-run when `shown` changes.
  const latest = useRef(props);
  const dimsRef = useRef(dims);
  useLayoutEffect(() => {
    latest.current = props;
    dimsRef.current = dims;
  });

  const elements = useCallback(
    (): Elements | null =>
      rootRef.current && coverRef.current && backdropRef.current
        ? { root: rootRef.current, cover: coverRef.current, backdrop: backdropRef.current }
        : null,
    [],
  );

  const show = useCallback((next: Book | null) => {
    setShown(next);
    setDims(next ? measure(next) : null);
  }, []);

  const onOpened = useCallback(() => {
    phaseRef.current = 'open';
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  // Open whatever is shown.
  useLayoutEffect(() => {
    const d = dimsRef.current;
    const els = elements();
    if (!shown || !d || !els) return;
    const tl = buildTimeline(els, shown, d, latest.current.reducedMotion);
    tlRef.current = tl;
    phaseRef.current = 'opening';
    latest.current.onDisplayedChange(shown.id);
    tl.eventCallback('onComplete', onOpened);
    tl.play();
  }, [shown, elements, onOpened]);

  // Reconcile: when the requested book differs from the shown one, close the shown one first.
  // Once it's back on the shelf, `shown` becomes null and this opens the requested book.
  useEffect(() => {
    const tl = tlRef.current;
    if (shown?.id === book?.id) {
      // Asked to reopen the book that's mid-close: turn around.
      if (shown && tl && phaseRef.current === 'closing') {
        phaseRef.current = 'opening';
        tl.eventCallback('onReverseComplete', null).eventCallback('onComplete', onOpened).play();
      }
      return;
    }
    if (!shown) {
      show(book);
      return;
    }
    if (phaseRef.current === 'closing') return;

    let closing = tl;
    if (phaseRef.current !== 'opening' || !closing) {
      // Rebuild from where the shelf book is now (the window may have resized or zoomed).
      const els = elements();
      if (!els || !dims) return;
      closing?.kill();
      closing = buildTimeline(els, shown, dims, latest.current.reducedMotion).progress(1);
      tlRef.current = closing;
    }
    phaseRef.current = 'closing';
    closing.eventCallback('onReverseComplete', () => {
      phaseRef.current = 'idle';
      tlRef.current?.kill();
      tlRef.current = null;
      latest.current.onDisplayedChange(null);
      show(null);
    });
    closing.reverse();
  }, [book, shown, dims, show, elements, onOpened]);

  // Keep the open book centered when the window changes size.
  useEffect(() => {
    if (!shown) return;
    const onResize = () => setDims(measure(shown));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [shown]);

  useLayoutEffect(() => {
    if (!dims || phaseRef.current !== 'open') return;
    const pose = openPose(dims);
    gsap.set(rootRef.current, { x: pose.openX, y: pose.y, z: -dims.T / 2 });
    gsap.set(coverRef.current, { z: dims.T / 2, autoAlpha: dims.mode === 'single' ? 0 : 1 });
  }, [dims]);

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

  if (!shown || !dims) return null;

  const volume = volumes.get(shown.id);
  const draft = isDraft(shown);
  const titleId = `book-title-${shown.id}`;
  const style = {
    '--W': `${dims.W}px`,
    '--H': `${dims.H}px`,
    '--T': `${dims.T}px`,
    '--sw': `${dims.T}px`,
    '--sh': `${dims.H}px`,
    '--c': shown.binding.color,
  } as CSSProperties;

  return (
    <div className="spread" data-mode={dims.mode} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="spread__backdrop" ref={backdropRef} onClick={() => latest.current.onClose()} />
      <div className="spread__stage">
        <div className="obook" ref={rootRef} style={style} data-texture={shown.binding.texture}>
          <div className="obook__body">
            <div className="obook__face obook__back" />
            <div className="obook__face obook__spine spine" aria-hidden="true">
              <SpineContent book={shown} volume={volume} />
            </div>
            <div className="obook__face obook__fore" />
            <div className="obook__face obook__top" />

            <div className="obook__face obook__page page page--right">
              <div className="page__scroll">
                <header className="page__header">
                  <p className="page__kicker">
                    {shelfLabel(shown.shelf)}
                    {volume && ` · Volume ${volume}`}
                  </p>
                  <h2 id={titleId} ref={titleRef} tabIndex={-1} className="page__title">
                    {shown.title}
                  </h2>
                  {shown.dates && <p className="page__dates">{shown.dates}</p>}
                </header>
                {dims.mode === 'single' && <BookFacts book={shown} volume={volume} compact />}
                <BookStory book={shown} byId={byId} />
                {showNotes && <WritingNotes book={shown} draft={draft} />}
              </div>
            </div>

            <div className="obook__cover" ref={coverRef}>
              <div className="obook__face obook__cover-front cover" aria-hidden="true">
                <div className="cover__frame">
                  <p className="cover__kicker">{shelfLabel(shown.shelf)}</p>
                  {volume && <p className="cover__vol">Volume {volume}</p>}
                  <p className="cover__title">{shown.title}</p>
                  <p className="cover__dates">{shown.dates}</p>
                </div>
              </div>
              <div className="obook__face obook__cover-inside page page--left">
                {dims.mode === 'spread' && (
                  <div className="page__scroll">
                    <BookFacts book={shown} volume={volume} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <button type="button" className="spread__close" onClick={() => latest.current.onClose()}>
        Close
      </button>
    </div>
  );
}
