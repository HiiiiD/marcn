import { useId, type ReactNode, type Ref } from 'react';
import { View, type ViewProps } from 'react-native';
import { useStyles } from '@/registry/marcn/lib/theme';
import { Text } from '@/registry/marcn/ui/text';
import { GroupIdContext, useCommand } from '@/registry/marcn/ui/command/context';
import { createStyles } from '@/registry/marcn/ui/command/styles';

export type CommandGroupProps = Omit<ViewProps, 'children'> & {
  heading?: ReactNode;
  children?: ReactNode;
  ref?: Ref<View>;
};

export function CommandGroup({ heading, children, style, ...props }: CommandGroupProps) {
  const s = useStyles(createStyles);
  const command = useCommand();
  const id = useId();
  // Hidden by style, not unmounted: its items must stay registered to bring it back.
  const visible = command.isGroupVisible(id);
  return (
    <GroupIdContext.Provider value={id}>
      <View
        role="group"
        accessibilityLabel={typeof heading === 'string' ? heading : undefined}
        style={[s.group, !visible && s.hidden, style]}
        {...props}
      >
        {typeof heading === 'string' || typeof heading === 'number' ? <Text style={s.heading}>{heading}</Text> : heading}
        {command.rank(children)}
      </View>
    </GroupIdContext.Provider>
  );
}

CommandGroup.commandKind = 'group' as const;
