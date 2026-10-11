import { StyleSheet, View } from 'react-native';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/lib/theme';

export default function Example() {
  const { colors } = useTheme();

  return (
    <Carousel>
      <CarouselContent>
        {[1, 2, 3, 4, 5].map((n) => (
          <CarouselItem key={n}>
            <View style={[styles.slide, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Text variant="h3">{n}</Text>
            </View>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

const styles = StyleSheet.create({
  slide: { height: 140, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 12 },
});
