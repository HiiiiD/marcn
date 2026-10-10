import { useEffect, useRef, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { CircleCheck, CircleX, Info, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';
import { dampenDrag, edgeSign, swipeOutcome, type StackItem, type ToastPosition } from '@/registry/marcn/lib/toast-stack';
import { dismissToast, removeToast, type ToastData, type ToastId, type ToastType } from '@/registry/marcn/lib/toast-store';
import { useToastTimer } from '@/registry/marcn/lib/use-toast-timer';
import { Button } from '@/registry/marcn/ui/button';
import { Icon } from '@/registry/marcn/ui/icon';
import { Text } from '@/registry/marcn/ui/text';

export const TOAST_EXIT_MS = 200;
const ENTER_OFFSET = 24;
const MOVE = { duration: 250 };

const ICONS: Partial<Record<ToastType, LucideIcon>> = {
  success: CircleCheck,
  error: CircleX,
  info: Info,
  warning: TriangleAlert,
};

const createStyles = (t: Theme) =>
  StyleSheet.create({
    root: { position: 'absolute', left: 0, right: 0 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing[3],
      borderRadius: t.radius.lg,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.popover,
      paddingHorizontal: t.spacing[4],
      paddingVertical: t.spacing[3],
    },
    content: { flex: 1, gap: 2 },
    title: { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium, color: t.colors.popoverForeground },
    description: { fontSize: t.fontSize.sm, color: t.colors.mutedForeground },
    buttons: { flexDirection: 'row', gap: t.spacing[2] },
  });

const asNode = (value: ReactNode, style: object) =>
  typeof value === 'string' || typeof value === 'number' ? <Text style={style}>{value}</Text> : value;

export type ToastViewProps = {
  toast: ToastData;
  layout: StackItem;
  position: ToastPosition;
  duration: number;
  paused: boolean;
  onMeasure: (id: ToastId, height: number) => void;
  onTouch: (id: ToastId, touching: boolean) => void;
  onTap: () => void;
};

export function ToastView({ toast, layout, position, duration, paused, onMeasure, onTouch, onTap }: ToastViewProps) {
  const { id, dismissed } = toast;
  const dir = edgeSign(position);
  // A dismissed toast exits from where it last sat; its fresh layout (computed without it) would be wrong.
  const frozen = useRef(layout);
  if (!dismissed) frozen.current = layout;

  const ty = useSharedValue(frozen.current.translateY - dir * ENTER_OFFSET);
  const scale = useSharedValue(frozen.current.scale);
  const opacity = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  useEffect(() => {
    const target = frozen.current;
    ty.value = withTiming(dismissed ? target.translateY - dir * ENTER_OFFSET : target.translateY, MOVE);
    scale.value = withTiming(target.scale, MOVE);
    opacity.value = withTiming(dismissed ? 0 : target.opacity, { duration: dismissed ? TOAST_EXIT_MS : MOVE.duration });
  }, [layout, dismissed, dir, ty, scale, opacity]);

  useEffect(() => {
    if (!dismissed) return;
    const timer = setTimeout(() => removeToast(id), TOAST_EXIT_MS);
    return () => clearTimeout(timer);
  }, [dismissed, id]);

  useToastTimer({
    duration: toast.type === 'loading' ? Infinity : (toast.duration ?? duration),
    paused: paused || dismissed,
    rev: toast.rev,
    onExpire: () => dismissToast(id, 'auto'),
  });

  // The finalize event is lost if the view unmounts mid-touch; a stuck touch would pause every timer.
  useEffect(() => () => onTouch(id, false), [id, onTouch]);

  const inert = dismissed || !layout.interactive;
  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(toast.dismissible !== false && !dismissed && layout.interactive)
    .activeOffsetX([-10, 10])
    .activeOffsetY([-10, 10])
    .onBegin(() => onTouch(id, true))
    .onUpdate((e) => {
      offsetX.value = e.translationX;
      offsetY.value = dampenDrag(e.translationY, position);
    })
    .onEnd((e) => {
      if (swipeOutcome({ ...e, position }) === 'dismiss') return dismissToast(id);
      offsetX.value = withSpring(0);
      offsetY.value = withSpring(0);
    })
    .onFinalize(() => onTouch(id, false));

  const animated = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: offsetX.value }, { translateY: ty.value + offsetY.value }, { scale: scale.value }],
  }));
  const s = useStyles(createStyles);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        testID={`toast-${id}`}
        accessibilityRole="alert"
        accessibilityLiveRegion={toast.type === 'error' ? 'assertive' : 'polite'}
        accessibilityElementsHidden={inert}
        importantForAccessibility={inert ? 'no-hide-descendants' : 'auto'}
        onLayout={(e: LayoutChangeEvent) => onMeasure(id, e.nativeEvent.layout.height)}
        style={[
          s.root,
          {
            [position]: 0,
            zIndex: layout.zIndex,
            pointerEvents: inert ? 'none' : 'auto',
            transformOrigin: position === 'top' ? '50% 0%' : '50% 100%',
          },
          animated,
        ]}
      >
        <Pressable accessible={false} onPress={onTap}>
          {toast.custom ? toast.custom(id) : <ToastBody toast={toast} />}
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

function ToastBody({ toast }: { toast: ToastData }) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const Glyph = ICONS[toast.type];
  const close = (after?: () => void) => () => {
    after?.();
    dismissToast(toast.id);
  };
  return (
    <View style={s.card}>
      {toast.type === 'loading' && <ActivityIndicator testID={`toast-${toast.id}-loading`} color={colors.mutedForeground} />}
      {Glyph && <Icon icon={Glyph} color={toast.type === 'error' ? colors.destructive : colors.popoverForeground} />}
      <View style={s.content}>
        {toast.title != null && asNode(toast.title, s.title)}
        {toast.description != null && asNode(toast.description, s.description)}
      </View>
      {(toast.action || toast.cancel) && (
        <View style={s.buttons}>
          {toast.cancel && (
            <Button size="sm" variant="secondary" onPress={close(toast.cancel.onPress)}>
              {toast.cancel.label}
            </Button>
          )}
          {toast.action && (
            <Button size="sm" onPress={close(toast.action.onPress)}>
              {toast.action.label}
            </Button>
          )}
        </View>
      )}
    </View>
  );
}
