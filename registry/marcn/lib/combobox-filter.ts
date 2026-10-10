export type ComboboxOption = { value: string; label: string; disabled?: boolean; keywords?: readonly string[] };
export type ComboboxItemInput = string | (Omit<ComboboxOption, 'label'> & { label?: string });
export type ComboboxFilter = (option: ComboboxOption, query: string) => boolean;

export function toOption(item: ComboboxItemInput): ComboboxOption {
  return typeof item === 'string' ? { value: item, label: item } : { ...item, label: item.label ?? item.value };
}

const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const defaultFilter: ComboboxFilter = (option, query) => {
  const q = fold(query.trim());
  return !q || [option.label, ...(option.keywords ?? [])].some((text) => fold(text).includes(q));
};

export function filterOptions(options: readonly ComboboxOption[], query: string, filter: ComboboxFilter | null = defaultFilter) {
  return filter ? options.filter((option) => filter(option, query)) : [...options];
}
