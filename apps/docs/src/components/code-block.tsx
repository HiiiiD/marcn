import { CopyButton } from './copy-button';

export function CodeBlock({ code, html, title }: { code: string; html?: string; title?: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-muted/40">
      {title && (
        <div className="border-b px-4 py-2 font-mono text-xs text-muted-foreground">{title}</div>
      )}
      <CopyButton text={code} className="absolute right-2 top-1.5 z-10" />
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">{code}</pre>
      )}
    </div>
  );
}
