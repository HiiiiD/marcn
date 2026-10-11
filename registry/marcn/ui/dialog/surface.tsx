import { ScrollView, type ViewProps } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { asText, useOverlay } from '@/registry/marcn/ui/overlay/overlay-root';
import { renderElement } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { useKeyboardInset } from '@/registry/marcn/lib/use-keyboard-inset';
import { useProgress } from '@/registry/marcn/lib/use-presence';
import { DialogClose } from '@/registry/marcn/ui/dialog/dialog-root';
import { createStyles } from '@/registry/marcn/ui/dialog/styles';
import type { SurfaceProps } from '@/registry/marcn/ui/dialog/types';
import { Icon } from '@/registry/marcn/ui/icon';

export function DialogSurface({ showCloseButton = true, style, render, children, ...props }: SurfaceProps) {
  const s = useStyles(createStyles);
  const { open, titleId } = useOverlay();
  const progress = useProgress(open);
  const { inset } = useKeyboardInset();
  const insets = useSafeAreaInsets();
  const gap = s.center.padding as number;
  const lift = useAnimatedStyle(() => ({ paddingBottom: gap + Math.max(inset.value, insets.bottom) }));
  const enter = useAnimatedStyle(() => ({ opacity: progress.value, transform: [{ scale: 0.95 + 0.05 * progress.value }] }));

  return (
    <Animated.View style={[s.center, { paddingTop: gap + insets.top }, lift]}>
      {renderElement(Animated.View, render, {
        accessibilityLabelledBy: titleId,
        ...props,
        style: [s.surface, enter, style],
        children: (
          <>
            <ScrollView style={s.scroll} contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
              {asText(children)}
            </ScrollView>
            {showCloseButton && (
              <DialogClose accessibilityLabel="Close" hitSlop={8} style={s.close}>
                <Icon icon={X} />
              </DialogClose>
            )}
          </>
        ),
      } as ViewProps)}
    </Animated.View>
  );
}
