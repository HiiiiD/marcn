<Combobox items={frameworks} value={value} onValueChange={setValue}>
  <ComboboxInput placeholder="Select framework..." showClear />
  <ComboboxContent>
    <ComboboxEmpty>No framework found.</ComboboxEmpty>
    <ComboboxList />
  </ComboboxContent>
</Combobox>
