<form.Field name="email" validators={{ onChange: ({ value }) => (value ? undefined : 'Required') }}>
  {(field) => (
    <FormField field={field}>
      {(f) => (
        <>
          <FieldLabel>Email</FieldLabel>
          <Input placeholder="you@example.com" {...f.text} />
          <FieldError message={f.error} />
        </>
      )}
    </FormField>
  )}
</form.Field>
