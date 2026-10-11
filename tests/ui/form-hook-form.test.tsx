import { useForm } from 'react-hook-form';
import { fireEvent, render, screen, act, waitFor } from '@testing-library/react-native';
import { Checkbox } from '@/registry/marcn/ui/checkbox';
import { FieldError, FieldLabel } from '@/registry/marcn/ui/field';
import { FormField } from '@/registry/marcn/ui/form-hook-form';
import { Input } from '@/registry/marcn/ui/input';
import { RadioGroup, RadioGroupItem } from '@/registry/marcn/ui/radio-group';
import { lightColors } from '@/registry/marcn/lib/theme';

type Values = { email: string; terms: boolean; plan: string };
let submitted: jest.Mock;
let api: ReturnType<typeof useForm<Values>>;

function Harness({ onValid }: { onValid: (values: Values) => void }) {
  api = useForm<Values>({ defaultValues: { email: '', terms: false, plan: 'free' } });
  return (
    <>
      <FormField control={api.control} name="email" rules={{ required: 'Email is required' }}>
        {(f) => (
          <>
            <FieldLabel>Email</FieldLabel>
            <Input placeholder="you@example.com" {...f.text} />
            <FieldError message={f.error} />
          </>
        )}
      </FormField>
      <FormField control={api.control} name="terms" orientation="horizontal" rules={{ validate: (v) => v || 'Accept the terms' }}>
        {(f) => (
          <>
            <Checkbox accessibilityLabel="Terms" {...f.checked} />
            <FieldError message={f.error} />
          </>
        )}
      </FormField>
      <FormField control={api.control} name="plan">
        {(f) => (
          <RadioGroup {...f.choice}>
            <RadioGroupItem value="free" accessibilityLabel="Free" />
            <RadioGroupItem value="pro" accessibilityLabel="Pro" />
          </RadioGroup>
        )}
      </FormField>
    </>
  );
}

const submit = () => act(async () => { await api.handleSubmit((v) => submitted(v))(); });

beforeEach(() => {
  submitted = jest.fn();
  render(<Harness onValid={submitted} />);
});

test('shows the error after a failed submit and wires invalid state', async () => {
  expect(screen.queryByRole('alert')).toBeNull();
  await submit();
  expect(screen.getAllByRole('alert')[0]).toHaveTextContent('Email is required');
  const input = screen.getByPlaceholderText('you@example.com');
  expect(input.props.accessibilityHint).toBe('Email is required');
  expect(input).toHaveStyle({ borderColor: lightColors.destructive });
  expect(screen.getByText('Email')).toHaveStyle({ color: lightColors.destructive });
  expect(submitted).not.toHaveBeenCalled();
});

test('typing updates the value and clears the error on revalidation', async () => {
  await submit();
  fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'a@b.co');
  fireEvent.press(screen.getByRole('checkbox'));
  await submit();
  expect(screen.queryByRole('alert')).toBeNull();
  expect(submitted).toHaveBeenCalledWith({ email: 'a@b.co', terms: true, plan: 'free' });
});

test('checkbox binds checked/onCheckedChange', async () => {
  const box = screen.getByRole('checkbox');
  expect(box).toHaveProp('accessibilityState', expect.objectContaining({ checked: false }));
  fireEvent.press(box);
  await waitFor(() => expect(screen.getByRole('checkbox')).toHaveProp('accessibilityState', expect.objectContaining({ checked: true })));
});

test('choice binds value/onValueChange', async () => {
  fireEvent.press(screen.getByRole('radio', { name: 'Pro' }));
  await waitFor(() => expect(api.getValues('plan')).toBe('pro'));
});
