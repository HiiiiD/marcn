import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      aria-label="Copy"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className={`inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground ${className}`}
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}
