import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type WheelEvent,
} from 'react';
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

function spineRect(id: string): DOMRect | null {
  const spine = document.querySelector(`[data-book-id="${id}"] .lib-spine`);
  const rect = spine?.getBoundingClientRect();
  return rect && rect.width > 0 ? rect : null;
}

function buildTimeline({ root, cover, backdrop }: Elements, book: Book, d: Dims, reducedMotion: boolean) {
  const pose = openPose(d);
  const rect = reducedMotion ? null : spineRect(book.id);
  const tl = gsap.timeline({ paused: true });
  gsap.set(cover, { z: d.T / 2, rotationY: 0, autoAlpha: 1, transformOrigin: '0% 50%' });

  if (!rect) {
    gsap.set(root, { x: pose.openX, y: pose.y, z: -d.T / 2, '--zoom': 1, rotation: 0, rotationY: 0, transformOrigin: '0% 50%' });
    gsap.set(cover, { rotationY: -180, autoAlpha: d.mode === 'single' ? 0 : 1 });
    return tl.fromTo([backdrop, root], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: 'power1.out' });
  }

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
  tl.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power1.out' }, 0)
    .to(root, { x: pose.closedX, y: pose.y, '--zoom': 1, rotation: 0, rotationY: 0, duration: 0.85, ease: 'power3.inOut' }, 0)
    .to(cover, { rotationY: -180, duration: 0.95, ease: 'power2.inOut' }, 0.72)
    // Settle the open pages at z = 0 so the text renders crisply.
    .to(root, { x: pose.openX, z: -d.T / 2, duration: 0.8, ease: 'power2.inOut' }, 0.85);
  if (d.mode === 'single') tl.to(cover, { autoAlpha: 0, duration: 0.3 }, 1.4);
  return tl;
}

// The pages: each text flow is laid out in CSS columns exactly one page wide (the column gap is
// the page margins, so columns sit one page width apart), and a page is a window onto column n.
// On a spread the facts (photos, details) are plates on the left, facing the story on the right;
// once they run out, the story fills both sides. A single page shows one flow, facts on top.

type FlowId = 'facts' | 'story' | 'all';
/** A page shows one column of one flow; null is a blank page. */
type PageRef = { flow: FlowId; col: number } | null;
type Counts = Record<FlowId, number>;
type Turn = { from: number; to: number };

const TURN_SECONDS = 0.75;

function pageSequence(mode: Mode, counts: Counts): PageRef[] {
  const cols = (flow: FlowId) => Array.from({ length: counts[flow] }, (_, col) => ({ flow, col }));
  if (mode === 'single') return cols('all');
  const story = cols('story');
  const seq: PageRef[] = cols('facts').flatMap((plate, i) => [plate, story[i] ?? null]);
  seq.push(...story.slice(counts.facts));
  if (seq.length % 2 === 1) seq.push(null);
  return seq;
}

function PageView({ page, flows }: { page: PageRef | undefined; flows: Record<FlowId, ReactNode> }) {
  if (!page) return null;
  return (
    <div className="page__clip">
      <div className="page__flow" style={{ transform: `translateX(calc(var(--W) * ${-page.col}))` }}>
        {flows[page.flow]}
      </div>
    </div>
  );
}

function Folio({ n }: { n: number | null }) {
  return n ? (
    <p className="page__folio" aria-hidden="true">
      {n}
    </p>
  ) : null;
}

