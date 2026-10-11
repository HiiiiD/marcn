export type CarouselAlign = 'start' | 'center';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function itemOffsets({
  starts,
  sizes,
  viewport,
  content,
  align,
}: {
  starts: number[];
  sizes: number[];
  viewport: number;
  content: number;
  align: CarouselAlign;
}): number[] {
  const max = Math.max(content - viewport, 0);
  return starts.map((start, i) => Math.round(clamp(align === 'center' ? start - (viewport - (sizes[i] ?? 0)) / 2 : start, 0, max)));
}

export function snapPoints(offsets: number[]): number[] {
  return [...new Set(offsets)].sort((a, b) => a - b);
}

// `current` wins ties so clamped tail items (equal offsets) do not bounce a controlled index.
export function nearestIndex(offsets: number[], offset: number, current?: number): number {
  let best = 0;
  let bestDistance = Infinity;
  offsets.forEach((candidate, i) => {
    const distance = Math.abs(candidate - offset);
    if (distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  });
  if (current !== undefined && offsets[current] !== undefined && Math.abs(offsets[current] - offset) <= bestDistance) return current;
  return best;
}

export function leadingIndex(starts: number[], sizes: number[], offset: number): number {
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] + (sizes[i] ?? 0) > offset + 1) return i;
  }
  return Math.max(starts.length - 1, 0);
}

export function neighborOffset(points: number[], offset: number, direction: 1 | -1, max: number): number | null {
  if (direction === 1) {
    if (offset >= max - 1) return null;
    const next = points.find((point) => point > offset + 1);
    return next === undefined ? null : Math.min(next, max);
  }
  if (offset <= 1) return null;
  for (let i = points.length - 1; i >= 0; i--) {
    if (points[i] < offset - 1) return points[i];
  }
  return null;
}
