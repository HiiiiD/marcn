import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/code-block';
import { Code, H1, H2, Lead, P, Stack } from '@/components/prose';

export const Route = createFileRoute('/docs/render-prop')({ component: RenderProp });

const examples = `<Button render={(props) => <Link href="/settings" asChild><Pressable {...props} /></Link>}>
  Settings
</Button>

<Card render={<Animated.View entering={FadeIn} />} />

<Button render={(props, { pressed }) => <MyPressable {...props} />}>Go</Button>`;

function RenderProp() {
  return (
    <>
      <H1>The render prop</H1>
      <Lead>Swap the underlying element, keep marcn's behavior. Replaces asChild.</Lead>
      <P>
        Button, Text, Badge and Card (root) accept <Code>render</Code>, like Base UI: pass an
        element, or a function <Code>(props, state) =&gt; element</Code>.
      </P>
      <Stack>
        <CodeBlock code={examples} />
      </Stack>
      <H2>Merge rules</H2>
      <ul className="mt-4 list-disc space-y-2 pl-6 leading-7">
        <li>The element's own props win.</li>
        <li>
          <Code>style</Code> becomes <Code>[marcn, element]</Code>.
        </li>
        <li>
          <Code>onX</Code> handlers run element first, then marcn's, unless the event is
          default-prevented.
        </li>
        <li>Refs are merged. In function form, attach props.ref yourself.</li>
        <li>Children always come from the marcn component.</li>
      </ul>
      <P>
        With <Code>render</Code>, Button tracks <Code>pressed</Code> through{' '}
        <Code>onPressIn</Code> and <Code>onPressOut</Code>, so the rendered element must forward
        them to a pressable. Requires React 19.
      </P>
    </>
  );
}
