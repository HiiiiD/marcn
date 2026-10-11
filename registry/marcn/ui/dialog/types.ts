import type { Ref } from 'react';
import type { View, ViewProps } from 'react-native';
import type { OverlayProps } from '@/registry/marcn/ui/overlay';
import type { RenderProp } from '@/registry/marcn/lib/render';

export type SurfaceProps = ViewProps & {
  showCloseButton?: boolean;
  render?: RenderProp<ViewProps>;
  ref?: Ref<View>;
};

export type DialogContentProps = SurfaceProps & {
  dismissable?: boolean;
  initialFocusRef?: OverlayProps['initialFocusRef'];
};
