import { CodeBlock } from '@/components/code-block';
import { Code, H2, P, Stack } from '@/components/prose';
import type { Usage } from '@/lib/registry';

export function UsageSection({ usage }: { usage: Usage }) {
  return (
    <>
      <H2>Usage</H2>
      <Stack>
        <CodeBlock code={usage.import.code} html={usage.import.html} />
        <CodeBlock code={usage.jsx.code} html={usage.jsx.html} />
      </Stack>
      {usage.composition && (
        <>
          <H2>Composition</H2>
          <P>
            Use the following composition to build a <Code>{usage.root}</Code>:
          </P>
          <Stack>
            <CodeBlock code={usage.composition} />
          </Stack>
        </>
      )}
    </>
  );
}
