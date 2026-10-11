import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';

export default function Example() {
  const [value, setValue] = useState(40);
  return (
    <View style={{ gap: 12 }}>
      <Progress value={value} />
      <Button onPress={() => setValue((v) => (v >= 100 ? 0 : v + 20))}>
        <Text>Advance ({value}%)</Text>
      </Button>
    </View>
  );
}
