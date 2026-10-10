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