const inert = { inert: '' } as object;

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
  const [counts, setCounts] = useState<Counts>({ facts: 1, story: 1, all: 1 });
  /** The spread (or, on phones, the page) that's open. */
  const [at, setAt] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const turnTlRef = useRef<gsap.core.Timeline | null>(null);
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
    setAt(0);
    setTurn(null);
  }, []);

  const onOpened = useCallback(() => {
    phaseRef.current = 'open';
    dialogRef.current?.focus({ preventScroll: true });
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

    // Finish any page turn where it is.
    turnTlRef.current?.progress(1);

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

  // Count each flow's pages: its columns sit one page width (W) apart.
  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root || !dims) return;
    const count = () => {
      const next = { facts: 1, story: 1, all: 1 };
      root.querySelectorAll<HTMLElement>('[data-flow]').forEach((el) => {
        next[el.dataset.flow as FlowId] = Math.max(1, Math.round((el.scrollWidth + dims.W * 0.21) / dims.W));
      });
      setCounts((prev) => (Object.keys(next) as FlowId[]).every((k) => prev[k] === next[k]) ? prev : next);
    };
    count();
    // Images and web fonts change the layout once they load.
    root.addEventListener('load', count, true);
    let live = true;
    void document.fonts?.ready.then(() => live && count());
    return () => {
      live = false;
      root.removeEventListener('load', count, true);
    };
  }, [shown, dims, showNotes]);

  const sequence = dims ? pageSequence(dims.mode, counts) : [];
  const perView = dims?.mode === 'spread' ? 2 : 1;
  const views = Math.max(1, sequence.length / perView);
  const current = Math.min(at, views - 1);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (phaseRef.current !== 'open' || turnTlRef.current) return;
      const to = current + dir;
      if (to < 0 || to >= views) return;
      if (latest.current.reducedMotion) setAt(to);
      else setTurn({ from: current, to });
    },
    [current, views],
  );

  // Turn the leaf: forward it swings from the right page over to the left; back, the reverse.
  useLayoutEffect(() => {
    const leaf = leafRef.current;
    if (!turn || !leaf || !dims) return;
    const [front, back] = Array.from(leaf.children) as HTMLElement[];
    const frontShade = front.querySelector('.page__shade');
    const backShade = back.querySelector('.page__shade');
    const half = TURN_SECONDS / 2;
    gsap.set(leaf, { z: dims.T / 2 + 1, rotationY: 0, visibility: 'visible', transformOrigin: '0% 50%' });
    gsap.set(back, { opacity: 1 });
    const tl = gsap
      .timeline({ paused: true })
      .to(leaf, { rotationY: -180, duration: TURN_SECONDS, ease: 'power2.inOut' }, 0)
      .fromTo(frontShade, { opacity: 0 }, { opacity: 0.4, duration: half, ease: 'power1.in' }, 0)
      .fromTo(backShade, { opacity: 0.4 }, { opacity: 0, duration: half, ease: 'power1.out' }, half);
    // A single page has nothing to land on: the turned leaf fades away (or in, going back).
    if (dims.mode === 'single') tl.to(back, { opacity: 0, duration: half, ease: 'power1.in' }, half);
    const done = () => {
      turnTlRef.current = null;
      setAt(turn.to);
      setTurn(null);
    };
    turnTlRef.current = tl;
    if (turn.to > turn.from) tl.eventCallback('onComplete', done).play();
    else tl.eventCallback('onReverseComplete', done).progress(1).reverse();
    // Hidden in the same commit that updates the pages under it, so nothing flashes.
    return () => {
      tl.kill();
      gsap.set(leaf, { visibility: 'hidden' });
      if (turnTlRef.current === tl) turnTlRef.current = null;
    };
  }, [turn, dims]);

  useEffect(() => {
    if (!shown) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        latest.current.onClose();
      } else if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        go(1);
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        go(-1);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shown, go]);

  // The wheel turns one page per gesture: a trackpad's momentum keeps the lock until it dies down.
  const wheel = useRef({ sum: 0, lockedUntil: 0 });
  const onWheel = (event: WheelEvent) => {
    const w = wheel.current;
    const now = event.timeStamp;
    if (now < w.lockedUntil || turnTlRef.current) {
      w.lockedUntil = now + 220;
      w.sum = 0;
      return;
    }
    w.sum += Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(w.sum) < 40) return;
    go(w.sum > 0 ? 1 : -1);
    w.sum = 0;
    w.lockedUntil = now + 220;
  };

  // Swipe to turn; a swipe isn't also a click.
  const swipe = useRef({ x: 0, y: 0, swiped: false });
  const onPointerDown = (event: PointerEvent) => {
    swipe.current = { x: event.clientX, y: event.clientY, swiped: false };
  };
  const onPointerUp = (event: PointerEvent) => {
    const dx = event.clientX - swipe.current.x;
    const dy = event.clientY - swipe.current.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      swipe.current.swiped = true;
      go(dx < 0 ? 1 : -1);
    }
  };
  const onPageClick = (event: MouseEvent, dir: 1 | -1) => {
    if (swipe.current.swiped || (event.target as Element).closest('a, button')) return;
    if (window.getSelection()?.toString()) return;
    if (dims?.mode === 'single') {
      const rect = event.currentTarget.getBoundingClientRect();
      dir = event.clientX - rect.left < rect.width * 0.3 ? -1 : 1;
    }
    go(dir);
  };

  if (!shown || !dims) return null;

  const volume = volumes.get(shown.id);
  const draft = isDraft(shown);
  const style = {
    '--W': `${dims.W}px`,
    '--H': `${dims.H}px`,
    '--T': `${dims.T}px`,
    '--sw': `${dims.T}px`,
    '--sh': `${dims.H}px`,
    '--c': shown.binding.color,
  } as CSSProperties;

  const header = (
    <header className="page__header">
      <p className="page__kicker">
        {shelfLabel(shown.shelf)}
        {volume && ` · Volume ${volume}`}
      </p>
      <h2 className="page__title">{shown.title}</h2>
      {shown.dates && <p className="page__dates">{shown.dates}</p>}
    </header>
  );
  const story = (
    <>
      <BookStory book={shown} byId={byId} />
      {showNotes && <WritingNotes book={shown} draft={draft} />}
    </>
  );
  const flows: Record<FlowId, ReactNode> = {
    facts: <BookFacts book={shown} volume={volume} />,
    story: (
      <>
        {header}
        {story}
      </>
    ),
    all: (
      <>
        {header}
        <BookFacts book={shown} volume={volume} compact />
        {story}
      </>
    ),
  };

  // What each surface shows. Mid-turn, the pages under the leaf already show where it's going.
  const spread = dims.mode === 'spread';
  const pageAt = (i: number) => (spread ? { left: 2 * i, right: 2 * i + 1 } : { left: -1, right: i });
  const base = turn ? (turn.to > turn.from ? { left: turn.from, right: turn.to } : { left: turn.to, right: turn.from }) : null;
  const leftIndex = pageAt(base ? base.left : current).left;
  const rightIndex = pageAt(base ? (spread ? base.right : turn!.from) : current).right;
  const leafIndex = turn ? Math.min(turn.from, turn.to) : 0;
  const leafFront = pageAt(leafIndex).right;
  const leafBack = spread ? pageAt(leafIndex + 1).left : -1;
  // On a single page, the page under a forward turn is the next one.
  const underIndex = turn && !spread && turn.to > turn.from ? turn.to : rightIndex;
  const numbered = sequence.length > perView;
  const folio = (i: number) => (numbered && sequence[i] ? i + 1 : null);

  const canBack = current > 0;
  const canNext = current < views - 1;
  const position = spread
    ? `Pages ${2 * current + 1}–${Math.min(2 * current + 2, sequence.length)} of ${sequence.length}`
    : `Page ${current + 1} of ${sequence.length}`;

  return (
    <div
      className="spread"
      data-mode={dims.mode}
      role="dialog"
      aria-modal="true"
      aria-label={shown.title}
      ref={dialogRef}
      tabIndex={-1}
      onWheel={onWheel}
    >
      <div className="spread__backdrop" ref={backdropRef} onClick={() => latest.current.onClose()} />
      <div className="spread__stage">
        <div
          className="obook"
          ref={rootRef}
          style={style}
          data-texture={shown.binding.texture}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <div className="obook__body">
            <div className="obook__face obook__back" />
            <div className="obook__face obook__spine spine" aria-hidden="true">
              <SpineContent book={shown} volume={volume} />
            </div>
            <div className="obook__face obook__fore" />
            <div className="obook__face obook__top" />

            <div
              className="obook__face obook__page page page--right"
              data-turn={canNext || (!spread && canBack) ? '' : undefined}
              onClick={(event) => onPageClick(event, 1)}
            >
              <PageView page={sequence[underIndex]} flows={flows} />
              <Folio n={folio(underIndex)} />
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
              <div
                className="obook__face obook__cover-inside page page--left"
                data-turn={canBack ? '' : undefined}
                onClick={(event) => onPageClick(event, -1)}
              >
                {spread && (
                  <>
                    <PageView page={sequence[leftIndex]} flows={flows} />
                    <Folio n={folio(leftIndex)} />
                  </>
                )}
              </div>
            </div>

            {/* The leaf being turned. */}
            <div className="obook__leaf" ref={leafRef} aria-hidden="true" {...inert}>
              <div className="obook__face obook__leaf-front page page--right">
                {turn && <PageView page={sequence[leafFront]} flows={flows} />}
                {turn && <Folio n={folio(leafFront)} />}
                <div className="page__shade" />
              </div>
              <div className="obook__face obook__leaf-back page page--left">
                {turn && spread && <PageView page={sequence[leafBack]} flows={flows} />}
                {turn && spread && <Folio n={folio(leafBack)} />}
                <div className="page__shade" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lays out each flow off-screen to count its pages. */}
      <div className="spread__measure" ref={measureRef} style={style} aria-hidden="true" {...inert}>
        {(spread ? (['facts', 'story'] as const) : (['all'] as const)).map((flow) => (
          <div key={flow} className="page page--right">
            <div className="page__clip">
              <div className="page__flow" data-flow={flow}>
                {flows[flow]}
              </div>
            </div>
          </div>
        ))}
      </div>

      {views > 1 && (
        <nav className="spread__nav" aria-label="Pages">
          <button type="button" className="spread__turn" onClick={() => go(-1)} disabled={!canBack} aria-label="Previous page">
            ‹
          </button>
          <span className="spread__pos" aria-live="polite">
            {position}
          </span>
          <button type="button" className="spread__turn" onClick={() => go(1)} disabled={!canNext} aria-label="Next page">
            ›
          </button>
        </nav>
      )}
      <button type="button" className="spread__close" onClick={() => latest.current.onClose()}>
        Close
      </button>
    </div>
  );
}
