<Sheet>
  <SheetTrigger render={<Button variant="outline" />}>Open</SheetTrigger>
  <SheetContent side="bottom" snapPoints={[0.4, 0.9]}>
    <SheetHeader>
      <SheetTitle>Edit profile</SheetTitle>
      <SheetDescription>Drag the handle to resize.</SheetDescription>
    </SheetHeader>
    <SheetFooter>
      <SheetClose render={<Button variant="outline" />}>Close</SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>
