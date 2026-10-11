import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

export default function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project</CardTitle>
        <CardDescription>Deploy your new project in one tap.</CardDescription>
      </CardHeader>
      <CardContent>
        <Text>Your project is ready to ship.</Text>
      </CardContent>
      <CardFooter>
        <Button><Text>Deploy</Text></Button>
      </CardFooter>
    </Card>
  );
}
