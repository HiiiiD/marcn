import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { FormField } from '@/components/ui/form-hook-form';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { RoleSelect } from './RoleSelect';
import { signUpDefaults, signUpSchema, type SignUp } from './signUpSchema';

export function FormsHookForm() {
  const [result, setResult] = useState('');
  const form = useForm<SignUp>({ resolver: zodResolver(signUpSchema), defaultValues: signUpDefaults, mode: 'onTouched' });

  return (
    <FieldGroup>
      <FormField control={form.control} name="email">
        {(f) => (
          <>
            <FieldLabel>Email</FieldLabel>
            <Input placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" {...f.text} />
            <FieldError message={f.error} />
          </>
        )}
      </FormField>
      <FormField control={form.control} name="password">
        {(f) => (
          <>
            <FieldLabel>Password</FieldLabel>
            <Input secureTextEntry placeholder="At least 8 characters" {...f.text} />
            <FieldDescription>Used to sign in.</FieldDescription>
            <FieldError message={f.error} />
          </>
        )}
      </FormField>
      <FormField control={form.control} name="role">
        {(f) => (
          <>
            <FieldLabel>Role</FieldLabel>
            <RoleSelect {...f.choice} />
            <FieldError message={f.error} />
          </>
        )}
      </FormField>
      <FormField control={form.control} name="terms" orientation="horizontal">
        {(f) => (
          <>
            <Checkbox accessibilityLabel="Accept terms" {...f.checked} />
            <FieldLabel>Accept terms</FieldLabel>
          </>
        )}
      </FormField>
      <FieldError message={form.formState.errors.terms?.message} />
      <Button onPress={form.handleSubmit((v) => setResult(`Signed up ${v.email} as ${v.role}`))}>
        <Text>Sign up</Text>
      </Button>
      {result ? <Text>{result}</Text> : null}
    </FieldGroup>
  );
}
