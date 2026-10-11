import { Overlay } from '@/registry/marcn/ui/overlay';
import { DialogSurface } from '@/registry/marcn/ui/dialog/surface';
import type { DialogContentProps } from '@/registry/marcn/ui/dialog/types';

export function DialogContent({ dismissable, initialFocusRef, ...props }: DialogContentProps) {
  return (
    <Overlay dismissable={dismissable} initialFocusRef={initialFocusRef}>
      <DialogSurface {...props} />
    </Overlay>
  );
}
