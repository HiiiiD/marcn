import { createContext } from 'react';

export type RowGroup = 'header' | 'body' | 'footer';

export const RowGroupContext = createContext<RowGroup>('body');
export const LastRowContext = createContext(false);
