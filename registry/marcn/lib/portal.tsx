import { createContext, useContext, useEffect, useId, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type Entry = { id: string; node: ReactNode; modal: boolean };
type PortalContextValue = {
  mount: (id: string, node: ReactNode, modal: boolean) => void;
  unmount: (id: string) => void;
};

const PortalContext = createContext<PortalContextValue | null>(null);

const HIDDEN = { importantForAccessibility: 'no-hide-descendants', accessibilityElementsHidden: true } as const;

const styles = StyleSheet.create({
  fill: { flex: 1 },
  layer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, pointerEvents: 'box-none' },
});

export function PortalHost({ children, ...props }: ViewProps) {
  const [entries, setEntries] = useState<Entry[]>([]);

  const value = useMemo<PortalContextValue>(
    () => ({
      mount: (id, node, modal) =>
        setEntries((prev) => {
          const index = prev.findIndex((e) => e.id === id);
          if (index === -1) return [...prev, { id, node, modal }];
          const next = prev.slice();
          next[index] = { id, node, modal };
          return next;
        }),
      unmount: (id) => setEntries((prev) => prev.filter((e) => e.id !== id)),
    }),
    [],
  );

  let topModal = -1;
  entries.forEach((e, i) => {
    if (e.modal) topModal = i;
  });

  return (
    <PortalContext.Provider value={value}>
      <GestureHandlerRootView style={styles.fill}>
        <View style={styles.fill} {...props} {...(topModal >= 0 ? HIDDEN : undefined)}>
          {children}
        </View>
        <View style={styles.layer}>
          {entries.map((e, i) => (
            <View key={e.id} style={styles.layer} accessibilityViewIsModal={topModal >= 0 && i === entries.length - 1} {...(i < topModal ? HIDDEN : undefined)}>
              {e.node}
            </View>
          ))}
        </View>
      </GestureHandlerRootView>
    </PortalContext.Provider>
  );
}

let warned = false;

export type PortalProps = { children: ReactNode; modal?: boolean };

// Children render under the host, not under their React parent: callers must re-provide any context inside <Portal>.
export function Portal({ children, modal = true }: PortalProps) {
  const host = useContext(PortalContext);
  const id = useId();

  useLayoutEffect(() => {
    host?.mount(id, children, modal);
  }, [host, id, children, modal]);
  useLayoutEffect(() => () => host?.unmount(id), [host, id]);
  useEffect(() => {
    if (host || warned || !__DEV__) return;
    warned = true;
    console.warn('marcn: <Portal> used without a <PortalHost>. Mount <PortalHost> once at your app root.');
  }, [host]);

  return null;
}
