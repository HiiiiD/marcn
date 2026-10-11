import { useState } from 'react';
import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

export default function Example() {
  const [email, setEmail] = useState('');
  return (
    <View style={{ gap: 8 }}>
      <Label>Email</Label>
      <Input placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Input placeholder="Disabled" disabled />
      <Text variant="muted">Typed: {email || '(nothing yet)'}</Text>
    </View>
  );
}
