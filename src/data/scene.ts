import type { ShelfId } from './library';
// The room plate (made in Higgsfield, upscaled, run through `npm run media`).
// To use a new plate: replace the import, open the site with ?debug, and adjust the
// landscape numbers until the outlines sit on the real shelves. The phone layout is
// derived from them.
import room from '../assets/media/room.jpg';
// The intro: a Gemini dolly-out that starts on the plate, reversed by `npm run media`
// (media-raw/intro.reverse.mp4) so it ends on the plate. A new plate needs a new clip.
import introClip from '../assets/media/intro.mp4';

export interface ShelfGeometry {
  id: ShelfId;
  /** Where books stand on the shelf board, % of frame height. */
  baseline: number;
  /** Usable height above the baseline, % of frame height. */
  height: number;
  /** Inner edges of the opening, % of frame width. */
  left: number;
  right: number;
  /** Vertical center of the board's front edge, where the label plate goes, % of frame height. */
  labelY: number;
}

/** Where the image sits inside the frame, in % of the frame. Omitted = the image is the frame. */
export interface ImageRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Plate {
  src: string;
  /** Frame width / height. */
  aspect: number;
  /** Eye height for the 3D perspective, % of frame height. */
  eyeY: number;
  shelves: ShelfGeometry[];
  image?: ImageRect;
  /** Fills the frame around a fitted image. */
  backdrop?: string;
  /** The bookcase openings in % of the image, as a CSS inset() for the lighting overlay. */
  lightClip: string;
  /** A clip whose last frame is this image, played in the image's place as the intro. */
  intro?: string;
}

const landscapeShelves: ShelfGeometry[] = [
  { id: 'life', baseline: 38.4, height: 21.5, left: 33, right: 67.2, labelY: 39.4 },
  { id: 'experience', baseline: 64.4, height: 22, left: 33, right: 67.2, labelY: 65.9 },
  { id: 'projects', baseline: 90, height: 21.3, left: 33, right: 67.2, labelY: 92.2 },
];

const landscape: Plate = {
  src: room,
  aspect: 16 / 9,
  eyeY: 55,
  shelves: landscapeShelves,
  lightClip: 'inset(15% 32% 8% 32%)',
  intro: introClip,
};

/**
 * Phones: the same photo, scaled so the bookcase fills most of the width, with the
 * frame's top and bottom filled by a dark backdrop the photo fades into.
 */
function fitToPortrait(base: Plate, widthPct: number, topPct: number): Plate {
  const aspect = 9 / 16;
  const rect: ImageRect = {
    left: (100 - widthPct) / 2,
    top: topPct,
    width: widthPct,
    height: (widthPct * aspect) / base.aspect,
  };
  const x = (v: number) => rect.left + (v * rect.width) / 100;
  const y = (v: number) => rect.top + (v * rect.height) / 100;
  return {
    ...base,
    aspect,
    image: rect,
    backdrop: 'linear-gradient(#121212, #0c0b0a 45%, #080605)',
    eyeY: y(base.eyeY),
    shelves: base.shelves.map((shelf) => ({
      ...shelf,
      baseline: y(shelf.baseline),
      height: (shelf.height * rect.height) / 100,
      left: x(shelf.left),
      right: x(shelf.right),
      labelY: y(shelf.labelY),
    })),
  };
}

// The bookcase (crown included) spans 28.4%–71.6% of the photo; 194% puts it at ~84% of a phone's width.
export const PLATES: Record<'landscape' | 'portrait', Plate> = {
  landscape,
  portrait: fitToPortrait(landscape, 194, 21),
};
