import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/code-block';
import { InstallTabs } from '@/components/install-tabs';
import { Code, H1, H2, Lead, P, Stack } from '@/components/prose';
import { REGISTRY_URL } from '@/lib/registry';

export const Route = createFileRoute('/docs/installation')({ component: Installation });

const componentsJson = `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": { "config": "", "css": "", "baseColor": "neutral", "cssVariables": false },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "utils": "@/lib/utils",
    "hooks": "@/hooks"
  },
  "registries": { "@marcn": "${REGISTRY_URL}" }
}`;

function Installation() {
  return (
    <>
      <H1>Installation</H1>
      <Lead>Add the registry to an Expo or React Native project.</Lead>
      <H2>1. Configure components.json</H2>
      <P>
        Create <Code>components.json</Code> in your project root. Tailwind fields stay empty; they
        are only there because the CLI requires them.
      </P>
      <Stack>
        <CodeBlock code={componentsJson} title="components.json" />
      </Stack>
      <H2>2. Add components</H2>
      <P>
        Each component brings its dependencies with it, including the shared <Code>theme.ts</Code>{' '}
        in your <Code>lib</Code> alias.
      </P>
      <Stack>
        <InstallTabs name="button" />
      </Stack>
      <H2>3. Use it</H2>
      <Stack>
        <CodeBlock
          code={`import { Button } from '@/components/ui/button';\n\nexport function Screen() {\n  return <Button onPress={() => {}}>Continue</Button>;\n}`}
        />
      </Stack>
      <P>
        Pin npm dependencies to the versions your Expo SDK expects. The registry pins Reanimated
        and Worklets for Expo SDK 57.
      </P>
    </>
  );
}
