import { StyleSheet, View } from 'react-native';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/lib/theme';
import { Section } from './Section';

const rows = Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`);
const tags = ['react', 'native', 'expo', 'reanimated', 'gesture', 'registry', 'shadcn', 'typescript', 'android', 'ios', 'web'];

export function ScrollAreas() {
  const { colors } = useTheme();
  const box = { borderColor: colors.border };
  return (
    <>
      <Section title="Scroll area (vertical)">
        <ScrollArea style={[styles.box, styles.tall, box]} nestedScrollEnabled>
          <View style={styles.list}>
            {rows.map((row, i) => (
              <View key={row}>
                <Text>{row}</Text>
                {i < rows.length - 1 ? <Separator style={styles.separator} /> : null}
              </View>
            ))}
          </View>
        </ScrollArea>
      </Section>
      <Section title="Scroll area (horizontal)">
        <ScrollArea horizontal style={[styles.box, box]}>
          <View style={styles.chips}>
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                <Text>{tag}</Text>
              </Badge>
            ))}
          </View>
        </ScrollArea>
      </Section>
      <Section title="Content fits (no thumb)">
        <ScrollArea style={[styles.box, styles.short, box]}>
          <View style={styles.list}>
            <Text>Only one row</Text>
          </View>
        </ScrollArea>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: 8 },
  tall: { height: 200 },
  short: { height: 80 },
  list: { padding: 12, gap: 8 },
  separator: { marginTop: 8 },
  chips: { flexDirection: 'row', gap: 8, padding: 12, paddingBottom: 18 },
});
