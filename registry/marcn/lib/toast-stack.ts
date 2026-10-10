export type ToastPosition = 'top' | 'bottom';
export type StackItem = { translateY: number; scale: number; opacity: number; zIndex: number; interactive: boolean };

export const TOAST_GAP = 12;
export const STACK_PEEK = 10;
export const STACK_SCALE_STEP = 0.05;
export const DEFAULT_TOAST_HEIGHT = 64;
export const SWIPE_DISTANCE = 48;
export const SWIPE_VELOCITY = 600;
const AWAY_DAMPING = 0.2;

// Points away from the screen edge the stack is anchored to.
export const edgeSign = (position: ToastPosition) => (position === 'top' ? 1 : -1);

type StackInput = {
  index: number;
  expanded: boolean;
  heights: readonly (number | undefined)[];
  visible: number;
  position: ToastPosition;
};

export function stackLayout({ index, expanded, heights, visible, position }: StackInput): StackItem {
  const hidden = index >= visible;
  let offset = index * STACK_PEEK;
  if (expanded) {
    offset = 0;
    for (let i = 0; i < index; i++) offset += (heights[i] ?? DEFAULT_TOAST_HEIGHT) + TOAST_GAP;
  }
  return {
    translateY: offset === 0 ? 0 : edgeSign(position) * offset,
    scale: expanded ? 1 : Math.max(0, 1 - STACK_SCALE_STEP * index),
    opacity: hidden ? 0 : 1,
    zIndex: 1000 - index,
    interactive: !hidden && (expanded || index === 0),
  };
}

type Swipe = { translationX: number; translationY: number; velocityX: number; velocityY: number; position: ToastPosition };

export function swipeOutcome({ translationX, translationY, velocityX, velocityY, position }: Swipe): 'dismiss' | 'cancel' {
  const toEdge = -edgeSign(position);
  if (translationY * toEdge >= SWIPE_DISTANCE || velocityY * toEdge >= SWIPE_VELOCITY) return 'dismiss';
  if (Math.abs(translationX) >= SWIPE_DISTANCE || Math.abs(velocityX) >= SWIPE_VELOCITY) return 'dismiss';
  return 'cancel';
}

export function dampenDrag(translationY: number, position: ToastPosition) {
  return translationY * -edgeSign(position) >= 0 ? translationY : translationY * AWAY_DAMPING;
}
