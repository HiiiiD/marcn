import { Overlay } from '@/registry/marcn/ui/overlay';
import { OverlayClose, OverlayRoot, OverlayTrigger } from '@/registry/marcn/ui/overlay/overlay-root';
import { SheetSurface } from '@/registry/marcn/ui/sheet/surface';
import type { SheetContentProps } from '@/registry/marcn/ui/sheet/types';

export type { SheetContentProps, SheetSide } from '@/registry/marcn/ui/sheet/types';
export { SheetFlatList, SheetScrollView } from '@/registry/marcn/ui/sheet/scroll';
export { DialogHeader as SheetHeader, DialogFooter as SheetFooter, DialogTitle as SheetTitle, DialogDescription as SheetDescription } from '@/registry/marcn/ui/dialog';

export const Sheet = OverlayRoot;
export const SheetTrigger = OverlayTrigger;
export const SheetClose = OverlayClose;

export function SheetContent({ dismissable, initialFocusRef, ...props }: SheetContentProps) {
  return (
    <Overlay dismissable={dismissable} initialFocusRef={initialFocusRef}>
      <SheetSurface {...props} />
    </Overlay>
  );
}

