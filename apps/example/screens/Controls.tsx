import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { Section } from './Section';

const plans = ['free', 'pro', 'team'];

export function Controls() {
  const [on, setOn] = useState(false);
  const [checked, setChecked] = useState(true);
  const [unchecked, setUnchecked] = useState(false);
  const [mixed, setMixed] = useState<boolean | 'indeterminate'>('indeterminate');
  const [plan, setPlan] = useState('free');
  const [progress, setProgress] = useState(30);

  return (
    <>
      <Section title="Switch">
        <View style={styles.row}>
          <Switch checked={on} onCheckedChange={setOn} />
          <Text>{on ? 'On' : 'Off'}</Text>
        </View>
      </Section>
      <Section title="Checkbox">
        <View style={styles.row}>
          <Checkbox checked={checked} onCheckedChange={setChecked} />
          <Label>Checked</Label>
        </View>
        <View style={styles.row}>
          <Checkbox checked={unchecked} onCheckedChange={setUnchecked} />
          <Label>Unchecked</Label>
        </View>
        <View style={styles.row}>
          <Checkbox checked={mixed} onCheckedChange={setMixed} />
          <Label>Indeterminate</Label>
        </View>
      </Section>
      <Section title="RadioGroup">
        <RadioGroup value={plan} onValueChange={setPlan}>
          {plans.map((p) => (
            <View key={p} style={styles.row}>
              <RadioGroupItem value={p} />
              <Label>{p}</Label>
            </View>
          ))}
        </RadioGroup>
        <Text variant="muted">Selected: {plan}</Text>
      </Section>
      <Section title="Progress">
        <Progress value={progress} />
        <Button onPress={() => setProgress((p) => (p >= 100 ? 0 : p + 10))}>
          <Text>Add 10 ({progress}%)</Text>
        </Button>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
