import { createContext, useContext, useMemo, type Ref } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Label, type LabelProps } from '@/registry/marcn/ui/label';
import { Text, type TextProps } from '@/registry/marcn/ui/text';

export type FieldOrientation = 'vertical' | 'horizontal';

type FieldState = { invalid: boolean; disabled: boolean };

const FieldContext = createContext<FieldState>({ invalid: false, disabled: false });

export const useField = () => useContext(FieldContext);

const createStyles = (t: Theme) =>
  StyleSheet.create({
    field: { gap: t.spacing[2] },
    horizontal: { flexDirection: 'row', alignItems: 'center' },
    group: { gap: t.spacing[6] },
    set: { gap: t.spacing[4] },
    legend: { fontSize: t.fontSize.base, fontWeight: t.fontWeight.medium },
    invalidLabel: { color: t.colors.destructive },
    description: { fontSize: t.fontSize.sm, color: t.colors.mutedForeground },
    error: { fontSize: t.fontSize.sm, color: t.colors.destructive },
  });

export type FieldProps = ViewProps & {
  orientation?: FieldOrientation;
  invalid?: boolean;
  disabled?: boolean;
  render?: RenderProp<ViewProps, FieldState>;
  ref?: Ref<View>;
};

export function Field({ orientation = 'vertical', invalid = false, disabled = false, style, render, ...props }: FieldProps) {
  const s = useStyles(createStyles);
  const state = useMemo(() => ({ invalid, disabled }), [invalid, disabled]);
  return (
    <FieldContext.Provider value={state}>
      {renderElement(View, render, { style: [s.field, orientation === 'horizontal' && s.horizontal, style], ...props } as ViewProps, state)}
    </FieldContext.Provider>
  );
}

export function FieldGroup({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  return <View style={[s.group, style]} {...props} />;
}

export function FieldSet({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  return <View style={[s.set, style]} {...props} />;
}

export function FieldLegend({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  return <Text accessibilityRole="header" style={[s.legend, style]} {...props} />;
}

export function FieldLabel({ style, disabled, ...props }: LabelProps) {
  const s = useStyles(createStyles);
  const field = useField();
  return <Label disabled={disabled ?? field.disabled} style={[field.invalid && s.invalidLabel, style]} {...props} />;
}

export function FieldDescription({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  return <Text style={[s.description, style]} {...props} />;
}

export type FieldErrorProps = TextProps & { message?: string };

export function FieldError({ style, message, children, ...props }: FieldErrorProps) {
  const s = useStyles(createStyles);
  const content = children ?? message;
  if (content === undefined || content === null || content === false || content === '') return null;
  return (
    <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[s.error, style]} {...props}>
      {content}
    </Text>
  );
}
