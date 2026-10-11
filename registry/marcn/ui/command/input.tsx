import { useContext, type ComponentProps } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Search } from 'lucide-react-native';
import { useStyles } from '@/registry/marcn/lib/theme';
import { Icon } from '@/registry/marcn/ui/icon';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/registry/marcn/ui/input-group';
import { AutoFocusContext, useCommand } from '@/registry/marcn/ui/command/context';
import { createStyles } from '@/registry/marcn/ui/command/styles';

export type CommandInputProps = ComponentProps<typeof InputGroupInput> & { containerStyle?: StyleProp<ViewStyle> };

export function CommandInput({ containerStyle, onChangeText, onSubmitEditing, autoFocus, ...props }: CommandInputProps) {
  const s = useStyles(createStyles);
  const command = useCommand();
  const dialogFocus = useContext(AutoFocusContext);
  return (
    <View style={[s.inputWrap, containerStyle]}>
      <InputGroup style={s.inputGroup}>
        <InputGroupAddon>
          <Icon icon={Search} />
        </InputGroupAddon>
        <InputGroupInput
          role="searchbox"
          accessibilityLabel={props.placeholder}
          autoFocus={autoFocus ?? dialogFocus}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          // Stays focused on a miss; Gboard hides itself on "done".
          submitBehavior="submit"
          {...props}
          value={command.search}
          onChangeText={(text) => {
            command.setSearch(text);
            onChangeText?.(text);
          }}
          onSubmitEditing={(event) => {
            command.submit();
            onSubmitEditing?.(event);
          }}
        />
      </InputGroup>
    </View>
  );
}
