import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Example() {
  return (
    <Select defaultValue="apple">
      <SelectTrigger style={{ minWidth: 180 }}>
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry" disabled>Cherry</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
