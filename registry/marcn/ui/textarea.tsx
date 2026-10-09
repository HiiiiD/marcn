import { StyleSheet } from 'react-native';
import { Input, type InputProps } from '@/registry/marcn/ui/input';

const styles = StyleSheet.create({
  area: { height: undefined, minHeight: 64, paddingVertical: 8, textAlignVertical: 'top' },
});

export function Textarea({ style, ...props }: InputProps) {
  return <Input multiline style={[styles.area, style]} {...props} />;
}
