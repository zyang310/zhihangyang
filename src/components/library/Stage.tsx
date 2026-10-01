import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { shelfLabel, type Book, type ShelfId } from '../../data/library';
import { PLATES, type Plate, type Polygon, type Rect } from '../../data/scene';
import { PROFILE } from '../../data/profile';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { ZoomTarget } from '../../hooks/useLibraryState';
import { HelloButton } from './HostDialogue';
import { Shelf } from './Shelf';
import './library.css';

gsap.registerPlugin(useGSAP);

/** The clip is a 7 s camera move; this plays it in under 6. */
const CLIP_RATE = 1.25;
/** How long the clip gets to start playing before the push-in takes over. */
const CLIP_TIMEOUT_MS = 4000;
/** Everything drawn over the photo: hidden while the clip plays over it. */
const OVER_PLATE = '.lib-shelf, .lib-label, .lib-hotspot';
const FIRST_NAME = PROFILE.name.split(' ')[0];

interface StageProps {
  books: Book[];
  volumes: Map<string, string>;
  isDraft: (book: Book) => boolean;
  /** The book currently shown open (its slot on the shelf stays empty). */
  hiddenId: string | null;
  introDone: boolean;
  onIntroDone: () => void;
  onOpen: (id: string) => void;
  zoom: ZoomTarget | null;
  onZoom: (target: ZoomTarget | null) => void;
  /** Clicking Zhi in the armchair (or the hello button on phones). */
  onGreet: () => void;
  dialogueOpen: boolean;
  reducedMotion: boolean;
  debug: boolean;
}

interface Box {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  /** Share of the viewport height the box may fill. */
  fill: number;
}

/** How far to zoom so the box fills the viewport: never out, never past 2.6×. */
function zoomScale(box: Box) {
  const fit = Math.min((window.innerWidth * 0.92) / (box.x1 - box.x0), (window.innerHeight * box.fill) / (box.y1 - box.y0));
  return Math.min(Math.max(fit, 1), 2.6);
}

