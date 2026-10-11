import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/code-block';
import { InstallTabs } from '@/components/install-tabs';
import { Code, H2, H3, P, Stack } from '@/components/prose';
import { items } from '@/lib/registry';
import type { Item, ItemFile } from '@/lib/registry';

const modes = ['Automatic', 'Manual'] as const;

function RegistryDeps({ list }: { list: string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {list.map((d) => {
        const name = d.replace('@marcn/', '');
        const target = items.find((i) => i.name === name);
        const cls = 'rounded-md border px-2 py-1 font-mono text-xs';
        return (
          <li key={d}>
            {target ? (
              <Link
                to="/docs/$kind/$name"
                params={{ kind: target.kind, name }}
                className={`${cls} hover:bg-muted`}
              >
                {d}
              </Link>
            ) : (
              <span className={cls}>{d}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Manual({ item, files }: { item: Item; files: ItemFile[] }) {
  let step = 0;
  return (
    <>
      {item.dependencies.length > 0 && (
        <>
          <H3>{++step}. Install the dependencies</H3>
          <Stack>
            <InstallTabs packages={item.dependencies} />
          </Stack>
        </>
      )}
      {item.registryDependencies.length > 0 && (
        <>
          <H3>{++step}. Add the registry dependencies</H3>
          <P>Copy the source of these items into your project first:</P>
          <RegistryDeps list={item.registryDependencies} />
        </>
      )}
      <H3>{++step}. Copy the source</H3>
      <P>
        Copy {files.length === 1 ? 'this file' : 'these files'} into your project, under your{' '}
        <Code>components</Code> and <Code>lib</Code> aliases, and adjust the import paths.
      </P>
      <Stack>
        {files.map((f) => (
          <CodeBlock key={f.path} code={f.code} html={f.html} title={f.path} />
        ))}
      </Stack>
    </>
  );
}

export function InstallSection({ item, files }: { item: Item; files: ItemFile[] }) {
  const [mode, setMode] = useState<(typeof modes)[number]>('Automatic');
  return (
    <>
      <H2>Installation</H2>
      <div className="mt-4 flex gap-1 border-b">
        {modes.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`-mb-px px-4 py-2 text-sm ${
              m === mode
                ? 'border-b-2 border-foreground font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      {mode === 'Automatic' ? (
        <>
          <Stack>
            <InstallTabs name={item.name} />
          </Stack>
          {item.registryDependencies.length > 0 && (
            <>
              <P>Also installs:</P>
              <RegistryDeps list={item.registryDependencies} />
            </>
          )}
        </>
      ) : (
        <Manual item={item} files={files} />
      )}
    </>
  );
}
