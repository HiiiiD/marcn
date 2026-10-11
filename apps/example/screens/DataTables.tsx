import { DataTable } from '@/components/ui/data-table';
import { Section } from './Section';
import { columns, payments } from './payments-columns';

export function DataTables() {
  return (
    <Section title="Data table">
      <DataTable columns={columns} data={payments} />
    </Section>
  );
}
