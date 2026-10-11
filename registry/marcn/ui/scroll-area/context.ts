import { createContext } from 'react';
import type { SharedValue } from 'react-native-reanimated';

export type Metrics = { viewport: number; content: number; offset: number };
type AreaContextValue = { horizontal: boolean; metrics: Metrics; opacity: SharedValue<number> };

export const AreaContext = createContext<AreaContextValue | null>(null);
