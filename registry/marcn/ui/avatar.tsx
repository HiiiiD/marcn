import { createContext, useContext, useEffect, useState } from 'react';
import { Image, StyleSheet, View, type ImageProps, type ViewProps } from 'react-native';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { TextStyleContext } from '@/registry/marcn/ui/text';

type Status = 'loading' | 'loaded' | 'error';
const AvatarContext = createContext<{ status: Status; setStatus: (s: Status) => void } | null>(null);

const createStyles = (t: Theme) =>
  StyleSheet.create({
    root: { overflow: 'hidden' },
    image: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
    fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.muted },
    fallbackText: { color: t.colors.foreground, fontSize: t.fontSize.sm },
  });

export function Avatar({ size = 40, style, ...props }: ViewProps & { size?: number }) {
  const s = useStyles(createStyles);
  const [status, setStatus] = useState<Status>('loading');
  return (
    <AvatarContext.Provider value={{ status, setStatus }}>
      <View style={[s.root, { width: size, height: size, borderRadius: size / 2 }, style]} {...props} />
    </AvatarContext.Provider>
  );
}

export function AvatarImage({ source, style, onLoad, onError, ...props }: ImageProps) {
  const s = useStyles(createStyles);
  const ctx = useContext(AvatarContext);
  const uri = (source as { uri?: string } | undefined)?.uri ?? String(source);

  // A new source gets a fresh attempt even if the previous one failed.
  useEffect(() => {
    ctx?.setStatus('loading');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri]);

  if (ctx?.status === 'error') return null;
  return (
    <Image
      source={source}
      style={[s.image, style]}
      onLoad={(e) => {
        ctx?.setStatus('loaded');
        onLoad?.(e);
      }}
      onError={(e) => {
        ctx?.setStatus('error');
        onError?.(e);
      }}
      {...props}
    />
  );
}

export function AvatarFallback({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  const ctx = useContext(AvatarContext);
  if (ctx?.status === 'loaded') return null;
  return (
    <TextStyleContext.Provider value={s.fallbackText}>
      <View style={[s.fallback, style]} {...props} />
    </TextStyleContext.Provider>
  );
}
