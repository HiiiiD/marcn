import { createContext, useContext, useMemo, useRef, type RefObject } from 'react';
import type { View } from 'react-native';
import { Overlay, type OverlayProps } from '@/registry/marcn/lib/overlay';
import {
  OverlayClose, OverlayRoot, OverlayTrigger, type OverlayCloseProps, type OverlayRootProps,
} from '@/registry/marcn/lib/overlay-root';
import { mergeRefs } from '@/registry/marcn/lib/render';
import { Button } from '@/registry/marcn/ui/button';
import {
  DialogDescription, DialogFooter, DialogHeader, DialogSurface, DialogTitle, type SurfaceProps,
} from '@/registry/marcn/ui/dialog';

type AlertContextValue = { cancelRef: RefObject<View | null> };

const AlertContext = createContext<AlertContextValue | null>(null);

function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('AlertDialog parts must be used within an AlertDialog');
  return ctx;
}

export type AlertDialogProps = OverlayRootProps;

export function AlertDialog(props: AlertDialogProps) {
  const cancelRef = useRef<View>(null);
  const value = useMemo(() => ({ cancelRef }), []);
  return (
    <AlertContext.Provider value={value}>
      <OverlayRoot {...props} />
    </AlertContext.Provider>
  );
}

export const AlertDialogTrigger = OverlayTrigger;
export const AlertDialogHeader = DialogHeader;
export const AlertDialogFooter = DialogFooter;
export const AlertDialogTitle = DialogTitle;
export const AlertDialogDescription = DialogDescription;

export type AlertDialogContentProps = Omit<SurfaceProps, 'showCloseButton'> & {
  initialFocusRef?: OverlayProps['initialFocusRef'];
};

export function AlertDialogContent({ initialFocusRef, ...props }: AlertDialogContentProps) {
  const alert = useAlert();
  return (
    <Overlay dismissOnBackdrop={false} initialFocusRef={initialFocusRef ?? alert.cancelRef}>
      <AlertContext.Provider value={alert}>
        <DialogSurface role="alertdialog" {...props} showCloseButton={false} />
      </AlertContext.Provider>
    </Overlay>
  );
}

export function AlertDialogAction({ render, ...props }: OverlayCloseProps) {
  return <OverlayClose render={render ?? <Button />} {...props} />;
}

export function AlertDialogCancel({ render, ref, ...props }: OverlayCloseProps) {
  const { cancelRef } = useAlert();
  return <OverlayClose render={render ?? <Button variant="outline" />} ref={mergeRefs(ref, cancelRef)} {...props} />;
}
