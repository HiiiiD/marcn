import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet, SheetClose, SheetContent, SheetDescription, SheetFlatList, SheetHeader, SheetScrollView, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { Text } from '@/components/ui/text';

const outline = <Button variant="outline" />;
const rows = Array.from({ length: 40 }, (_, i) => `Row ${i + 1}`);

function Header({ title }: { title: string }) {
  return (
    <SheetHeader>
      <SheetTitle>{title}</SheetTitle>
      <SheetDescription>Scroll the content; drag the handle to resize.</SheetDescription>
    </SheetHeader>
  );
}

function Sized({ label, count, listStyle, flat }: { label: string; count: number; listStyle?: object; flat?: boolean }) {
  const data = rows.slice(0, count);
  return (
    <Sheet>
      <SheetTrigger render={outline}>{label}</SheetTrigger>
      <SheetContent dragBody={false}>
        <Header title={label} />
        {flat ? (
          <FlatList style={listStyle} data={data} keyExtractor={(r) => r} renderItem={({ item }) => <Text style={styles.row}>{item}</Text>} />
        ) : (
          <ScrollView style={listStyle}>
            {data.map((r) => (
              <Text key={r} style={styles.row}>{r}</Text>
            ))}
          </ScrollView>
        )}
        <SheetClose render={outline}>Close</SheetClose>
      </SheetContent>
    </Sheet>
  );
}

function LoadedRows() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => (c < 5 ? c + 1 : c)), 500);
    return () => clearInterval(id);
  }, []);
  return rows.slice(0, count).map((r) => (
    <Text key={r} style={styles.row}>{r}</Text>
  ));
}

function Loads({ label, snapPoints }: { label: string; snapPoints: (number | 'auto')[] }) {
  return (
    <Sheet>
      <SheetTrigger render={outline}>{label}</SheetTrigger>
      <SheetContent snapPoints={snapPoints}>
        <Header title={label} />
        <LoadedRows />
        <SheetClose render={outline}>Close</SheetClose>
      </SheetContent>
    </Sheet>
  );
}

export function SheetScroll() {
  return (
    <>
      <Sheet>
        <SheetTrigger render={outline}>Keyboard + SV</SheetTrigger>
        <SheetContent dragBody={false}>
          <Header title="Keyboard" />
          <Input placeholder="Type here" />
          <ScrollView style={styles.fill} keyboardShouldPersistTaps="handled">
            {rows.map((r) => (
              <Text key={r} style={styles.row}>{r}</Text>
            ))}
          </ScrollView>
          <Input placeholder="Bottom input" />
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger render={outline}>Drag anywhere</SheetTrigger>
        <SheetContent snapPoints={[0.4, 0.9]}>
          <Header title="Drag anywhere" />
          <Text>No list here: drag from the text, the gaps or the button.</Text>
          <SheetClose render={outline}>Close</SheetClose>
        </SheetContent>
      </Sheet>
      <Sized label="SV 3 rows" count={3} />
      <Sized label="SV 8 rows" count={8} />
      <Sized label="SV 8 rows shrink" count={8} listStyle={styles.fill} />
      <Sized label="SV 3 rows shrink" count={3} listStyle={styles.fill} />
      <Sized label="SV 40 fixed 200" count={40} listStyle={styles.fixed} />
      <Sized label="SV 40 no style" count={40} />
      <Sized label="FL 3 rows shrink" count={3} listStyle={styles.fill} flat />
      <Sized label="FL 40 no style" count={40} flat />
      <Sheet>
        <SheetTrigger render={outline}>Sheet + ScrollView</SheetTrigger>
        <SheetContent>
          <Header title="ScrollView" />
          <SheetScrollView style={styles.fill} testID="sheet-scroll">
            {rows.map((r) => (
              <Text key={r} style={styles.row}>{r}</Text>
            ))}
          </SheetScrollView>
          <SheetClose render={outline}>Close</SheetClose>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger render={outline}>Sheet + FlatList</SheetTrigger>
        <SheetContent>
          <Header title="FlatList" />
          <SheetFlatList
            style={styles.fill}
            data={rows}
            keyExtractor={(r) => r}
            renderItem={({ item }) => <Text style={styles.row}>{item}</Text>}
          />
          <SheetClose render={outline}>Close</SheetClose>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger render={outline}>Snap + ScrollView</SheetTrigger>
        <SheetContent snapPoints={[0.4, 0.9]}>
          <Header title="Snap + ScrollView" />
          <SheetScrollView style={styles.fill}>
            <View>
              {rows.map((r) => (
                <Text key={r} style={styles.row}>{r}</Text>
              ))}
            </View>
          </SheetScrollView>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger render={outline}>Auto + 90%</SheetTrigger>
        <SheetContent snapPoints={['auto', 0.9]}>
          <Header title="Auto + 90%" />
          <SheetFlatList
            style={styles.fill}
            data={rows.slice(0, 4)}
            keyExtractor={(r) => r}
            renderItem={({ item }) => <Text style={styles.row}>{item}</Text>}
          />
          <SheetClose render={outline}>Close</SheetClose>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger render={outline}>Auto only</SheetTrigger>
        <SheetContent snapPoints={['auto']}>
          <Header title="Auto only" />
          <SheetClose render={outline}>Close</SheetClose>
        </SheetContent>
      </Sheet>
      <Loads label="Auto loads" snapPoints={['auto']} />
      <Loads label="Auto + 90% loads" snapPoints={['auto', 0.9]} />
      <Sheet>
        <SheetTrigger render={outline}>Snap + FlatList</SheetTrigger>
        <SheetContent snapPoints={[0.4, 0.9]}>
          <Header title="Snap + FlatList" />
          <SheetFlatList
            style={styles.fill}
            data={rows}
            keyExtractor={(r) => r}
            renderItem={({ item }) => <Text style={styles.row}>{item}</Text>}
          />
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger render={outline}>Side + FlatList</SheetTrigger>
        <SheetContent side="right">
          <Header title="Side FlatList" />
          <SheetFlatList
            style={styles.fill}
            data={rows}
            keyExtractor={(r) => r}
            renderItem={({ item }) => <Text style={styles.row}>{item}</Text>}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  fill: { flexShrink: 1 },
  fixed: { height: 200, flexGrow: 0 },
  row: { paddingVertical: 12 },
});
