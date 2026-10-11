import {
  DEFAULT_TOAST_HEIGHT, STACK_PEEK, TOAST_GAP, dampenDrag, edgeSign, stackLayout, swipeOutcome,
} from '@/registry/marcn/ui/sonner/stack';

const base = { expanded: false, heights: [] as (number | undefined)[], visible: 3, position: 'bottom' as const };

test('front toast sits at the edge, full size, interactive', () => {
  expect(stackLayout({ ...base, index: 0 })).toMatchObject({ translateY: 0, scale: 1, opacity: 1, interactive: true });
});

test('collapsed older toasts peek away from the edge, shrink, and are not interactive', () => {
  const bottom = stackLayout({ ...base, index: 2 });
  expect(bottom.translateY).toBe(-2 * STACK_PEEK);
  expect(bottom.scale).toBeCloseTo(0.9);
  expect(bottom.interactive).toBe(false);
  expect(stackLayout({ ...base, position: 'top', index: 1 }).translateY).toBe(STACK_PEEK);
});

test('expanded toasts are full size and spaced by measured heights', () => {
  const heights = [50, 80, undefined];
  const second = stackLayout({ ...base, expanded: true, heights, index: 1 });
  expect(second).toMatchObject({ translateY: -(50 + TOAST_GAP), scale: 1, interactive: true });
  const third = stackLayout({ ...base, expanded: true, heights, index: 2 });
  expect(third.translateY).toBe(-(50 + TOAST_GAP + 80 + TOAST_GAP));
  const unmeasured = stackLayout({ ...base, expanded: true, heights: [], index: 1 });
  expect(unmeasured.translateY).toBe(-(DEFAULT_TOAST_HEIGHT + TOAST_GAP));
});

test('toasts beyond visible are invisible and inert, expanded or not', () => {
  for (const expanded of [false, true]) {
    expect(stackLayout({ ...base, expanded, index: 3 })).toMatchObject({ opacity: 0, interactive: false });
  }
});

test('earlier toasts are stacked above later ones', () => {
  expect(stackLayout({ ...base, index: 0 }).zIndex).toBeGreaterThan(stackLayout({ ...base, index: 1 }).zIndex);
});

test('scale never goes negative', () => {
  expect(stackLayout({ ...base, visible: 99, index: 50 }).scale).toBe(0);
});

test('swipe toward the edge dismisses by distance or velocity', () => {
  const rest = { translationX: 0, velocityX: 0, velocityY: 0 };
  expect(swipeOutcome({ ...rest, translationY: 60, position: 'bottom' })).toBe('dismiss');
  expect(swipeOutcome({ ...rest, translationY: -60, position: 'top' })).toBe('dismiss');
  expect(swipeOutcome({ ...rest, translationY: 5, velocityY: 900, position: 'bottom' })).toBe('dismiss');
});

test('swipe away from the edge or a short drag cancels', () => {
  const rest = { translationX: 0, velocityX: 0, velocityY: 0 };
  expect(swipeOutcome({ ...rest, translationY: -60, position: 'bottom' })).toBe('cancel');
  expect(swipeOutcome({ ...rest, translationY: 20, position: 'bottom' })).toBe('cancel');
});

test('sideways swipe either way dismisses', () => {
  const rest = { translationY: 0, velocityX: 0, velocityY: 0, position: 'bottom' as const };
  expect(swipeOutcome({ ...rest, translationX: 70 })).toBe('dismiss');
  expect(swipeOutcome({ ...rest, translationX: -70 })).toBe('dismiss');
  expect(swipeOutcome({ ...rest, translationX: 10, velocityX: -800 })).toBe('dismiss');
});

test('dragging away from the edge is dampened, toward it is 1:1', () => {
  expect(dampenDrag(40, 'bottom')).toBe(40);
  expect(dampenDrag(-40, 'bottom')).toBeCloseTo(-8);
  expect(dampenDrag(-40, 'top')).toBe(-40);
  expect(edgeSign('top')).toBe(1);
  expect(edgeSign('bottom')).toBe(-1);
});