export function Stage({
  books,
  volumes,
  isDraft,
  hiddenId,
  introDone,
  onIntroDone,
  onOpen,
  zoom,
  onZoom,
  onGreet,
  dialogueOpen,
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
  const [tip, setTipState] = useState<{ title: string; meta: string; x: number; y: number } | null>(null);
  // Tooltips are centered on their target; keep ones near the screen's edge fully on screen.
  const setTip = useCallback((next: { title: string; meta: string; x: number; y: number } | null) => {
    const margin = Math.min(150, window.innerWidth / 2);
    setTipState(next && { ...next, x: Math.min(Math.max(next.x, margin), window.innerWidth - margin) });
  }, []);

  const booksByShelf = useMemo(() => {
    const groups: Record<ShelfId, Book[]> = { life: [], experience: [], projects: [], reading: [] };
    for (const book of books) groups[book.shelf].push(book);
    return groups;
  }, [books]);
  const reading = booksByShelf.reading[0];

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
        gsap.set(OVER_PLATE, { clearProps: 'opacity,visibility' }); // hidden while the clip plays
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
      // The shelves and click targets wait out of sight, and out of reach of clicks and Tab, until the clip is over.
      gsap.set(OVER_PLATE, { autoAlpha: 0 });
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

  // Per-shelf zoom is for phones; the bookcase zoom works everywhere.
  useEffect(() => {
    if (!zoomFirst && zoom && zoom !== 'bookcase') onZoom(null);
  }, [zoomFirst, zoom, onZoom]);

  /** What a zoom target covers, in px of the unzoomed frame. */
  const zoomBox = useCallback(
    (target: ZoomTarget | null): Box | null => {
      const frame = frameRef.current;
      if (!frame || !target) return null;
      const fw = frame.offsetWidth;
      const fh = frame.offsetHeight;
      if (target === 'bookcase') {
        const b = plate.bookcase;
        return { x0: (fw * b.left) / 100, x1: (fw * (b.left + b.width)) / 100, y0: (fh * b.top) / 100, y1: (fh * (b.top + b.height)) / 100, fill: 0.88 };
      }
      const geometry = plate.shelves.find((shelf) => shelf.id === target);
      if (!geometry) return null;
      const row = sceneRef.current?.querySelector<HTMLElement>(`[data-shelf-row="${geometry.id}"]`);
      const x0 = (fw * geometry.left) / 100 + (row?.offsetLeft ?? 0);
      return {
        x0,
        x1: x0 + (row?.offsetWidth ?? (fw * (geometry.right - geometry.left)) / 100),
        y0: (fh * (geometry.baseline - geometry.height - 1)) / 100,
        y1: (fh * (geometry.labelY + 1.5)) / 100,
        fill: 0.62,
      };
    },
    [plate],
  );

  // Zoom the whole scene so the chosen shelf (or the whole bookcase) fills the screen.
  const zoomedRef = useRef(false);
  useEffect(() => {
    const scene = sceneRef.current;
    const frame = frameRef.current;
    if (!scene || !frame) return;
    const duration = reducedMotion ? 0 : 0.8;
    const box = zoomBox(zoom);
    // On a plate already framed tight on the bookcase there's nothing closer to go to.
    if (box && zoom === 'bookcase' && zoomScale(box) <= 1.05) {
      onZoom(null);
      return;
    }
    if (!box) {
      // Only zoom back out if we zoomed in; otherwise this would fight the intro's push-in.
      if (zoomedRef.current) gsap.to(scene, { x: 0, y: 0, scale: 1, duration, ease: 'power3.inOut' });
      zoomedRef.current = false;
      return;
    }
    zoomedRef.current = true;
    const fw = frame.offsetWidth;
    const fh = frame.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = zoomScale(box);
    // Center the target, but never pull the plate's edge into view.
    const frameLeft = (vw - fw) / 2;
    const frameTop = (vh - fh) / 2;
    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
    gsap.to(scene, {
      x: clamp(vw / 2 - frameLeft - scale * ((box.x0 + box.x1) / 2), vw - frameLeft - fw * scale, -frameLeft),
      y: clamp(vh / 2 - frameTop - scale * ((box.y0 + box.y1) / 2), vh - frameTop - fh * scale, -frameTop),
      scale,
      duration,
      ease: 'power3.inOut',
    });
  }, [zoom, zoomBox, reducedMotion, onZoom]);

  useEffect(() => {
    if (!zoom || hiddenId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onZoom(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [zoom, hiddenId, onZoom]);

  const activate = useCallback(
    (book: Book) => {
      setTip(null);
      if (zoomFirst && zoom !== book.shelf) onZoom(book.shelf);
      else onOpen(book.id);
    },
    [zoomFirst, zoom, onZoom, onOpen, setTip],
  );

  const draftNote = useCallback((book: Book) => (isDraft(book) ? ' · draft' : ''), [isDraft]);

  const hover = useCallback(
    (book: Book | null, element?: HTMLElement) => {
      const spine = element?.querySelector('.lib-spine')?.getBoundingClientRect();
      setTip(
        book && spine
          ? { title: book.title, meta: (book.dates || 'Undated') + draftNote(book), x: spine.left + spine.width / 2, y: spine.top }
          : null,
      );
    },
    [draftNote, setTip],
  );

  const hotspotTip = useCallback((title: string, meta: string, rect: DOMRect | null) => {
    setTip(rect ? { title, meta, x: rect.left + rect.width / 2, y: rect.top } : null);
  }, [setTip]);

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
        <div
          className="lib-scene"
          ref={sceneRef}
          style={{
            perspective: `${plate.perspective}cqh`,
            perspectiveOrigin: `${plate.eyeX}% ${plate.eyeY}%`,
            background: plate.backdrop,
          }}
        >
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
              onShelfClick={
                zoomFirst
                  ? zoom !== geometry.id
                    ? () => onZoom(geometry.id)
                    : undefined
                  : zoom !== 'bookcase'
                    ? () => onZoom('bookcase') // desktop: clicking a shelf (not a book) moves in close
                    : undefined
              }
            />
          ))}
          <img className="lib-light" style={{ ...imageStyle, clipPath: plate.lightClip }} src={plate.src} alt="" draggable={false} />
          {plate.occluders?.map((points, i) => (
            <img
              key={i}
              className={plateClass}
              style={{ ...imageStyle, clipPath: toClipPath(points) }}
              src={plate.src}
              alt=""
              draggable={false}
            />
          ))}
          {plate.lookUp && (
            <img
              className="lib-lookup"
              style={inFrame(plate, plate.lookUp.rect)}
              data-shown={dialogueOpen}
              src={plate.lookUp.src}
              alt=""
              draggable={false}
            />
          )}
          {/* Zhi first, then the book in their hands, so the book wins where the two overlap. */}
          {!portrait && plate.hotspots?.host && (
            <PhotoHotspot
              points={plate.hotspots.host}
              label={`${FIRST_NAME}: say hello`}
              title={FIRST_NAME}
              meta="Say hello"
              onActivate={onGreet}
              onTip={hotspotTip}
            />
          )}
          {!portrait && reading && plate.hotspots?.reading && (
            <PhotoHotspot
              points={plate.hotspots.reading}
              label={`Currently reading: ${reading.title}`}
              title={reading.title}
              meta={`Currently reading${draftNote(reading)}`}
              originId={reading.id}
              onActivate={() => onOpen(reading.id)}
              onTip={hotspotTip}
            />
          )}
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
          <div className="lib-tip__title">{tip.title}</div>
          <div className="lib-tip__meta">{tip.meta}</div>
        </div>
      )}

      {zoom && !dialogueOpen && (
        <button type="button" className="lib-unzoom" onClick={() => onZoom(null)}>
          {zoom === 'bookcase' ? '← Back to the room' : '← All shelves'}
        </button>
      )}

      {introDone && !dialogueOpen && !zoom && (portrait || !plate.hotspots?.host) && <HelloButton onClick={onGreet} />}

      {/* The intro above handles its clicks. */}
      {playClip && (
        <button type="button" className="lib-skip" ref={skipRef}>
          Skip intro
        </button>
      )}
    </div>
  );
}

