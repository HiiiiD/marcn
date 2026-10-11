import type { ComponentProps } from 'react';
import { MenuSeparator } from '@/registry/marcn/ui/menu/menu-item';
import { useCommand } from '@/registry/marcn/ui/command/context';

export function CommandSeparator(props: ComponentProps<typeof MenuSeparator>) {
  const { searching } = useCommand();
  if (searching) return null;
  return <MenuSeparator {...props} />;
}
