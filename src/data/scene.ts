import type { ShelfId } from './library';
// The room plate: Zhi reading in the armchair, built by media-raw/handoff/build-plate.sh and
// run through `npm run media`. To use a new plate: replace the image, open the site with ?debug,
// and adjust the landscape numbers until the outlines sit on the real shelves, Zhi and the book.
// The phone layout is derived from them.
import room from '../assets/media/room.webp';
// The same picture with Zhi looking up from the book (just the head, feathered), and a square
// crop of that face for the dialogue.
import hostLookUp from '../assets/media/host-lookup.webp';
import hostFace from '../assets/media/host-face.webp';
// The intro: an image-to-video dolly-out that starts on the plate, reversed by `npm run media`
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
  /** The board's front face, redrawn over the books but under the label, % of the image. */
  front?: Polygon;
}

/** A rectangle in % of the frame (or of the image, where noted). */
export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** A shape traced on the photo, as [x, y] points in % of the frame. */
export type Polygon = [number, number][];

export interface Plate {
  src: string;
  /** Frame width / height. */
  aspect: number;
  /** The camera's vanishing point for the books' 3D perspective, % of the frame. */
  eyeX: number;
  eyeY: number;
  /** How far the books' 3D perspective sits from the frame, in cqh (1% of the frame height). */
  perspective: number;
  shelves: ShelfGeometry[];
  /** The bookcase from crown to bottom shelf, % of the frame: what "browse the shelves" zooms to. */
  bookcase: Rect;
  /** Click targets on the photo: Zhi in the armchair, and the book in their hands. */
  hotspots?: { host?: Polygon; reading?: Polygon };
  /** Parts of the photo in front of the books (Zhi's crossed leg), redrawn over them, % of the image. */
  occluders?: Polygon[];
  /** Zhi looking up, shown over the photo while they talk; its rect is in % of the image. */
  lookUp?: { src: string; rect: Rect };
  /** A square photo of Zhi's face for the dialogue. */
  face?: string;
  /** Where the image sits inside the frame. Omitted = the image is the frame. */
  image?: Rect;
  /** Fills the frame around a fitted image. */
  backdrop?: string;
  /** The bookcase openings in % of the image, as a CSS inset() for the lighting overlay. */
  lightClip: string;
  /** A clip whose last frame is this image, played in the image's place as the intro. */
  intro?: string;
}

const landscapeShelves: ShelfGeometry[] = [
  {
    id: 'life',
    baseline: 37,
    height: 14.2,
    left: 37.4,
    right: 62.8,
    labelY: 37.7,
    // Above eye level, the books' covers recede downward past the board's front edge; it hides them.
    front: [[37.4, 37], [62.8, 37], [62.8, 38.4], [37.4, 38.4]],
  },
  { id: 'experience', baseline: 54.9, height: 14.8, left: 37.4, right: 62.8, labelY: 55.6 },
  { id: 'projects', baseline: 73.9, height: 14.8, left: 37.4, right: 62.8, labelY: 74.6 },
];

const landscape: Plate = {
  src: room,
  aspect: 16 / 9,
  eyeX: 50,
  eyeY: 48.5,
  perspective: 130,
  shelves: landscapeShelves,
  bookcase: { left: 35, top: 14, width: 30.2, height: 64 }, // crown to just under the bottom label
  hotspots: {
    host: [
      [80.8, 35], [83, 35.3], [84.6, 37.5], [84.6, 44], [83.6, 49], [86.8, 51], [88.2, 54], [88.6, 60.5],
      [87.8, 66], [82, 67], [76, 64], [73.5, 63], [72.8, 59], [76, 54], [77.8, 51.3], [79, 48.5],
      [77.8, 45.5], [77.4, 40.5], [78.4, 36.6],
    ],
    reading: [[66.4, 51], [68.8, 52.4], [72.7, 51.1], [75.3, 58], [74.6, 61], [71, 62], [69, 60], [67.6, 55.5]],
  },
  // Zhi's crossed leg, knee to shoe, passes in front of the bottom shelf's right end and its label.
  occluders: [
    [
      [68.5, 59.5], [65, 64.2], [63, 67.4], [61.2, 69.6], [59.7, 71.6], [59, 72.8], [58, 73.6], [56.5, 74.5],
      [54.5, 74.7], [52.8, 75.6], [53.2, 77.5], [55, 79], [60, 80], [68.5, 80],
    ],
  ],
  // From build-plate.sh, which prints it.
  lookUp: { src: hostLookUp, rect: { left: 74.399, top: 30.776, width: 13.585, height: 22.406 } },
  face: hostFace,
  lightClip: 'inset(21.8% 36.6% 25.6% 36.8%)',
  intro: introClip,
};

/**
 * Phones: the same photo, scaled so the bookcase fills most of the width and centered on
 * focusX (% of the image), with the frame's top and bottom filled by a dark backdrop the
 * photo fades into.
 */
function fitToPortrait(base: Plate, widthPct: number, topPct: number, focusX = 50): Plate {
  const aspect = 9 / 16;
  const rect: Rect = {
    left: 50 - (focusX * widthPct) / 100,
    top: topPct,
    width: widthPct,
    height: (widthPct * aspect) / base.aspect,
  };
  const x = (v: number) => rect.left + (v * rect.width) / 100;
  const y = (v: number) => rect.top + (v * rect.height) / 100;
  const point = ([px, py]: [number, number]): [number, number] => [x(px), y(py)];
  return {
    ...base,
    aspect,
    image: rect,
    backdrop: 'linear-gradient(#121212, #0c0b0a 45%, #080605)',
    eyeX: x(base.eyeX),
    eyeY: y(base.eyeY),
    shelves: base.shelves.map((shelf) => ({
      ...shelf,
      baseline: y(shelf.baseline),
      height: (shelf.height * rect.height) / 100,
      left: x(shelf.left),
      right: x(shelf.right),
      labelY: y(shelf.labelY),
    })),
    bookcase: {
      left: x(base.bookcase.left),
      top: y(base.bookcase.top),
      width: (base.bookcase.width * rect.width) / 100,
      height: (base.bookcase.height * rect.height) / 100,
    },
    hotspots: base.hotspots && {
      host: base.hotspots.host?.map(point),
      reading: base.hotspots.reading?.map(point),
    },
  };
}

// The bookcase (crown included) spans 35%–65.2% of the photo; 240% puts it at ~72% of the frame's
// width, which leaves a margin on a 9:19.5 phone (the frame is 9:16, so its sides are cropped).
export const PLATES: Record<'landscape' | 'portrait', Plate> = {
  landscape,
  portrait: fitToPortrait(landscape, 240, 12),
};
