import { StyleSheet, View } from 'react-native';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Text } from '@/components/ui/text';
import { Section } from './Section';

const variants = ['h1', 'h2', 'h3', 'h4', 'lead', 'large', 'small', 'muted'] as const;

export function Typography() {
  return (
    <>
      <Section title="Typography">
        {variants.map((variant) => (
          <Text key={variant} variant={variant}>
            {variant}: The quick brown fox
          </Text>
        ))}
        <Text variant="p">
          Paragraph with inline <Text variant="code">code</Text> inside the sentence.
        </Text>
        <Text variant="blockquote">"After all," he said, "everyone enjoys a good joke."</Text>
        <View style={styles.list}>
          {['First item', 'Second item', 'Third item'].map((item) => (
            <Text key={item}>{`•  ${item}`}</Text>
          ))}
        </View>
      </Section>
      <Section title="Aspect Ratio">
        <AspectRatio ratio={16 / 9} style={styles.box}>
          <Text>16 / 9</Text>
        </AspectRatio>
        <AspectRatio ratio={1} style={[styles.box, styles.square]}>
          <Text>1 / 1</Text>
        </AspectRatio>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  list: { gap: 4, paddingLeft: 12 },
  box: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#8884', borderRadius: 8 },
  square: { width: 120 },
});
