import { Link, createFileRoute, notFound } from '@tanstack/react-router';
import { CodeBlock } from '@/components/code-block';
import { InstallTabs } from '@/components/install-tabs';
import { Code, H1, H2, Lead, Stack } from '@/components/prose';
import { items, loadFiles } from '@/lib/registry';

export const Route = createFileRoute('/docs/$kind/$name')({
  loader: async ({ params }) => {
    const item = items.find((i) => i.name === params.name && i.kind === params.kind);
    if (!item) throw notFound();
    return { item, files: await loadFiles(item.name) };
  },
  component: ItemPage,
});

function Deps({ title, list, link }: { title: string; list: string[]; link?: boolean }) {
  if (!list.length) return null;
  return (
    <>
      <H2>{title}</H2>
      <div className="mt-4 flex flex-wrap gap-2">
        {list.map((d) => {
          const name = d.replace('@marcn/', '');
          const target = link && items.find((i) => i.name === name);
          return target ? (
            <Link
              key={d}
              to="/docs/$kind/$name"
              params={{ kind: target.kind, name }}
              className="rounded-md border px-2 py-1 font-mono text-xs hover:bg-muted"
            >
              {d}
            </Link>
          ) : (
            <span key={d} className="rounded-md border px-2 py-1 font-mono text-xs">
              {d}
            </span>
          );
        })}
      </div>
    </>
  );
}

function ItemPage() {
  const { item, files } = Route.useLoaderData();
  return (
    <>
      <H1>{item.title}</H1>
      <Lead>{item.description}</Lead>
      <H2>Installation</H2>
      <Stack>
        <InstallTabs name={item.name} />
      </Stack>
      <Deps title="Registry dependencies" list={item.registryDependencies} link />
      <Deps title="npm dependencies" list={item.dependencies} />
      <H2>Source</H2>
      <p className="mt-4 text-sm text-muted-foreground">
        {files.length} file{files.length === 1 ? '' : 's'}, installed under your{' '}
        <Code>components</Code> and <Code>lib</Code> aliases.
      </p>
      <Stack>
        {files.map((f) => (
          <CodeBlock key={f.path} code={f.code} html={f.html} title={f.path} />
        ))}
      </Stack>
    </>
  );
}
