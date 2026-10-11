import { createContext, useContext, useEffect, useMemo, useRef, useState, type Ref } from 'react';
import {
  FlatList, ScrollView,
  type FlatListProps, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewProps,
} from 'react-native';
import { Gesture, GestureDetector, type NativeGesture } from 'react-native-gesture-handler';
import { type SharedValue } from 'react-native-reanimated';
import { bodyDrag, dragPosition } from '@/registry/marcn/ui/sheet/snap';

export type SheetDrag = {
  register: (gesture: NativeGesture) => () => void;
  offset: { current: number };
  atTop: () => boolean;
  vertical: boolean;
};

export const SheetDragContext = createContext<SheetDrag | null>(null);

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;

// Lists inside a sheet report their offset so a body drag can hand off to them, and are pinned to the top while the sheet is below its largest snap.
function useSheetScroll(scrollToStart: () => void, onScroll?: (e: ScrollEvent) => void) {
  const sheet = useContext(SheetDragContext);
  const native = useMemo(() => Gesture.Native(), []);
  useEffect(() => sheet?.register(native), [sheet, native]);
  return {
    sheet,
    native,
    props: {
      bounces: false,
      overScrollMode: 'never' as const,
      scrollEventThrottle: 16,
      onScroll: (e: ScrollEvent) => {
        if (sheet) {
          const y = e.nativeEvent.contentOffset.y;
          sheet.offset.current = y;
          if (y > 0 && sheet.vertical && !sheet.atTop()) scrollToStart();
        }
        onScroll?.(e);
      },
    },
  };
}

function assign<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

export function SheetScrollView({ ref, onScroll, ...props }: ScrollViewProps & { ref?: Ref<ScrollView> }) {
  const inner = useRef<ScrollView | null>(null);
  const { sheet, native, props: scroll } = useSheetScroll(() => inner.current?.scrollTo({ y: 0, animated: false }), onScroll);
  const view = (
    <ScrollView
      {...props}
      {...scroll}
      ref={(node) => {
        inner.current = node;
        assign(ref, node);
      }}
    />
  );
  return sheet ? <GestureDetector gesture={native}>{view}</GestureDetector> : <ScrollView {...props} onScroll={onScroll} ref={ref} />;
}

export function SheetFlatList<T>({ ref, onScroll, ...props }: FlatListProps<T> & { ref?: Ref<FlatList<T>> }) {
  const inner = useRef<FlatList<T> | null>(null);
  const { sheet, native, props: scroll } = useSheetScroll(() => inner.current?.scrollToOffset({ offset: 0, animated: false }), onScroll);
  const list = (
    <FlatList
      {...props}
      {...scroll}
      ref={(node) => {
        inner.current = node;
        assign(ref, node);
      }}
    />
  );
  return sheet ? <GestureDetector gesture={native}>{list}</GestureDetector> : <FlatList {...props} onScroll={onScroll} ref={ref} />;
}

type BodyDragOptions = {
  enabled: boolean;
  dir: number;
  vertical: boolean;
  position: SharedValue<number>;
  start: SharedValue<number>;
  release: (position: number, velocity: number) => void;
};

// The pan for a drag that starts on the sheet body, plus the context lists use to register and report their offset.
export function useBodyDrag({ enabled, dir, vertical, position, start, release }: BodyDragOptions) {
  const [natives, setNatives] = useState<NativeGesture[]>([]);
  const scrollOffset = useRef(0);
  const lists = useRef(0);
  const grab = useRef({ anchor: 0, atTop: true, moved: false });
  // Read through a ref so the context value, and every list's registration, stays put across renders.
  const positionRef = useRef(position);
  positionRef.current = position;
  const drag = useMemo<SheetDrag>(
    () => ({
      register: (g) => {
        lists.current += 1;
        setNatives((n) => [...n, g]);
        return () => {
          lists.current -= 1;
          setNatives((n) => n.filter((x) => x !== g));
        };
      },
      offset: scrollOffset,
      atTop: () => positionRef.current.value <= 1,
      vertical,
    }),
    [vertical],
  );
  const pan = useMemo(() => {
    const gesture = (vertical ? Gesture.Pan().activeOffsetY([-10, 10]).failOffsetX([-25, 25]) : Gesture.Pan().activeOffsetX([-10, 10]).failOffsetY([-25, 25]))
      .withTestId('sheet-body-drag')
      .enabled(enabled)
      .runOnJS(true)
      .onBegin(() => {
        start.value = position.value;
        grab.current = { anchor: 0, atTop: position.value <= 1, moved: false };
      })
      .onUpdate((e) => {
        const g = grab.current;
        const r = bodyDrag({
          translation: dir * (vertical ? e.translationY : e.translationX),
          anchor: g.anchor,
          scrolled: scrollOffset.current,
          startedAtTop: g.atTop,
          hasScroll: lists.current > 0,
        });
        g.anchor = r.anchor;
        if (r.drag === null) return;
        if (r.drag !== 0) g.moved = true;
        const raw = start.value + r.drag;
        position.value = lists.current > 0 ? Math.max(0, raw) : dragPosition(raw);
      })
      .onEnd((e) => {
        if (grab.current.moved) release(position.value, dir * (vertical ? e.velocityY : e.velocityX));
      });
    return natives.length > 0 ? gesture.simultaneousWithExternalGesture(...natives) : gesture;
  }, [natives, enabled, dir, vertical, position, start, release]);
  return { pan, drag };
}
