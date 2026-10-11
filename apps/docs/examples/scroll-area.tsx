import { View } from 'react-native';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/lib/theme';

const rows = Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`);

export default function Example() {
  const { colors } = useTheme();
  return (
    <ScrollArea style={{ height: 200, borderWidth: 1, borderRadius: 8, borderColor: colors.border }} nestedScrollEnabled>
      <View style={{ padding: 12, gap: 8 }}>
        {rows.map((row, i) => (
          <View key={row} style={{ gap: 8 }}>
            <Text>{row}</Text>
            {i < rows.length - 1 ? <Separator /> : null}
          </View>
        ))}
      </View>
    </ScrollArea>
  );
}
