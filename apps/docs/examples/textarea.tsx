import { useState } from 'react';
import { View } from 'react-native';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';

export default function Example() {
  const [message, setMessage] = useState('');
  return (
    <View style={{ gap: 8 }}>
      <Label>Message</Label>
      <Textarea placeholder="Type your message" value={message} onChangeText={setMessage} />
      <Text variant="muted">{message.length} characters</Text>
    </View>
  );
}
