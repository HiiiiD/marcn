export type Side = 'top' | 'bottom' | 'left' | 'right';
export type Align = 'start' | 'center' | 'end';
export type Rect = { x: number; y: number; width: number; height: number };
export type Size = { width: number; height: number };
export type PositionOptions = {
  side: Side;
  align: Align;
  sideOffset: number;
  alignOffset: number;
  avoidCollisions: boolean;
  collisionPadding: number;
};

const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

function aligned(align: Align, start: number, anchorSize: number, size: number) {
  if (align === 'start') return start;
  if (align === 'end') return start + anchorSize - size;
  return start + (anchorSize - size) / 2;
}

function place(side: Side, a: Rect, c: Size, o: PositionOptions) {
  if (side === 'top' || side === 'bottom') {
    return {
      x: aligned(o.align, a.x, a.width, c.width) + o.alignOffset,
      y: side === 'bottom' ? a.y + a.height + o.sideOffset : a.y - c.height - o.sideOffset,
    };
  }
  return {
    x: side === 'right' ? a.x + a.width + o.sideOffset : a.x - c.width - o.sideOffset,
    y: aligned(o.align, a.y, a.height, c.height) + o.alignOffset,
  };
}

function overflows(side: Side, p: { x: number; y: number }, c: Size, w: Size, pad: number) {
  if (side === 'top') return p.y < pad;
  if (side === 'bottom') return p.y + c.height > w.height - pad;
  if (side === 'left') return p.x < pad;
  return p.x + c.width > w.width - pad;
}

const clamp = (value: number, size: number, max: number, pad: number) => Math.max(pad, Math.min(value, max - pad - size));

export function computePosition(anchor: Rect, content: Size, window: Size, o: PositionOptions) {
  let side = o.side;
  let pos = place(side, anchor, content, o);
  if (o.avoidCollisions && overflows(side, pos, content, window, o.collisionPadding)) {
    const flipped = place(opposite[side], anchor, content, o);
    if (!overflows(opposite[side], flipped, content, window, o.collisionPadding)) {
      side = opposite[side];
      pos = flipped;
    }
  }
  if (o.avoidCollisions) {
    pos = {
      x: clamp(pos.x, content.width, window.width, o.collisionPadding),
      y: clamp(pos.y, content.height, window.height, o.collisionPadding),
    };
  }
  return { ...pos, side };
}
