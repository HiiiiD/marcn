import { I18nManager, StyleSheet, View, type ViewProps } from 'react-native';
import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react-native';
import { useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';
import { Button, type ButtonProps } from '@/registry/marcn/ui/button';
import { Icon } from '@/registry/marcn/ui/icon';
import { Text } from '@/registry/marcn/ui/text';

export type PaginationLinkProps = Omit<ButtonProps, 'variant'> & { isActive?: boolean };
export type PaginationStepProps = Omit<PaginationLinkProps, 'children'> & { text?: string | null };

const createStyles = (t: Theme) =>
  StyleSheet.create({
    root: { width: '100%', alignItems: 'center' },
    content: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[1] },
    ellipsis: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  });

const flip = () => (I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined);

export function Pagination({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  return <View role="navigation" accessibilityLabel="pagination" style={[s.root, style]} {...props} />;
}

export function PaginationContent({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  return <View style={[s.content, style]} {...props} />;
}

export function PaginationItem(props: ViewProps) {
  return <View {...props} />;
}

export function PaginationLink({ isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? 'outline' : 'ghost'}
      size={size}
      accessibilityState={{ selected: !!isActive, disabled: !!props.disabled }}
      {...props}
    />
  );
}

export function PaginationPrevious({ text = 'Previous', ...props }: PaginationStepProps) {
  return (
    <PaginationLink accessibilityLabel="Go to previous page" size={text === null ? 'icon' : 'default'} {...props}>
      <Icon icon={ChevronLeft} size={16} style={flip()} />
      {text !== null && <Text>{text}</Text>}
    </PaginationLink>
  );
}

export function PaginationNext({ text = 'Next', ...props }: PaginationStepProps) {
  return (
    <PaginationLink accessibilityLabel="Go to next page" size={text === null ? 'icon' : 'default'} {...props}>
      {text !== null && <Text>{text}</Text>}
      <Icon icon={ChevronRight} size={16} style={flip()} />
    </PaginationLink>
  );
}

export function PaginationEllipsis({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  return (
    <View accessible accessibilityLabel="More pages" style={[s.ellipsis, style]} {...props}>
      <Icon icon={Ellipsis} size={16} color={colors.mutedForeground} />
    </View>
  );
}
