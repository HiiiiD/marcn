import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { Text } from '@/components/ui/text';

export default function Example() {
  const [value, setValue] = useState('');

  return (
    <View style={{ gap: 12 }}>
      <InputOTP maxLength={6} value={value} onChange={setValue} accessibilityLabel="Verification code">
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
      <Text variant="muted">{value.length === 6 ? `Complete: ${value}` : 'Enter a 6-digit code'}</Text>
      <Button size="sm" variant="outline" onPress={() => setValue('123456')}>Fill 123456</Button>
    </View>
  );
}
