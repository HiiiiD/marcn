import { Children, isValidElement, useLayoutEffect, type ReactNode } from 'react';
import { MenuSurface, type MenuSurfaceProps } from '@/registry/marcn/ui/menu/menu-surface';
import { Overlay, type OverlayProps } from '@/registry/marcn/ui/overlay';
import { SelectContext, useSelect } from '@/registry/marcn/ui/select/context';
import { SelectItem, itemLabel, type SelectItemProps } from '@/registry/marcn/ui/select/select-item';

export type SelectContentProps = MenuSurfaceProps & {
  dismissable?: boolean;
  initialFocusRef?: OverlayProps['initialFocusRef'];
};

// Closed items are not mounted, so SelectValue learns their labels by reading the SelectItem elements.
// Items wrapped in your own components are only discovered once the list has been opened.
function collectLabels(children: ReactNode, into: Record<string, string> = {}) {
  Children.forEach(children, (child) => {
    if (!isValidElement<SelectItemProps & { children?: ReactNode }>(child)) return;
    if (child.type === SelectItem) into[child.props.value] = itemLabel(child.props);
    else collectLabels(child.props.children, into);
  });
  return into;
}

export function SelectContent({ dismissable, initialFocusRef, children, ...props }: SelectContentProps) {
  const select = useSelect();
  const { registerLabels } = select;
  useLayoutEffect(() => registerLabels(collectLabels(children)), [registerLabels, children]);
  return (
    <Overlay modal scrim={false} dismissable={dismissable} initialFocusRef={initialFocusRef}>
      <SelectContext.Provider value={select}>
        <MenuSurface matchTriggerWidth {...props}>
          {children}
        </MenuSurface>
      </SelectContext.Provider>
    </Overlay>
  );
}
