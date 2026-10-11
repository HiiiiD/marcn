<FormField control={form.control} name="email" rules={{ required: 'Email is required' }}>
  {(f) => (
    <>
      <FieldLabel>Email</FieldLabel>
      <Input placeholder="you@example.com" {...f.text} />
      <FieldError message={f.error} />
    </>
  )}
</FormField>
