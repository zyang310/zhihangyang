import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { shelfLabel, type Book, type ShelfId } from '../../data/library';
import { PLATES, type Plate } from '../../data/scene';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Shelf } from './Shelf';
import './library.css';

gsap.registerPlugin(useGSAP);

/** The clip is a slow 10 s camera move; this plays it in under 7. */
const CLIP_RATE = 1.5;
/** How long the clip gets to start playing before the push-in takes over. */
const CLIP_TIMEOUT_MS = 4000;
/** Everything on the shelves: hidden while the clip plays over them. */
const SHELVES = '.lib-shelf, .lib-label';

interface StageProps {
  books: Book[];
  volumes: Map<string, string>;
  isDraft: (book: Book) => boolean;
  /** The book currently shown open (its slot on the shelf stays empty). */
  hiddenId: string | null;
  introDone: boolean;
  onIntroDone: () => void;
  onOpen: (id: string) => void;
  zoomShelf: ShelfId | null;
  onZoomShelf: (shelf: ShelfId | null) => void;
  reducedMotion: boolean;
  debug: boolean;
}

export function Stage({
  books,
  volumes,
  isDraft,
  hiddenId,
  introDone,
  onIntroDone,
  onOpen,
  zoomShelf,
  onZoomShelf,
  reducedMotion,
  debug,
}: StageProps) {
  const portrait = useMediaQuery('(max-aspect-ratio: 1/1)');
  const coarsePointer = useMediaQuery('(pointer: coarse)');
  const plate = portrait ? PLATES.portrait : PLATES.landscape;
  // On phones the spines are small, so the first tap zooms to a shelf and the next opens a book.
  const zoomFirst = portrait && coarsePointer;

  const frameRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const [tip, setTip] = useState<{ book: Book; x: number; y: number } | null>(null);

  const booksByShelf = useMemo(() => {
    const groups: Record<ShelfId, Book[]> = { life: [], experience: [], projects: [] };
    for (const book of books) groups[book.shelf].push(book);
    return groups;
  }, [books]);

  // Intro: the clip (a camera move across the room that ends exactly on the plate) fades up
  // out of the dark and crossfades into the plate, then the books slide onto their shelves and
  // the brass fittings fade in. Without the clip, or if it can't play, a push-in stands in for it.
  useGSAP(
    (_context, contextSafe) => {
      const scene = sceneRef.current;
      const video = videoRef.current;
      const vignette = vignetteRef.current;
      const skip = skipRef.current;
      if (introDone || !scene) return;
      const unit = (frameRef.current?.offsetHeight ?? window.innerHeight) / 100;

      const shelveBooks = (timeline: gsap.core.Timeline, at: gsap.Position) => {
        gsap.set(SHELVES, { clearProps: 'opacity,visibility' }); // hidden while the clip plays
        return timeline
          .from(
            '.lib-slot',
            {
              z: -16 * unit,
              y: -1.2 * unit,
              autoAlpha: 0,
              duration: 0.75,
              ease: 'power3.out',
              stagger: 0.05,
              clearProps: 'transform,opacity,visibility',
            },
            at,
          )
          .from('.lib-label, .lib-bookend', { autoAlpha: 0, duration: 0.6, clearProps: 'opacity,visibility' }, '-=0.45');
      };

      const pushIn = () =>
        shelveBooks(
          gsap
            .timeline({ onComplete: onIntroDone })
            .fromTo(
              scene,
              { scale: 0.9, transformOrigin: '50% 50%' },
              { scale: 1, duration: 2.6, ease: 'power2.out', clearProps: 'transform,transformOrigin' },
              0,
            )
            .fromTo(scene, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: 'power1.out', clearProps: 'opacity,visibility' }, 0)
            .fromTo(vignette, { autoAlpha: 1 }, { autoAlpha: 0, duration: 2.6, ease: 'power1.inOut' }, 0),
          1.2,
        );

      if (!video || !contextSafe) {
        pushIn();
        return;
      }

      let phase: 'waiting' | 'playing' | 'done' = 'waiting';
      // The shelves wait out of sight, and out of reach of clicks and Tab, until the clip is over.
      gsap.set(SHELVES, { autoAlpha: 0 });
      gsap.set(scene, { autoAlpha: 0 });
      gsap.set(vignette, { autoAlpha: 1 });

      const start = contextSafe(() => {
        if (phase !== 'waiting') return;
        phase = 'playing';
        gsap.to(scene, { autoAlpha: 1, duration: 1, ease: 'power1.out' });
        gsap.to(vignette, { autoAlpha: 0, duration: 2.6, ease: 'power1.inOut' });
      });

      // At the clip's end this is a crossfade between two near-identical pictures; skipping
      // fades out of the middle of the camera move instead.
      const finish = contextSafe(() => {
        if (phase === 'done') return;
        phase = 'done';
        shelveBooks(
          gsap
            .timeline({ onComplete: onIntroDone })
            .to(scene, { autoAlpha: 1, duration: 0.6, overwrite: 'auto', clearProps: 'opacity,visibility' }, 0)
            .to(vignette, { autoAlpha: 0, duration: 0.6, overwrite: 'auto' }, 0)
            .to([video, skip], { autoAlpha: 0, duration: 0.8, ease: 'power1.inOut', onComplete: () => video.pause() }, 0),
          0.3,
        );
      });

      // Autoplay blocked (e.g. iOS Low Power Mode), a broken file, or a connection too slow to start it.
      const fallBack = contextSafe(() => {
        if (phase !== 'waiting') return;
        phase = 'done';
        video.pause();
        gsap.set([video, skip], { autoAlpha: 0 });
        pushIn();
      });

      // Chrome won't play video in a background tab, so a page opened in one waits to be looked at.
      let timeout = 0;
      const play = () => {
        if (document.hidden || phase !== 'waiting') return;
        window.clearTimeout(timeout);
        timeout = window.setTimeout(fallBack, CLIP_TIMEOUT_MS);
        video.play().catch(() => (document.hidden ? window.clearTimeout(timeout) : fallBack()));
      };

      const onError = () => (phase === 'waiting' ? fallBack() : finish());
      const onKey = (event: KeyboardEvent) => event.key === 'Escape' && finish();
      video.addEventListener('playing', start);
      video.addEventListener('ended', finish);
      video.addEventListener('error', onError);
      skip?.addEventListener('click', finish);
      window.addEventListener('keydown', onKey);
      document.addEventListener('visibilitychange', play);

      video.muted = true; // Autoplay requires it, and React doesn't reliably set the attribute.
      video.defaultPlaybackRate = video.playbackRate = CLIP_RATE;
      play();

      return () => {
        phase = 'done';
        window.clearTimeout(timeout);
        document.removeEventListener('visibilitychange', play);
        video.removeEventListener('playing', start);
        video.removeEventListener('ended', finish);
        video.removeEventListener('error', onError);
        skip?.removeEventListener('click', finish);
        window.removeEventListener('keydown', onKey);
      };
    },
    { scope: sceneRef },
  );

  useEffect(() => {
    if (!zoomFirst) onZoomShelf(null);
  }, [zoomFirst, onZoomShelf]);

  // Zoom the whole scene so the chosen shelf's books fill the screen.
  const zoomedRef = useRef(false);
  useEffect(() => {
    const scene = sceneRef.current;
    const frame = frameRef.current;
    if (!scene || !frame) return;
    const duration = reducedMotion ? 0 : 0.8;
    const geometry = plate.shelves.find((shelf) => shelf.id === zoomShelf);
    if (!geometry) {
      // Only zoom back out if we zoomed in; otherwise this would fight the intro's push-in.
      if (zoomedRef.current) gsap.to(scene, { x: 0, y: 0, scale: 1, duration, ease: 'power3.inOut' });
      zoomedRef.current = false;
      return;
    }
    zoomedRef.current = true;
    const row = scene.querySelector<HTMLElement>(`[data-shelf-row="${geometry.id}"]`);
    const fw = frame.offsetWidth;
    const fh = frame.offsetHeight;
    const x0 = (fw * geometry.left) / 100 + (row?.offsetLeft ?? 0);
    const x1 = x0 + (row?.offsetWidth ?? (fw * (geometry.right - geometry.left)) / 100);
    const y0 = (fh * (geometry.baseline - geometry.height - 1)) / 100;
    const y1 = (fh * (geometry.labelY + 1.5)) / 100;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.min(Math.max(Math.min((vw * 0.92) / (x1 - x0), (vh * 0.62) / (y1 - y0)), 1), 2.6);
    // Center the shelf, but never pull the plate's edge into view.
    const frameLeft = (vw - fw) / 2;
    const frameTop = (vh - fh) / 2;
    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
    gsap.to(scene, {
      x: clamp(vw / 2 - frameLeft - scale * ((x0 + x1) / 2), vw - frameLeft - fw * scale, -frameLeft),
      y: clamp(vh / 2 - frameTop - scale * ((y0 + y1) / 2), vh - frameTop - fh * scale, -frameTop),
      scale,
      duration,
      ease: 'power3.inOut',
    });
  }, [zoomShelf, plate, reducedMotion]);

  useEffect(() => {
    if (!zoomShelf || hiddenId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onZoomShelf(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [zoomShelf, hiddenId, onZoomShelf]);

  const activate = useCallback(
    (book: Book) => {
      setTip(null);
      if (zoomFirst && zoomShelf !== book.shelf) onZoomShelf(book.shelf);
      else onOpen(book.id);
    },
    [zoomFirst, zoomShelf, onZoomShelf, onOpen],
  );

  const hover = useCallback((book: Book | null, element?: HTMLElement) => {
    const spine = element?.querySelector('.lib-spine')?.getBoundingClientRect();
    setTip(book && spine ? { book, x: spine.left + spine.width / 2, y: spine.top } : null);
  }, []);

  const imageStyle = plate.image && {
    left: `${plate.image.left}%`,
    top: `${plate.image.top}%`,
    width: `${plate.image.width}%`,
    height: `${plate.image.height}%`,
  };
  const plateClass = plate.image ? 'lib-plate lib-plate--fitted' : 'lib-plate';
  const playClip = !introDone && plate.intro !== undefined;

  return (
    <div className="lib-viewport">
      <div
        className="lib-frame"
        ref={frameRef}
        style={{ width: `max(100vw, ${plate.aspect * 100}dvh)`, height: `max(${100 / plate.aspect}vw, 100dvh)` }}
      >
        <div className="lib-scene" ref={sceneRef} style={{ perspectiveOrigin: `50% ${plate.eyeY}%`, background: plate.backdrop }}>
          <img className={plateClass} style={imageStyle} src={plate.src} alt="" draggable={false} />
          {plate.shelves.map((geometry) => (
            <Shelf
              key={geometry.id}
              geometry={geometry}
              label={shelfLabel(geometry.id)}
              books={booksByShelf[geometry.id]}
              volumes={volumes}
              isDraft={isDraft}
              hiddenId={hiddenId}
              onActivate={activate}
              onHover={hover}
              onShelfClick={zoomFirst && zoomShelf !== geometry.id ? () => onZoomShelf(geometry.id) : undefined}
            />
          ))}
          <img className="lib-light" style={{ ...imageStyle, clipPath: plate.lightClip }} src={plate.src} alt="" draggable={false} />
          {playClip && (
            <video ref={videoRef} className={plateClass} style={imageStyle} src={plate.intro} muted playsInline preload="auto" aria-hidden="true" />
          )}
          <div className="lib-grain" />
          {debug && <DebugOverlay plate={plate} />}
        </div>
      </div>
      <div className="lib-vignette" ref={vignetteRef} />

      {tip && !hiddenId && (
        <div className="lib-tip" style={{ left: tip.x, top: tip.y }} aria-hidden="true">
          <div className="lib-tip__title">{tip.book.title}</div>
          <div className="lib-tip__meta">
            {tip.book.dates || 'Undated'}
            {isDraft(tip.book) && ' · draft'}
          </div>
        </div>
      )}

      {zoomShelf && (
        <button type="button" className="lib-unzoom" onClick={() => onZoomShelf(null)}>
          ← All shelves
        </button>
      )}

      {/* The intro above handles its clicks. */}
      {playClip && (
        <button type="button" className="lib-skip" ref={skipRef}>
          Skip intro
        </button>
      )}
    </div>
  );
}

/** ?debug: outlines the shelf geometry from scene.ts so it can be matched to a new plate. */
function DebugOverlay({ plate }: { plate: Plate }) {
  // Line captions sit just right of the bookcase so a cropped frame doesn't hide them.
  const captionLeft = { left: `calc(${Math.max(...plate.shelves.map((g) => g.right))}% + 8px)` };
  return (
    <div className="lib-debug" aria-hidden="true">
      <div className="lib-debug__line" style={{ top: `${plate.eyeY}%` }}>
        <span style={captionLeft}>eyeY {plate.eyeY}</span>
      </div>
      {plate.shelves.map((g) => (
        <div key={g.id}>
          <div
            className="lib-debug__shelf"
            style={{ left: `${g.left}%`, width: `${g.right - g.left}%`, top: `${g.baseline - g.height}%`, height: `${g.height}%` }}
          >
            <span>
              {g.id} · baseline {g.baseline} · height {g.height} · left {g.left} · right {g.right}
            </span>
          </div>
          <div className="lib-debug__line lib-debug__line--label" style={{ top: `${g.labelY}%` }}>
            <span style={captionLeft}>labelY {g.labelY}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
