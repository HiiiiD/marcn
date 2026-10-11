import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ItemData } from '@/lib/registry';
import { CodeBlock } from './code-block';
import { H2, Stack } from './prose';

const isDark = () => document.documentElement.classList.contains('dark');

function useDark() {
  const [dark, setDark] = useState(isDark);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export function SnackPreview({
  id,
  example,
}: {
  id: string;
  example: NonNullable<ItemData['example']>;
}) {
  const dark = useDark();
  const mode = dark ? 'dark' : 'light';
  const src = `https://snack.expo.dev/embedded/${id}?platform=web&preview=true&theme=${mode}&deviceAppearance=${mode}`;
  return (
    <>
      <H2>Preview</H2>
      <Stack>
        <div className="overflow-hidden rounded-lg border">
          <iframe
            key={mode}
            src={src}
            title="Expo Snack preview"
            loading="lazy"
            className="block h-[480px] w-full"
          />
        </div>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          Runs on Expo Snack. Choose "My Device" in the preview to scan a QR code and open it in
          Expo Go.
          <a
            href={`https://snack.expo.dev/${id}`}
            className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4"
          >
            Open in Snack <ExternalLink className="size-3" />
          </a>
        </p>
        <CodeBlock code={example.code} html={example.html} title="Example.tsx" />
      </Stack>
    </>
  );
}
