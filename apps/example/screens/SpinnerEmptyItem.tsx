import { Inbox, Loader2, ShieldCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Icon } from '@/components/ui/icon';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { Text, TextStyleContext } from '@/components/ui/text';
import { Section } from './Section';

export function SpinnerEmptyItem() {
  return (
    <>
      <Section title="Spinner">
        <View style={styles.row}>
          <Spinner />
          <Spinner size={24} />
          <Spinner size={32} color="#e7000b" />
          <TextStyleContext.Provider value={{ color: '#2563eb' }}>
            <Spinner />
          </TextStyleContext.Provider>
          <Text variant="muted">Loading…</Text>
        </View>
      </Section>
      <Section title="Empty">
        <Empty style={styles.dashed}>
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
      </Section>
      <Section title="Item">
        <View style={styles.items}>
          <Item variant="outline">
            <ItemMedia variant="icon">
              <Icon icon={ShieldCheck} size={16} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Two-factor authentication</ItemTitle>
              <ItemDescription>Verify your identity with a code sent to your phone when signing in.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button size="sm" variant="outline">Enable</Button>
            </ItemActions>
          </Item>
          <Item variant="muted" size="sm" render={<Pressable onPress={() => {}} />}>
            <ItemMedia>
              <Icon icon={Loader2} size={16} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Pressable via render</ItemTitle>
            </ItemContent>
          </Item>
          <Item variant="outline">
            <ItemHeader>
              <Text variant="small">Header</Text>
              <Text variant="muted">12 Mar</Text>
            </ItemHeader>
            <ItemContent>
              <ItemTitle>Item with header and footer</ItemTitle>
            </ItemContent>
            <ItemFooter>
              <Text variant="muted">Footer</Text>
            </ItemFooter>
          </Item>
          <ItemGroup>
            <Item>
              <ItemContent>
                <ItemTitle>First</ItemTitle>
              </ItemContent>
            </Item>
            <ItemSeparator />
            <Item>
              <ItemContent>
                <ItemTitle>Second</ItemTitle>
              </ItemContent>
            </Item>
          </ItemGroup>
        </View>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dashed: { borderWidth: 1, flex: 0 },
  items: { gap: 12 },
});
