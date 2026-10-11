import type { ReactNode, Ref } from 'react';
import { Controller, type ControllerProps, type FieldPath, type FieldValues } from 'react-hook-form';
import { Field, type FieldProps } from '@/registry/marcn/ui/field';

export type FormFieldBindings = {
  text: {
    value: string;
    onChangeText: (value: string) => void;
    onBlur: () => void;
    ref: Ref<any>;
    'aria-invalid': boolean;
    accessibilityHint?: string;
    disabled?: boolean;
  };
  checked: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    onBlur: () => void;
    'aria-invalid': boolean;
    accessibilityHint?: string;
    disabled?: boolean;
  };
  choice: {
    value: string;
    onValueChange: (value: string) => void;
    'aria-invalid': boolean;
    accessibilityHint?: string;
    disabled?: boolean;
  };
  invalid: boolean;
  error?: string;
};

export type FormFieldProps<TValues extends FieldValues, TName extends FieldPath<TValues>> = Omit<
  ControllerProps<TValues, TName>,
  'render' | 'children'
> &
  Omit<FieldProps, 'children' | 'invalid' | 'disabled'> & {
    children: (bindings: FormFieldBindings) => ReactNode;
  };

export function FormField<TValues extends FieldValues, TName extends FieldPath<TValues>>({
  control,
  name,
  rules,
  defaultValue,
  shouldUnregister,
  disabled,
  children,
  ...fieldProps
}: FormFieldProps<TValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue}
      shouldUnregister={shouldUnregister}
      disabled={disabled}
      render={({ field, fieldState }) => {
        const invalid = fieldState.invalid;
        const error = fieldState.error?.message;
        const accessibilityHint = error;
        return (
          <Field invalid={invalid} disabled={field.disabled} {...fieldProps}>
            {children({
              text: {
                value: field.value ?? '',
                onChangeText: field.onChange,
                onBlur: field.onBlur,
                ref: field.ref,
                'aria-invalid': invalid,
                accessibilityHint,
                disabled: field.disabled,
              },
              checked: {
                checked: !!field.value,
                onCheckedChange: field.onChange,
                onBlur: field.onBlur,
                'aria-invalid': invalid,
                accessibilityHint,
                disabled: field.disabled,
              },
              choice: {
                value: field.value ?? '',
                onValueChange: field.onChange,
                'aria-invalid': invalid,
                accessibilityHint,
                disabled: field.disabled,
              },
              invalid,
              error,
            })}
          </Field>
        );
      }}
    />
  );
}
