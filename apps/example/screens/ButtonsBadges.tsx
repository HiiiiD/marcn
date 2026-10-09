import { StyleSheet, View } from 'react-native';
import { Badge } from '@/components/ui/badge';
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Section } from './Section';

const variants: ButtonVariant[] = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'];
const sizes: ButtonSize[] = ['sm', 'default', 'lg', 'icon'];

export function ButtonsBadges() {
  return (
    <>
      <Section title="Button variants">
        <View style={styles.row}>
          {variants.map((v) => (
            <Button key={v} variant={v}>
              <Text>{v}</Text>
            </Button>
          ))}
          <Button disabled>
            <Text>disabled</Text>
          </Button>
        </View>
      </Section>
      <Section title="Button sizes">
        <View style={styles.row}>
          {sizes.map((s) => (
            <Button key={s} size={s}>
              <Text>{s === 'icon' ? '+' : s}</Text>
            </Button>
          ))}
        </View>
      </Section>
      <Section title="Badge">
        <View style={styles.row}>
          <Badge><Text>default</Text></Badge>
          <Badge variant="secondary"><Text>secondary</Text></Badge>
          <Badge variant="destructive"><Text>destructive</Text></Badge>
          <Badge variant="outline"><Text>outline</Text></Badge>
        </View>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
});
