import { Link, createFileRoute } from '@tanstack/react-router';
import { Code, H1, H2, Lead, P } from '@/components/prose';
import { components, utilities } from '@/lib/registry';

export const Route = createFileRoute('/docs/')({ component: Intro });

function Intro() {
  return (
    <>
      <H1>Introduction</H1>
      <Lead>
        A shadcn-style component registry for React Native. {components.length} components and{' '}
        {utilities.length} utilities.
      </Lead>
      <P>
        marcn is not a component library. You install the source of each component into your
        project with the shadcn CLI, then own and edit it. Components use plain{' '}
        <Code>StyleSheet</Code> with a shared <Code>theme.ts</Code>, so there is no NativeWind,
        Tailwind, Unistyles or primitives package to buy into.
      </P>
      <H2>Principles</H2>
      <ul className="mt-4 list-disc space-y-2 pl-6 leading-7">
        <li>Open code: every component is a file in your repo.</li>
        <li>
          Same API as shadcn/ui on Base UI: <Code>render</Code> prop, familiar part names and
          props.
        </li>
        <li>Light and dark themes from one set of tokens.</li>
        <li>Built for Expo and React 19.</li>
      </ul>
      <H2>Next</H2>
      <P>
        Follow{' '}
        <Link to="/docs/installation" className="font-medium underline underline-offset-4">
          Installation
        </Link>{' '}
        to point the CLI at this registry, then browse the components in the sidebar.
      </P>
    </>
  );
}
