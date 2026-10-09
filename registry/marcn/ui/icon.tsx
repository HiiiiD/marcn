import type { LucideIcon, LucideProps } from 'lucide-react-native';
import { useTheme } from '@/registry/marcn/lib/theme';

export type IconProps = Omit<LucideProps, 'ref'> & { icon: LucideIcon };

export function Icon({ icon: Component, size = 16, color, ...props }: IconProps) {
  const { colors } = useTheme();
  return <Component size={size} color={color ?? colors.foreground} {...props} />;
}