const toPoints = (points: Polygon) => points.map(([x, y]) => `${x},${y}`).join(' ');
const toClipPath = (points: Polygon) => `polygon(${points.map(([x, y]) => `${x}% ${y}%`).join(', ')})`;

/** Places a rect given in % of the image in the frame (they differ on phones). */
function inFrame(plate: Plate, r: Rect) {
  const i = plate.image ?? { left: 0, top: 0, width: 100, height: 100 };
  return {
    left: `${i.left + (r.left * i.width) / 100}%`,
    top: `${i.top + (r.top * i.height) / 100}%`,
    width: `${(r.width * i.width) / 100}%`,
    height: `${(r.height * i.height) / 100}%`,
  };
}

interface PhotoHotspotProps {
  points: Polygon;
  /** For screen readers. */
  label: string;
  title: string;
  meta: string;
  /** Marks where an opened book starts its flight (see BookSpread). */
  originId?: string;
  onActivate: () => void;
  onTip: (title: string, meta: string, rect: DOMRect | null) => void;
}

/** A shape on the photo that works as a button: a brass outline and a tooltip on hover or focus. */
function PhotoHotspot({ points, label, title, meta, originId, onActivate, onTip }: PhotoHotspotProps) {
  const outlineRef = useRef<SVGPolygonElement>(null);
  const show = () => onTip(title, meta, outlineRef.current?.getBoundingClientRect() ?? null);
  const hide = () => onTip(title, meta, null);
  return (
    <>
      <button
        type="button"
        className="lib-hotspot"
        style={{ clipPath: toClipPath(points) }}
        aria-label={label}
        onClick={() => {
          hide();
          onActivate();
        }}
        onPointerEnter={(event) => {
          if (event.pointerType !== 'touch') show();
        }}
        onPointerLeave={hide}
        onFocus={(event) => {
          if (event.currentTarget.matches(':focus-visible')) show();
        }}
        onBlur={hide}
      />
      <svg className="lib-hotspot-outline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polygon ref={outlineRef} points={toPoints(points)} data-book-origin={originId} />
      </svg>
    </>
  );
}

/** ?debug: outlines the geometry from scene.ts so it can be matched to a new plate. */
function DebugOverlay({ plate }: { plate: Plate }) {
  // Line captions sit just right of the bookcase so a cropped frame doesn't hide them.
  const captionLeft = { left: `calc(${Math.max(...plate.shelves.map((g) => g.right))}% + 8px)` };
  const b = plate.bookcase;
  return (
    <div className="lib-debug" aria-hidden="true">
      <div className="lib-debug__line" style={{ top: `${plate.eyeY}%` }}>
        <span style={captionLeft}>
          eye {plate.eyeX}, {plate.eyeY}
        </span>
      </div>
      <div className="lib-debug__shelf lib-debug__box" style={{ left: `${b.left}%`, top: `${b.top}%`, width: `${b.width}%`, height: `${b.height}%` }}>
        <span>bookcase</span>
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
      <svg className="lib-debug__shapes" viewBox="0 0 100 100" preserveAspectRatio="none">
        {plate.hotspots?.host && <polygon points={toPoints(plate.hotspots.host)} />}
        {plate.hotspots?.reading && <polygon points={toPoints(plate.hotspots.reading)} />}
        {/* These are in % of the image, which is the frame only when the photo isn't fitted. */}
        {!plate.image && plate.occluders?.map((points, i) => <polygon key={i} points={toPoints(points)} />)}
        {!plate.image && plate.lookUp && (
          <rect x={plate.lookUp.rect.left} y={plate.lookUp.rect.top} width={plate.lookUp.rect.width} height={plate.lookUp.rect.height} />
        )}
      </svg>
    </div>
  );
}
