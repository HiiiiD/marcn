import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/code-block';
import { Code, H1, H2, Lead, P, Stack } from '@/components/prose';

export const Route = createFileRoute('/docs/theming')({ component: Theming });

const tokens = `export const lightColors: Colors = {
  background: '#ffffff',
  foreground: '#0a0a0a',
  primary: '#171717',
  primaryForeground: '#fafafa',
  muted: '#f5f5f5',
  mutedForeground: '#737373',
  destructive: '#e7000b',
  border: '#e5e5e5',
  // card, popover, secondary, accent, input, ring, chart1..chart5
};`;

const usage = `import { type Theme, useStyles } from '@/lib/theme';

const createStyles = (theme: Theme) =>
  StyleSheet.create({ box: { backgroundColor: theme.colors.card } });

function Box() {
  const styles = useStyles(createStyles);
  return <View style={styles.box} />;
}`;

function Theming() {
  return (
    <>
      <H1>Theming</H1>
      <Lead>One file controls every component.</Lead>
      <P>
        Colors, radii, spacing and font sizes live in <Code>lib/theme.ts</Code>, installed with your
        first component. The shadcn token names are kept (<Code>background</Code>,{' '}
        <Code>primary</Code>, <Code>muted</Code>, ...), with separate light and dark palettes picked
        from the system color scheme.
      </P>
      <H2>Tokens</H2>
      <Stack>
        <CodeBlock code={tokens} title="lib/theme.ts" />
      </Stack>
      <H2>In your own components</H2>
      <Stack>
        <CodeBlock code={usage} />
      </Stack>
    </>
  );
}
