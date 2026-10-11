import type { ReactNode } from 'react';
import { Field, type FieldProps } from '@/registry/marcn/ui/field';

type FieldLike<TValue> = {
  state: { value: TValue; meta: { isTouched: boolean; isValid: boolean; errors: unknown[] } };
  handleChange(value: TValue): void;
  handleBlur(): void;
};

export type FormFieldBindings = {
  text: {
    value: string;
    onChangeText: (value: string) => void;
    onBlur: () => void;
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

export type FormFieldProps<TValue> = Omit<FieldProps, 'children' | 'invalid'> & {
  field: FieldLike<TValue>;
  children: (bindings: FormFieldBindings) => ReactNode;
};

// Standard-schema issues (zod, valibot) arrive as `{ message }`, plain validators as strings.
const toMessage = (error: unknown) =>
  typeof error === 'string' ? error : ((error as { message?: unknown } | null)?.message as string | undefined);

export function FormField<TValue>({ field, disabled, children, ...fieldProps }: FormFieldProps<TValue>) {
  const { meta, value } = field.state;
  const invalid = meta.isTouched && !meta.isValid;
  const error = invalid ? meta.errors.map(toMessage).find(Boolean) : undefined;
  const set = field.handleChange as (value: unknown) => void;
  return (
    <Field invalid={invalid} disabled={disabled} {...fieldProps}>
      {children({
        text: {
          value: (value as string | undefined) ?? '',
          onChangeText: set,
          onBlur: field.handleBlur,
          'aria-invalid': invalid,
          accessibilityHint: error,
          disabled,
        },
        checked: {
          checked: !!value,
          onCheckedChange: set,
          onBlur: field.handleBlur,
          'aria-invalid': invalid,
          accessibilityHint: error,
          disabled,
        },
        choice: {
          value: (value as string | undefined) ?? '',
          onValueChange: set,
          'aria-invalid': invalid,
          accessibilityHint: error,
          disabled,
        },
        invalid,
        error,
      })}
    </Field>
  );
}
