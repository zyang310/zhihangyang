import { PROFILE } from './profile';

// What Zhi says when you click them in the armchair: a few short lines, then choices.
// TODO(zhi): every line here is a placeholder. Rewrite them in your own voice; keep each
// line short (one or two sentences), since they type out one at a time.

export type Choice =
  | { label: string; next: string } // another part of the conversation
  | { label: string; open: string } // a book, by id
  | { label: string; browse: true } // zoom in on the bookcase
  | { label: string; href: string }; // a link

export interface DialogueNode {
  lines: string[];
  choices: Choice[];
}

export const GREETING = 'greet';

export const DIALOGUE: Record<string, DialogueNode> = {
  greet: {
    lines: [
      "Oh — hi. I'm Zhihang.",
      "This is my study. Every book on that shelf is a piece of my story: my life on top, where I've worked in the middle, and things I've built at the bottom.",
    ],
    choices: [
      { label: 'Where should I start?', next: 'start' },
      { label: 'What are you reading?', open: 'reading-now' },
      { label: 'Browse the shelves', browse: true },
      { label: 'Get in touch', next: 'contact' },
    ],
  },
  start: {
    lines: ['Start with Volume I, top left. The story goes in order from there.'],
    choices: [
      { label: 'Open Volume I', open: 'before-college' },
      { label: 'Back', next: 'greet' },
    ],
  },
  contact: {
    lines: ["Email's the best way to reach me. I'm on LinkedIn and GitHub too."],
    choices: [...PROFILE.links.map((link) => ({ label: link.label, href: link.href })), { label: 'Back', next: 'greet' }],
  },
};
