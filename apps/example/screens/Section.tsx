import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="h4">{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
});
