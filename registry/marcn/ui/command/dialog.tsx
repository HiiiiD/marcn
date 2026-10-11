import { useStyles } from '@/registry/marcn/lib/theme';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/registry/marcn/ui/dialog';
import { Command, type CommandProps } from '@/registry/marcn/ui/command/command';
import { AutoFocusContext } from '@/registry/marcn/ui/command/context';
import { createStyles } from '@/registry/marcn/ui/command/styles';

export type CommandDialogProps = Omit<CommandProps, 'ref' | 'render'> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
};

export function CommandDialog({
  open, defaultOpen, onOpenChange, title = 'Command Palette', description = 'Search for a command to run...',
  showCloseButton = false, children, ...props
}: CommandDialogProps) {
  const s = useStyles(createStyles);
  return (
    <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={showCloseButton} style={s.dialog}>
        {/* Kept in the tree so the surface is labelled for screen readers, but not drawn. */}
        <DialogHeader style={s.srOnly}>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <AutoFocusContext.Provider value>
          <Command {...props}>{children}</Command>
        </AutoFocusContext.Provider>
      </DialogContent>
    </Dialog>
  );
}
