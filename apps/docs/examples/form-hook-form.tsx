import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { FormField } from '@/components/ui/form-hook-form';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

type Values = { email: string; terms: boolean };

export default function Example() {
  const [result, setResult] = useState('');
  const form = useForm<Values>({ defaultValues: { email: '', terms: false }, mode: 'onTouched' });

  return (
    <FieldGroup>
      <FormField
        control={form.control}
        name="email"
        rules={{ required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } }}
      >
        {(f) => (
          <>
            <FieldLabel>Email</FieldLabel>
            <Input placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" {...f.text} />
            <FieldError message={f.error} />
          </>
        )}
      </FormField>
      <FormField control={form.control} name="terms" orientation="horizontal" rules={{ validate: (v) => v || 'Accept the terms' }}>
        {(f) => (
          <>
            <Checkbox accessibilityLabel="Accept terms" {...f.checked} />
            <FieldLabel>Accept terms</FieldLabel>
          </>
        )}
      </FormField>
      <FieldError message={form.formState.errors.terms?.message} />
      <Button onPress={form.handleSubmit((v) => setResult(`Signed up ${v.email}`))}>
        <Text>Sign up</Text>
      </Button>
      {result ? <Text>{result}</Text> : null}
    </FieldGroup>
  );
}
