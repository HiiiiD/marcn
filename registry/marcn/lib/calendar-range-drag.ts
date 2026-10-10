import { useMemo, useRef, type RefObject } from 'react';
import { PanResponder, type View } from 'react-native';
import { CELL } from '@/registry/marcn/lib/calendar-styles';
import { isSameDay, isSameMonth } from '@/registry/marcn/lib/calendar-math';

export type RowsLayout = { top: number; weeks: Date[][]; month: Date; hideOutside: boolean };

const SLOP = 8;

export function hitTest(rows: Iterable<RowsLayout>, width: number, x: number, y: number) {
  if (width <= 0) return undefined;
  for (const { top, weeks, month, hideOutside } of rows) {
    if (y < top || y >= top + weeks.length * CELL) continue;
    const date = weeks[Math.floor((y - top) / CELL)][Math.min(6, Math.max(0, Math.floor(x / (width / 7))))];
    return hideOutside && !isSameMonth(date, month) ? undefined : date;
  }
  return undefined;
}

type Options = {
  enabled: boolean;
  isDisabled: (date: Date) => boolean;
  onHover: (date: Date | undefined) => void;
  onCommit: (date: Date) => void;
};

export function useRangeDrag(bodyRef: RefObject<View | null>, options: Options) {
  const latest = useRef(options);
  latest.current = options;
  const geo = useRef({ width: 0, pageX: 0, pageY: 0, rows: new Map<number, RowsLayout>() }).current;
  const hover = useRef<Date | undefined>(undefined);

  const track = (pageX: number, pageY: number) => {
    const date = hitTest(geo.rows.values(), geo.width, pageX - geo.pageX, pageY - geo.pageY);
    if (!date || latest.current.isDisabled(date)) return;
    if (hover.current && isSameDay(hover.current, date)) return;
    hover.current = date;
    latest.current.onHover(date);
  };

  const finish = (commit: boolean) => {
    const date = hover.current;
    hover.current = undefined;
    latest.current.onHover(undefined);
    if (commit && date) latest.current.onCommit(date);
  };

  const panHandlers = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: () => {
          if (latest.current.enabled) {
            bodyRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
              geo.pageX = pageX;
              geo.pageY = pageY;
            });
          }
          return false;
        },
        onMoveShouldSetPanResponderCapture: (_e, g) => latest.current.enabled && Math.abs(g.dx) + Math.abs(g.dy) > SLOP,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (_e, g) => track(g.moveX, g.moveY),
        onPanResponderMove: (_e, g) => track(g.moveX, g.moveY),
        onPanResponderRelease: (_e, g) => {
          track(g.moveX, g.moveY);
          finish(true);
        },
        onPanResponderTerminate: () => finish(false),
      }).panHandlers,
    [],
  );

  const api = useMemo(
    () => ({
      panHandlers,
      setWidth: (width: number) => {
        geo.width = width;
      },
      setRows: (key: number, rows: RowsLayout) => {
        geo.rows.set(key, rows);
      },
      clearRows: (key: number) => {
        geo.rows.delete(key);
      },
    }),
    [panHandlers, geo],
  );
  return api;
}
