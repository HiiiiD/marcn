import { StyleSheet, Text as RNText, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Section } from './Section';

const outline = { variant: 'outline' as const };
const wait = (ms: number, fail = false) =>
  new Promise<string>((resolve, reject) => setTimeout(() => (fail ? reject(new Error('boom')) : resolve('done')), ms));

export function Toasts() {
  return (
    <Section title="Toasts">
      <View style={styles.row}>
        <Button {...outline} onPress={() => toast('Event created')}>Default</Button>
        <Button {...outline} onPress={() => toast.success('Saved', { description: 'Your changes are live.' })}>Success</Button>
        <Button {...outline} onPress={() => toast.error('Something broke')}>Error</Button>
        <Button {...outline} onPress={() => toast.info('Heads up')}>Info</Button>
        <Button {...outline} onPress={() => toast.warning('Low storage')}>Warning</Button>
        <Button {...outline} onPress={() => toast.loading('Working...', { id: 'work' })}>Loading</Button>
        <Button {...outline} onPress={() => toast.success('Done', { id: 'work' })}>Resolve loading</Button>
        <Button {...outline} onPress={() => toast('Deleted', { action: { label: 'Undo', onPress: () => toast('Restored') }, cancel: { label: 'Dismiss' } })}>
          Action
        </Button>
        <Button {...outline} onPress={() => toast.custom((id) => (
          <View style={styles.custom}>
            <RNText style={styles.customText} onPress={() => toast.dismiss(id)}>Custom toast. Tap to close.</RNText>
          </View>
        ))}>
          Custom
        </Button>
        <Button {...outline} onPress={() => toast.promise(wait(2000), { loading: 'Saving...', success: 'Saved', error: 'Failed' })}>
          Promise ok
        </Button>
        <Button {...outline} onPress={() => toast.promise(wait(2000, true), { loading: 'Saving...', success: 'Saved', error: (e) => `Failed: ${(e as Error).message}` })}>
          Promise fail
        </Button>
        <Button {...outline} onPress={() => { for (let i = 1; i <= 5; i++) toast(`Toast ${i}`, { duration: 20000 }); }}>Fire 5</Button>
        <Button {...outline} onPress={() => toast.dismiss()}>Dismiss all</Button>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  custom: { padding: 16, borderRadius: 12, backgroundColor: '#7c3aed' },
  customText: { color: '#fff' },
});
