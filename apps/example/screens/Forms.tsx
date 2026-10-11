import { Text } from '@/components/ui/text';
import { FormsHookForm } from './FormsHookForm';
import { FormsTanstack } from './FormsTanstack';
import { Section } from './Section';

export function Forms() {
  return (
    <>
      <Section title="Form: React Hook Form">
        <FormsHookForm />
      </Section>
      <Section title="Form: TanStack Form">
        <Text variant="muted">Same sign-up form, validated by the same zod schema.</Text>
        <FormsTanstack />
      </Section>
    </>
  );
}
