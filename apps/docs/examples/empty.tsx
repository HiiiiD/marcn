import { Inbox } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Icon } from '@/components/ui/icon';

export default function Example() {
  return (
    <Empty style={{ borderWidth: 1, flex: 0 }}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon icon={Inbox} size={24} />
        </EmptyMedia>
        <EmptyTitle>No messages</EmptyTitle>
        <EmptyDescription>Your inbox is empty. New messages will show up here.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Compose</Button>
      </EmptyContent>
    </Empty>
  );
}
