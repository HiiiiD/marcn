import { useState, type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { Text } from '@/components/ui/text';
import { Section } from './Section';

function SixDigits(props: Partial<ComponentProps<typeof InputOTP>>) {
  return (
    <InputOTP maxLength={6} accessibilityLabel="Verification code" {...props}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}

export function InputOtp() {
  const [done, setDone] = useState('');
  const [value, setValue] = useState('');

  return (
    <>
      <Section title="Input OTP">
        <SixDigits onComplete={setDone} onChange={() => setDone('')} />
        <Text variant="muted">{done ? `Complete: ${done}` : 'Type or paste a 6-digit code'}</Text>
      </Section>
      <Section title="Input OTP controlled">
        <SixDigits value={value} onChange={setValue} />
        <View style={styles.row}>
          <Button size="sm" onPress={() => setValue('123456')}>Fill 123456</Button>
          <Button size="sm" variant="outline" onPress={() => setValue('')}>Clear</Button>
        </View>
      </Section>
      <Section title="Input OTP invalid and disabled">
        <SixDigits defaultValue="123" aria-invalid />
        <SixDigits defaultValue="123" disabled />
      </Section>
      <Section title="Input OTP alphanumeric">
        <InputOTP maxLength={4} pattern={/^[a-z0-9]$/i} accessibilityLabel="Access code">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
});
