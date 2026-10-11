<ContextMenu>
  <ContextMenuTrigger>
    <Text>Right-click or long-press here</Text>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuLabel>Actions</ContextMenuLabel>
    <ContextMenuItem onSelect={() => {}}>
      Back<ContextMenuShortcut>Alt+←</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
