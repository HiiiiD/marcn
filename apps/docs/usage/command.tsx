<Command>
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem onSelect={setLast}>Calendar</CommandItem>
      <CommandItem onSelect={setLast}>Search Emoji</CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Settings">
      <CommandItem onSelect={setLast}>
        Billing<CommandShortcut>Plan</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
