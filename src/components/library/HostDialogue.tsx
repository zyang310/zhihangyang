import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { DIALOGUE, type Choice } from '../../data/host';
import { PROFILE } from '../../data/profile';
import { PLATES } from '../../data/scene';

const CHARS_PER_SECOND = 45;
const FIRST_NAME = PROFILE.name.split(' ')[0];

/** Zhi's face (from the "looks up" photo), or nothing for a plate without one. */
function faceStyle(): CSSProperties | undefined {
  const { face } = PLATES.landscape;
  return face ? { backgroundImage: `url(${face})` } : undefined;
}

interface HostDialogueProps {
  /** A key of DIALOGUE. Give the component a matching `key` so each part starts fresh. */
  node: string;
  /** Move focus into the box: yes when the visitor opened it, no when Zhi greets on their own. */
  takeFocus: boolean;
  reducedMotion: boolean;
  /** Whether a book can be opened (unfinished books are hidden on the live site). */
  canOpen: (id: string) => boolean;
  onChoose: (choice: Choice) => void;
  onClose: () => void;
}

/** Zhi talking, visual-novel style: lines type out one at a time, then the visitor picks a choice. */
export function HostDialogue({ node, takeFocus, reducedMotion, canOpen, onChoose, onClose }: HostDialogueProps) {
  const { lines, choices } = DIALOGUE[node];
  const [line, setLine] = useState(0);
  const text = lines[line];
  const [typed, setTyped] = useState(reducedMotion ? text.length : 0);
  const done = typed >= text.length;
  const showChoices = done && line === lines.length - 1;
  const available = choices.filter((choice) => !('open' in choice) || canOpen(choice.open));

  const nextRef = useRef<HTMLButtonElement>(null);
  const choicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (done) return;
    const timer = window.setTimeout(() => setTyped((n) => n + 1), 1000 / CHARS_PER_SECOND);
    return () => window.clearTimeout(timer);
  }, [typed, done]);

  // Clicking anywhere in the box (or Enter on the arrow) finishes the line, then moves to the next.
  const advance = () => {
    if (!done) setTyped(text.length);
    else if (!showChoices) {
      setLine(line + 1);
      setTyped(reducedMotion ? lines[line + 1].length : 0);
    }
  };

  useEffect(() => {
    if (!takeFocus) return;
    if (showChoices) choicesRef.current?.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true });
    else nextRef.current?.focus({ preventScroll: true });
  }, [takeFocus, showChoices]);

  // Capture phase, so Escape closes the dialogue without also zooming the camera back out.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const face = faceStyle();

  return (
    <section className="host" role="dialog" aria-label={FIRST_NAME} onClick={advance}>
      {face ? <div className="host__face" style={face} aria-hidden="true" /> : null}
      <div className="host__body">
        <p className="host__name">{FIRST_NAME}</p>
        <p className="host__line">
          <span aria-hidden="true">
            {text.slice(0, typed)}
            <span className="host__rest">{text.slice(typed)}</span>
          </span>
          <span className="sr-only" aria-live="polite">
            {text}
          </span>
        </p>
        {showChoices ? (
          <div className="host__choices" ref={choicesRef}>
            {available.map((choice) =>
              'href' in choice ? (
                <a
                  key={choice.label}
                  className="host__choice"
                  href={choice.href}
                  target={choice.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                >
                  {choice.label}
                </a>
              ) : (
                <button key={choice.label} type="button" className="host__choice" onClick={() => onChoose(choice)}>
                  {choice.label}
                </button>
              ),
            )}
          </div>
        ) : (
          <button type="button" className="host__next" ref={nextRef} aria-label="Continue">
            ▸
          </button>
        )}
      </div>
      <button
        type="button"
        className="host__close"
        aria-label="Close"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        ×
      </button>
    </section>
  );
}

/** Phones (and plates without Zhi in them): Zhi can't be clicked in the photo, so this opens the greeting. */
export function HelloButton({ onClick }: { onClick: () => void }) {
  const face = faceStyle();
  return (
    <button type="button" className="host-hello" onClick={onClick}>
      <span className="host-hello__face" style={face} aria-hidden="true">
        {face ? null : FIRST_NAME[0]}
      </span>
      Say hello
    </button>
  );
}
