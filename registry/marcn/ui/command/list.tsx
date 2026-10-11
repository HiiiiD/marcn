import type { Ref } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import { useStyles } from '@/registry/marcn/lib/theme';
import { useCommand } from '@/registry/marcn/ui/command/context';
import { createStyles } from '@/registry/marcn/ui/command/styles';

export type CommandListProps = ScrollViewProps & { ref?: Ref<ScrollView> };

export function CommandList({ children, style, contentContainerStyle, ...props }: CommandListProps) {
  const s = useStyles(createStyles);
  const command = useCommand();
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      bounces={false}
      style={[s.list, style]}
      contentContainerStyle={[s.listContent, contentContainerStyle]}
      {...props}
    >
      {command.rank(children)}
    </ScrollView>
  );
}
