<Button variant="outline" size="sm" onPress={() => {}}>
  Click me
</Button>

// Inline link inside text, e.g. with expo-router
<Text>
  Read the{' '}
  <Button render={<Link href="/terms" />} variant="link" size="inline">
    terms
  </Button>
  .
</Text>
