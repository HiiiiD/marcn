export type ThumbInput = { viewport: number; content: number; offset: number; track: number; minThumb?: number };
export type Thumb = { size: number; position: number; visible: boolean };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function thumbMetrics({ viewport, content, offset, track, minThumb = 24 }: ThumbInput): Thumb {
  if (track <= 0 || !(content > viewport + 1)) return { size: 0, position: 0, visible: false };
  const size = clamp((track * viewport) / content, Math.min(minThumb, track), track);
  const position = (track - size) * clamp(offset / (content - viewport), 0, 1);
  return { size, position, visible: true };
}
