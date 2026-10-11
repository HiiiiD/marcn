import { createContext } from 'react';

type AccordionContextValue = { isOpen: (value: string) => boolean; toggle: (value: string, open: boolean) => void; disabled: boolean };

export const AccordionContext = createContext<AccordionContextValue | null>(null);
