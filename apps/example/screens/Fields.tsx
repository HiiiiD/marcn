import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Section } from './Section';

export function Fields() {
  const [email, setEmail] = useState('nope');
  const [terms, setTerms] = useState(false);
  const [push, setPush] = useState(true);
  const invalid = !email.includes('@');

  return (
    <Section title="Field">
      <FieldGroup>
        <Field invalid={invalid}>
          <FieldLabel>Email</FieldLabel>
          <Input value={email} onChangeText={setEmail} aria-invalid={invalid} autoCapitalize="none" />
          <FieldDescription>We never share it.</FieldDescription>
          <FieldError message={invalid ? 'Enter a valid email address.' : undefined} />
        </Field>
        <Field>
          <FieldLabel>Message</FieldLabel>
          <Textarea placeholder="Type your message" />
        </Field>
        <Field disabled>
          <FieldLabel>Username</FieldLabel>
          <Input value="marco" disabled />
        </Field>
        <FieldSet>
          <FieldLegend>Preferences</FieldLegend>
          <Field orientation="horizontal">
            <Checkbox checked={terms} onCheckedChange={setTerms} accessibilityLabel="Accept terms" />
            <FieldLabel>Accept terms</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Switch checked={push} onCheckedChange={setPush} accessibilityLabel="Push notifications" />
            <FieldLabel>Push notifications</FieldLabel>
          </Field>
        </FieldSet>
      </FieldGroup>
    </Section>
  );
}
