import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const invoices = [
  { invoice: 'INV001', status: 'Paid', amount: '$250.00' },
  { invoice: 'INV002', status: 'Pending', amount: '$150.00' },
  { invoice: 'INV003', status: 'Unpaid', amount: '$350.00' },
];

const right = { alignItems: 'flex-end' } as const;

export default function Example() {
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead style={right}>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((row) => (
          <TableRow key={row.invoice}>
            <TableCell>{row.invoice}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell style={right}>{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell style={right}>$750.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
