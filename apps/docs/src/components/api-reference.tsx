import { Code, H2, H3 } from '@/components/prose';
import type { ApiPart } from '@/lib/registry';

function PartTable({ part }: { part: ApiPart }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Prop</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Default</th>
          </tr>
        </thead>
        <tbody>
          {part.props.map((p) => (
            <tr key={p.name} className="border-b align-top last:border-0">
              <td className="px-3 py-2">
                <Code>
                  {p.name}
                  {p.required ? '' : '?'}
                </Code>
                {p.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                )}
              </td>
              <td className="px-3 py-2 font-mono text-xs break-words">{p.type}</td>
              <td className="px-3 py-2 font-mono text-xs">{p.default ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ApiReference({ api }: { api: ApiPart[] }) {
  if (!api.length) return null;
  return (
    <>
      <H2>API Reference</H2>
      {api.map((part) => (
        <section key={part.part}>
          {api.length > 1 && <H3>{part.part}</H3>}
          {part.extends.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Extends{' '}
              {part.extends.map((e, i) => (
                <span key={e}>
                  {i > 0 && ', '}
                  <Code>{e}</Code>
                </span>
              ))}
              .
            </p>
          )}
          {part.props.length > 0 && <PartTable part={part} />}
        </section>
      ))}
    </>
  );
}
