import { createContext, useContext, useEffect, useMemo, useRef, useState, type RefObject, type Ref } from 'react';
import { Pressable, StyleSheet, View, type PressableProps, type TextInput, type ViewProps } from 'react-native';
import { mergeRefs } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Button, type ButtonProps } from '@/registry/marcn/ui/button';
import { Input, type InputProps } from '@/registry/marcn/ui/input';
import { Text, TextStyleContext, type TextProps } from '@/registry/marcn/ui/text';
import { Textarea } from '@/registry/marcn/ui/textarea';

type GroupContext = {
  disabled: boolean;
  controlRef: RefObject<TextInput | null>;
  setFocused: (value: boolean) => void;
  setInvalid: (value: boolean) => void;
};

export type InputGroupProps = ViewProps & { disabled?: boolean; ref?: Ref<View> };
export type InputGroupAddonAlign = 'inline-start' | 'inline-end' | 'block-start' | 'block-end';
export type InputGroupAddonProps = Omit<PressableProps, 'style'> & { align?: InputGroupAddonAlign; style?: ViewProps['style'] };
export type InputGroupButtonSize = 'xs' | 'sm' | 'icon-xs' | 'icon-sm';
export type InputGroupButtonProps = Omit<ButtonProps, 'size'> & { size?: InputGroupButtonSize };

const GroupContext = createContext<GroupContext | null>(null);

function useGroup(part: string) {
  const group = useContext(GroupContext);
  if (!group) throw new Error(`${part} must be used within <InputGroup>`);
  return group;
}

const createStyles = (t: Theme) => ({
  group: StyleSheet.create({
    root: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      width: '100%',
      minHeight: 36,
      borderWidth: 1,
      borderColor: t.colors.input,
      borderRadius: t.radius.md,
    },
    focused: { borderColor: t.colors.ring },
    invalid: { borderColor: t.colors.destructive },
    disabled: { opacity: 0.5 },
  }),
  addon: StyleSheet.create({
    base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.spacing[2] },
    'inline-start': { paddingStart: t.spacing[3] },
    'inline-end': { paddingEnd: t.spacing[3] },
    'block-start': { width: '100%', justifyContent: 'flex-start', paddingHorizontal: t.spacing[3], paddingVertical: t.spacing[2] },
    'block-end': { width: '100%', justifyContent: 'flex-start', paddingHorizontal: t.spacing[3], paddingVertical: t.spacing[2] },
  }),
  button: StyleSheet.create({
    xs: { height: 24, paddingHorizontal: t.spacing[2], borderRadius: t.radius.sm },
    sm: { height: 32, paddingHorizontal: t.spacing[3] },
    'icon-xs': { height: 24, width: 24, paddingHorizontal: 0, borderRadius: t.radius.sm },
    'icon-sm': { height: 32, width: 32, paddingHorizontal: 0 },
  }),
  text: StyleSheet.create({
    muted: { fontSize: t.fontSize.sm, color: t.colors.mutedForeground },
  }),
  control: StyleSheet.create({
    bare: { flex: 1, minWidth: 0, borderWidth: 0, borderRadius: 0, backgroundColor: 'transparent' },
  }),
});

export function InputGroup({ disabled = false, style, ...props }: InputGroupProps) {
  const s = useStyles(createStyles);
  const [focused, setFocused] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const controlRef = useRef<TextInput>(null);
  const value = useMemo(() => ({ disabled, controlRef, setFocused, setInvalid }), [disabled]);
  return (
    <GroupContext.Provider value={value}>
      <View
        role="group"
        style={[s.group.root, focused && s.group.focused, invalid && s.group.invalid, disabled && s.group.disabled, style]}
        {...props}
      />
    </GroupContext.Provider>
  );
}

export function InputGroupAddon({ align = 'inline-start', style, children, onPress, ...props }: InputGroupAddonProps) {
  const s = useStyles(createStyles);
  const group = useGroup('InputGroupAddon');
  const content = typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
  return (
    <TextStyleContext.Provider value={s.text.muted}>
      <Pressable
        accessible={false}
        style={[s.addon.base, s.addon[align], style]}
        {...props}
        onPress={(e) => {
          group.controlRef.current?.focus();
          onPress?.(e);
        }}
      >
        {content}
      </Pressable>
    </TextStyleContext.Provider>
  );
}

export function InputGroupButton({ variant = 'ghost', size = 'xs', style, ...props }: InputGroupButtonProps) {
  const s = useStyles(createStyles);
  return <Button variant={variant} size="sm" style={[s.button[size], style]} {...props} />;
}

export function InputGroupText({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  return <Text style={[s.text.muted, style]} {...props} />;
}

function useControl(part: string, { ref, disabled, onFocus, onBlur, 'aria-invalid': ariaInvalid }: InputProps) {
  const group = useGroup(part);
  const { setInvalid, setFocused } = group;
  useEffect(() => {
    setInvalid(ariaInvalid === true);
    return () => setInvalid(false);
  }, [ariaInvalid, setInvalid]);
  return {
    ref: mergeRefs(group.controlRef, ref),
    disabled: disabled || group.disabled,
    onFocus: (e: Parameters<NonNullable<InputProps['onFocus']>>[0]) => {
      setFocused(true);
      onFocus?.(e);
    },
    onBlur: (e: Parameters<NonNullable<InputProps['onBlur']>>[0]) => {
      setFocused(false);
      onBlur?.(e);
    },
  };
}

export function InputGroupInput({ style, ...props }: InputProps) {
  const s = useStyles(createStyles);
  return <Input {...props} {...useControl('InputGroupInput', props)} style={[s.control.bare, style]} />;
}

export function InputGroupTextarea({ style, ...props }: InputProps) {
  const s = useStyles(createStyles);
  return <Textarea {...props} {...useControl('InputGroupTextarea', props)} style={[s.control.bare, style]} />;
}
