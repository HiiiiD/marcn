import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { roles } from './signUpSchema';

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  'aria-invalid': boolean;
  accessibilityHint?: string;
};

export function RoleSelect({ value, onValueChange, 'aria-invalid': invalid, accessibilityHint }: Props) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger accessibilityLabel="Role" aria-invalid={invalid} accessibilityHint={accessibilityHint}>
        <SelectValue placeholder="Pick a role" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            {r.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
