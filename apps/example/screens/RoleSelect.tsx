import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/lib/theme';
import { roles } from './signUpSchema';

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  invalid: boolean;
  error?: string;
};

export function RoleSelect({ value, onValueChange, invalid, error }: Props) {
  const { colors } = useTheme();
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger accessibilityLabel="Role" accessibilityHint={error} style={invalid && { borderColor: colors.destructive }}>
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
