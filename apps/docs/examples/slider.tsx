import { useState } from 'react';
import { View } from 'react-native';
import { Slider } from '@/components/ui/slider';
import { Text } from '@/components/ui/text';

export default function Example() {
  const [volume, setVolume] = useState([40]);
  const [range, setRange] = useState([20, 70]);
  return (
    <View style={{ gap: 12 }}>
      <Slider value={volume} onValueChange={setVolume} />
      <Text variant="muted">Volume: {volume[0]}</Text>
      <Slider value={range} onValueChange={setRange} minStepsBetweenThumbs={5} />
      <Text variant="muted">{range[0]} to {range[1]}</Text>
    </View>
  );
}
