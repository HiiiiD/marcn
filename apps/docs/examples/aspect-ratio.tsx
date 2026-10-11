import { StyleSheet, View } from 'react-native';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Text } from '@/components/ui/text';

export default function Example() {
  return (
    <View style={{ gap: 12 }}>
      <AspectRatio ratio={16 / 9} style={styles.box}>
        <Text>16 / 9</Text>
      </AspectRatio>
      <AspectRatio ratio={1} style={[styles.box, { width: 120 }]}>
        <Text>1 / 1</Text>
      </AspectRatio>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: '#88888844', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
