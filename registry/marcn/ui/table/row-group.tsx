import { Children, isValidElement, type ReactNode } from 'react';
import { LastRowContext, RowGroupContext, type RowGroup as Group } from '@/registry/marcn/ui/table/context';

export function RowGroup({ group, children }: { group: Group; children: ReactNode }) {
  const rows = Children.toArray(children);
  return (
    <RowGroupContext.Provider value={group}>
      {rows.map((row, i) => (
        <LastRowContext.Provider key={isValidElement(row) ? row.key : i} value={i === rows.length - 1}>
          {row}
        </LastRowContext.Provider>
      ))}
    </RowGroupContext.Provider>
  );
}
