import type { CSSProperties } from 'react';
import { bookSize, type Book as BookData } from '../../data/library';
import { SpineContent } from './SpineContent';

interface BookProps {
  book: BookData;
  /** Usable shelf height, % of the frame height. */
  shelfHeight: number;
  volume?: string;
  draft: boolean;
  hidden: boolean;
  onActivate: (book: BookData) => void;
  onHover: (book: BookData | null, element?: HTMLElement) => void;
}

/** A book on the shelf: a CSS 3D box (spine, two covers, top) that pulls out on hover or focus. */
export function Book({ book, shelfHeight, volume, draft, hidden, onActivate, onHover }: BookProps) {
  const { h, t, d } = bookSize(book, shelfHeight);
  const stacked = Boolean(book.binding.stacked);
  const style = {
    '--sw': `${stacked ? h : t}cqh`,
    '--sh': `${stacked ? t : h}cqh`,
    '--d': `${d}cqh`,
    '--c': book.binding.color,
  } as CSSProperties;
  const name = volume ? `Volume ${volume}: ${book.title}` : book.title;

  return (
    <div className="lib-slot" style={style}>
      <button
        type="button"
        className="lib-book"
        data-book-id={book.id}
        data-texture={book.binding.texture}
        data-stacked={stacked || undefined}
        data-hidden={hidden || undefined}
        aria-label={`${name}, ${book.dates || 'undated'}${draft ? ' (draft)' : ''}`}
        onClick={() => onActivate(book)}
        onPointerEnter={(event) => {
          if (event.pointerType !== 'touch') onHover(book, event.currentTarget);
        }}
        onPointerLeave={() => onHover(null)}
        onFocus={(event) => {
          if (event.currentTarget.matches(':focus-visible')) onHover(book, event.currentTarget);
        }}
        onBlur={() => onHover(null)}
      >
        <span className="lib-face lib-side lib-side--l" />
        <span className="lib-face lib-side lib-side--r" />
        <span className="lib-face lib-top" />
        <span className="lib-face lib-spine spine">
          <SpineContent book={book} volume={volume} />
        </span>
        {draft && <span className="lib-slip">draft</span>}
        <span className="lib-shadow" />
      </button>
    </div>
  );
}
