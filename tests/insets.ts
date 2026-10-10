import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function mockInsets(insets: Partial<Record<'top' | 'bottom' | 'left' | 'right', number>>) {
  (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0, ...insets });
}
