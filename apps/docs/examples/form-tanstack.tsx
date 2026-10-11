import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { FormField } from '@/components/ui/form-tanstack';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

export default function Example() {
  const [result, setResult] = useState('');
  const form = useForm({
    defaultValues: { email: '', terms: false },
    onSubmit: ({ value }) => setResult(`Signed up ${value.email}`),
  });

  return (
    <FieldGroup>
      <form.Field
        name="email"
        validators={{ onChange: ({ value }) => (/^\S+@\S+\.\S+$/.test(value) ? undefined : 'Enter a valid email') }}
      >
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
      <form.Field name="terms" validators={{ onChange: ({ value }) => (value ? undefined : 'Accept the terms') }}>
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
