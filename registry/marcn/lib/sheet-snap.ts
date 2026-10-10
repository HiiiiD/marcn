export const RUBBER_LIMIT = 120;
const DISMISS_FRACTION = 0.3;
const DISMISS_VELOCITY = 800;
// How far ahead (seconds) the release velocity is projected when choosing a snap point.
const PROJECTION = 0.25;

export const rubberBand = (distance: number, limit = RUBBER_LIMIT) => limit * (1 - 1 / ((distance * 0.55) / limit + 1));

// Position is how far the sheet sits below its largest snap: positive moves toward dismissal, negative stretches it.
export const dragPosition = (raw: number) => (raw < 0 ? -rubberBand(-raw) : raw);

type Release = { position: number; velocity: number; hidden: number[]; lowestSize: number };

export function settle({ position, velocity, hidden, lowestSize }: Release): { dismiss: true } | { index: number } {
  const lowest = hidden[0];
  if (position - lowest > lowestSize * DISMISS_FRACTION || (velocity > DISMISS_VELOCITY && position >= lowest)) {
    return { dismiss: true };
  }
  const target = position + velocity * PROJECTION;
  let index = 0;
  hidden.forEach((h, i) => {
    if (Math.abs(h - target) < Math.abs(hidden[index] - target)) index = i;
  });
  return { index };
}

type BodyDrag = { translation: number; anchor: number; scrolled: number; startedAtTop: boolean; hasScroll: boolean };

// A drag that starts on the sheet body. With a list inside, the list keeps the gesture until it is scrolled back to its start;
// the sheet only follows once the finger moves toward dismissal past `anchor`. `drag` is null while the list owns the gesture.
export function bodyDrag({ translation, anchor, scrolled, startedAtTop, hasScroll }: BodyDrag): { anchor: number; drag: number | null } {
  if (!hasScroll) return { anchor, drag: translation };
  if (!startedAtTop) return { anchor, drag: translation - anchor };
  if (scrolled > 0) return { anchor: translation, drag: null };
  const drag = translation - anchor;
  return drag < 0 ? { anchor: translation, drag: 0 } : { anchor, drag };
}
