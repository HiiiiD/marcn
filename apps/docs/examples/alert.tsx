import { View } from 'react-native';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Example() {
  return (
    <View style={{ gap: 12 }}>
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Your session has expired. Please sign in again.</AlertDescription>
      </Alert>
    </View>
  );
}
