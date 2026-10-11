import type { Ref } from 'react';
import { View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { CollapsibleContext, type CollapsibleState } from '@/registry/marcn/ui/collapsible/context';

export { useCollapsible, type CollapsibleState } from '@/registry/marcn/ui/collapsible/context';
export * from '@/registry/marcn/ui/collapsible/trigger';
export * from '@/registry/marcn/ui/collapsible/content';

export type CollapsibleProps = ViewProps & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  render?: RenderProp<ViewProps, CollapsibleState>;
  ref?: Ref<View>;
};

export function Collapsible({ open: openProp, defaultOpen = false, onOpenChange, disabled = false, render, ...props }: CollapsibleProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  return (
    <CollapsibleContext.Provider value={{ open, disabled, setOpen }}>
      {renderElement(View, render, props as ViewProps, { open, disabled })}
    </CollapsibleContext.Provider>
  );
}
