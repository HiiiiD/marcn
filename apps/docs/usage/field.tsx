<FieldGroup>
  <Field invalid={invalid}>
    <FieldLabel>Email</FieldLabel>
    <Input value={email} onChangeText={setEmail} aria-invalid={invalid} />
    <FieldDescription>We never share it.</FieldDescription>
    <FieldError message={invalid ? 'Enter a valid email address.' : undefined} />
  </Field>
  <FieldSet>
    <FieldLegend>Preferences</FieldLegend>
    <Field orientation="horizontal">
      <Switch checked={push} onCheckedChange={setPush} />
      <FieldLabel>Push notifications</FieldLabel>
    </Field>
  </FieldSet>
</FieldGroup>
