import { StyleSheet, View } from 'react-native';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { Section } from './Section';

export function CardForm() {
  return (
    <>
      <Section title="Card">
        <Card>
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>Card description goes here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Text>Card content.</Text>
          </CardContent>
          <CardFooter>
            <Button>
              <Text>Action</Text>
            </Button>
          </CardFooter>
        </Card>
      </Section>
      <Section title="Input and Textarea">
        <View style={styles.field}>
          <Label>Email</Label>
          <Input placeholder="you@example.com" />
        </View>
        <View style={styles.field}>
          <Label>Message</Label>
          <Textarea placeholder="Type your message" />
        </View>
      </Section>
      <Section title="Alert">
        <Alert>
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>This is a default alert.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>This is a destructive alert.</AlertDescription>
        </Alert>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
});
