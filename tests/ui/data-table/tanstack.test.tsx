import { renderHook } from '@testing-library/react-native';
import { createColumnHelper, tableFeatures, useTable } from '@tanstack/react-table';

const features = tableFeatures({});
const helper = createColumnHelper<typeof features, { name: string }>();

test('TanStack Table v9 runs under Jest', () => {
  const columns = helper.columns([helper.accessor('name', { header: 'Name' })]);
  const { result } = renderHook(() => useTable({ features, data: [{ name: 'a' }, { name: 'b' }], columns }));
  expect(result.current.getRowModel().rows).toHaveLength(2);
});
