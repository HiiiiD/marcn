import { Pressable, StyleSheet, View } from 'react-native';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel } from '@/components/ui/carousel';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/lib/theme';
import { Section } from './Section';

function Slide({ label, height = 140 }: { label: string; height?: number }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.slide, { height, backgroundColor: colors.muted, borderColor: colors.border }]}>
      <Text variant="h3">{label}</Text>
    </View>
  );
}

function Dots() {
  const { colors } = useTheme();
  const { index, count, scrollTo } = useCarousel();
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }, (_, i) => (
        <Pressable
          key={i}
          accessibilityLabel={`Go to slide ${i + 1}`}
          hitSlop={8}
          onPress={() => scrollTo(i)}
          style={[styles.dot, { backgroundColor: i === index ? colors.primary : colors.border }]}
        />
      ))}
    </View>
  );
}

const slides = (n: number, prefix = '') => Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`);

export function Carousels() {
  return (
    <>
      <Section title="Carousel: snap, full width">
        <Carousel>
          <CarouselContent>
            {slides(5).map((s) => (
              <CarouselItem key={s}>
                <Slide label={s} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
          <Dots />
        </Carousel>
      </Section>
      <Section title="Carousel: peek (basis 0.8)">
        <Carousel>
          <CarouselContent>
            {slides(6).map((s) => (
              <CarouselItem key={s} basis={0.8}>
                <Slide label={s} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </Section>
      <Section title="Carousel: align center (basis 0.7)">
        <Carousel align="center">
          <CarouselContent>
            {slides(6).map((s) => (
              <CarouselItem key={s} basis={0.7}>
                <Slide label={s} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </Section>
      <Section title="Carousel: free scroll, mixed bases">
        <Carousel snap={false}>
          <CarouselContent>
            {[0.4, 0.6, 120, 0.4, 0.6, 120].map((basis, i) => (
              <CarouselItem key={i} basis={basis}>
                <Slide label={String(i + 1)} height={100} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </Section>
      <Section title="Carousel: vertical">
        <Carousel orientation="vertical">
          <CarouselContent style={styles.vertical}>
            {slides(4).map((s) => (
              <CarouselItem key={s}>
                <Slide label={s} height={220} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  slide: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 12 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  vertical: { height: 220 },
});
