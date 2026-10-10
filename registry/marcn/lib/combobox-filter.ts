export type ComboboxOption = { value: string; label: string; disabled?: boolean; keywords?: readonly string[] };
export type ComboboxItemInput = string | (Omit<ComboboxOption, 'label'> & { label?: string } & Record<string, unknown>);
export type ComboboxGroupInput = { value: string; items: readonly ComboboxItemInput[] };
export type ComboboxOptionGroup = { value: string; items: ComboboxOption[] };
export type ComboboxRow = ComboboxOption | ComboboxOptionGroup;
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

const isGroupInput = (item: ComboboxItemInput | ComboboxGroupInput): item is ComboboxGroupInput =>
  typeof item !== 'string' && Array.isArray((item as { items?: unknown }).items);

export const isGroup = (row: ComboboxRow): row is ComboboxOptionGroup => Array.isArray((row as { items?: unknown }).items);

export function flattenItems(items: readonly (ComboboxItemInput | ComboboxGroupInput)[]): ComboboxOption[] {
  return items.flatMap((item) => (isGroupInput(item) ? item.items.map(toOption) : [toOption(item)]));
}

export function toRows(
  items: readonly (ComboboxItemInput | ComboboxGroupInput)[],
  query: string,
  filter: ComboboxFilter | null = defaultFilter,
): ComboboxRow[] {
  return items.flatMap((item): ComboboxRow[] => {
    if (!isGroupInput(item)) return filterOptions([toOption(item)], query, filter);
    const kept = filterOptions(item.items.map(toOption), query, filter);
    return kept.length ? [{ value: item.value, items: kept }] : [];
  });
}
