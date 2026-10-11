import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { FormField } from '@/components/ui/form-tanstack';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { RoleSelect } from './RoleSelect';
import { signUpDefaults, signUpSchema } from './signUpSchema';

export function FormsTanstack() {
  const [result, setResult] = useState('');
  const form = useForm({
    defaultValues: signUpDefaults,
    validators: { onChange: signUpSchema },
    onSubmit: ({ value }) => setResult(`Signed up ${value.email} as ${value.role}`),
  });

  return (
    <FieldGroup>
      <form.Field name="email">
        {(field) => (
          <FormField field={field}>
            {(f) => (
              <>
                <FieldLabel>Email</FieldLabel>
                <Input placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" {...f.text} />
                <FieldError message={f.error} />
              </>
            )}
          </FormField>
        )}
      </form.Field>
      <form.Field name="password">
        {(field) => (
          <FormField field={field}>
            {(f) => (
              <>
                <FieldLabel>Password</FieldLabel>
                <Input secureTextEntry placeholder="At least 8 characters" {...f.text} />
                <FieldDescription>Used to sign in.</FieldDescription>
                <FieldError message={f.error} />
              </>
            )}
          </FormField>
        )}
      </form.Field>
      <form.Field name="role">
        {(field) => (
          <FormField field={field}>
            {(f) => (
              <>
                <FieldLabel>Role</FieldLabel>
                <RoleSelect {...f.choice} invalid={f.invalid} error={f.error} />
                <FieldError message={f.error} />
              </>
            )}
          </FormField>
        )}
      </form.Field>
      <form.Field name="terms">
        {(field) => (
          <FormField field={field} orientation="horizontal">
            {(f) => (
              <>
                <Checkbox accessibilityLabel="Accept terms" {...f.checked} />
                <FieldLabel>Accept terms</FieldLabel>
                <FieldError message={f.error} />
              </>
            )}
          </FormField>
        )}
      </form.Field>
      <Button onPress={() => form.handleSubmit()}>
        <Text>Sign up</Text>
      </Button>
      {result ? <Text>{result}</Text> : null}
    </FieldGroup>
  );
}
