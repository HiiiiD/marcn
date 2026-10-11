import { useEffect } from 'react';
import { mergeRefs } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { Input, type InputProps } from '@/registry/marcn/ui/input';
import { Textarea } from '@/registry/marcn/ui/textarea';
import { useGroup } from '@/registry/marcn/ui/input-group/context';
import { createStyles } from '@/registry/marcn/ui/input-group/styles';

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
    // The group already dims itself; the control must not dim again on top.
    dimStyle: group.disabled ? { opacity: 1 } : undefined,
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
  const { dimStyle, ...control } = useControl('InputGroupInput', props);
  return <Input {...props} {...control} style={[s.control.bare, dimStyle, style]} />;
}

export function InputGroupTextarea({ style, ...props }: InputProps) {
  const s = useStyles(createStyles);
  const { dimStyle, ...control } = useControl('InputGroupTextarea', props);
  return <Textarea {...props} {...control} style={[s.control.bare, dimStyle, style]} />;
}
