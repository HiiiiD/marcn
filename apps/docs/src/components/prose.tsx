import type { ReactNode } from 'react';

type C = { children: ReactNode };

export const H1 = ({ children }: C) => (
  <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">{children}</h1>
);
export const Lead = ({ children }: C) => (
  <p className="mt-2 text-lg text-muted-foreground">{children}</p>
);
export const H2 = ({ children }: C) => (
  <h2 className="mt-10 scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight">
    {children}
  </h2>
);
export const P = ({ children }: C) => <p className="mt-4 leading-7">{children}</p>;
export const Code = ({ children }: C) => (
  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>
);
export const Stack = ({ children }: C) => <div className="mt-4 space-y-4">{children}</div>;
export const H3 = ({ children }: C) => (
  <h3 className="mt-6 scroll-m-20 text-base font-semibold tracking-tight">{children}</h3>
);
