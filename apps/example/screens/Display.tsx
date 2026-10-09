import { StyleSheet, View } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { Section } from './Section';

export function Display() {
  return (
    <>
      <Section title="Skeleton">
        <View style={styles.row}>
          <Skeleton style={styles.circle} />
          <View style={styles.lines}>
            <Skeleton style={styles.line} />
            <Skeleton style={[styles.line, styles.short]} />
          </View>
        </View>
      </Section>
      <Section title="Separator">
        <Text>Above</Text>
        <Separator />
        <View style={styles.vrow}>
          <Text>Left</Text>
          <Separator orientation="vertical" />
          <Text>Right</Text>
        </View>
      </Section>
      <Section title="Avatar">
        <View style={styles.row}>
          <Avatar>
            <AvatarImage source={{ uri: 'https://i.pravatar.cc/100?img=12' }} />
            <AvatarFallback>
              <Text>MS</Text>
            </AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>
              <Text>AB</Text>
            </AvatarFallback>
          </Avatar>
          <Avatar size={56}>
            <AvatarImage source={{ uri: 'https://invalid.example/missing.png' }} />
            <AvatarFallback>
              <Text>XX</Text>
            </AvatarFallback>
          </Avatar>
        </View>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vrow: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 20 },
  circle: { width: 48, height: 48, borderRadius: 24 },
  lines: { flex: 1, gap: 8 },
  line: { height: 16 },
  short: { width: '60%' },
});
