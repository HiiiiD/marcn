import { useForm } from '@tanstack/react-form';
import { fireEvent, render, screen, act, waitFor } from '@testing-library/react-native';
import { Checkbox } from '@/registry/marcn/ui/checkbox';
import { FieldError } from '@/registry/marcn/ui/field';
import { FormField } from '@/registry/marcn/ui/form-tanstack';
import { Input } from '@/registry/marcn/ui/input';
import { RadioGroup, RadioGroupItem } from '@/registry/marcn/ui/radio-group';
import { lightColors } from '@/registry/marcn/lib/theme';

type Values = { email: string; terms: boolean; plan: string };
let onSubmit: jest.Mock;
let form: ReturnType<typeof makeForm>;

const makeForm = () =>
  useForm({
    defaultValues: { email: '', terms: false, plan: 'free' } as Values,
    onSubmit: ({ value }) => onSubmit(value),
  });

function Harness() {
  form = makeForm();
  return (
    <>
      <form.Field name="email" validators={{ onChange: ({ value }) => (value.includes('@') ? undefined : { message: 'Enter a valid email' }) }}>
        {(field) => (
          <FormField field={field}>
            {(f) => (
              <>
                <Input placeholder="you@example.com" {...f.text} />
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
                <Checkbox accessibilityLabel="Terms" {...f.checked} />
                <FieldError message={f.error} />
              </>
            )}
          </FormField>
        )}
      </form.Field>
      <form.Field name="plan">
        {(field) => (
          <FormField field={field}>
            {(f) => (
              <RadioGroup {...f.choice}>
                <RadioGroupItem value="free" accessibilityLabel="Free" />
                <RadioGroupItem value="pro" accessibilityLabel="Pro" />
              </RadioGroup>
            )}
          </FormField>
        )}
      </form.Field>
    </>
  );
}

beforeEach(() => {
  onSubmit = jest.fn();
  render(<Harness />);
});

const submit = () => act(async () => { await form.handleSubmit(); });

test('hides errors until touched, then shows them with invalid state', async () => {
  expect(screen.queryByRole('alert')).toBeNull();
  await submit();
  expect(screen.getAllByRole('alert')[0]).toHaveTextContent('Enter a valid email');
  const input = screen.getByPlaceholderText('you@example.com');
  expect(input.props.accessibilityHint).toBe('Enter a valid email');
  expect(input).toHaveStyle({ borderColor: lightColors.destructive });
  expect(onSubmit).not.toHaveBeenCalled();
});

test('shows an error on blur after typing an invalid value', async () => {
  const input = screen.getByPlaceholderText('you@example.com');
  fireEvent.changeText(input, 'nope');
  fireEvent(input, 'blur');
  await waitFor(() => expect(screen.getAllByRole('alert')[0]).toHaveTextContent('Enter a valid email'));
});

test('valid values submit', async () => {
  fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'a@b.co');
  fireEvent.press(screen.getByRole('checkbox'));
  fireEvent.press(screen.getByRole('radio', { name: 'Pro' }));
  await submit();
  expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.co', terms: true, plan: 'pro' });
  expect(screen.queryByRole('alert')).toBeNull();
});
