import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from '@/components/ui/sonner';

export default function Example() {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ gap: 8, alignItems: 'flex-start' }}>
        <Button variant="outline" onPress={() => toast('Event created')}>Default</Button>
        <Button variant="outline" onPress={() => toast.success('Saved', { description: 'Your changes are live.' })}>
          Success
        </Button>
        <Button variant="outline" onPress={() => toast.error('Something broke')}>Error</Button>
        <Button
          variant="outline"
          onPress={() => toast('Deleted', { action: { label: 'Undo', onPress: () => toast('Restored') } })}>
          With action
        </Button>
      </View>
      <Toaster />
    </View>
  );
}
