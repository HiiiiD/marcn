import type { Ref } from 'react';
import type { View, ViewProps } from 'react-native';
import type { OverlayProps } from '@/registry/marcn/ui/overlay';
import type { RenderProp } from '@/registry/marcn/lib/render';

export type SheetSide = 'top' | 'bottom' | 'left' | 'right';

export type SurfaceProps = ViewProps & {
  /**
   * Screen edge the sheet slides in from.
   * @default 'bottom'
   */
  side?: SheetSide;
  showHandle?: boolean;
  /** Visible sizes: fractions of the window (<= 1), pixels, or `'auto'` to fit the content (measured once on open). The handle snaps between them. */
  snapPoints?: (number | 'auto')[];
  snapIndex?: number;
  defaultSnapIndex?: number;
  onSnapIndexChange?: (index: number) => void;
  /** Drag the sheet from anywhere on its body. Lists inside must be `SheetScrollView`/`SheetFlatList`; set `false` to use other scrollables. */
  dragBody?: boolean;
  render?: RenderProp<ViewProps>;
  ref?: Ref<View>;
};

export type SheetContentProps = SurfaceProps & {
  dismissable?: boolean;
  initialFocusRef?: OverlayProps['initialFocusRef'];
};

