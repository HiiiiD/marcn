import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { Toaster } from '@/components/ui/sonner';
import { PortalHost } from '@/lib/portal';
import { useTheme } from '@/lib/theme';
import { ButtonsBadges } from './screens/ButtonsBadges';
import { CardForm } from './screens/CardForm';
import { Calendars } from './screens/Calendars';
import { DatePickers } from './screens/DatePickers';
import { Comboboxes } from './screens/Comboboxes';
import { ContextMenus } from './screens/ContextMenus';
import { Controls } from './screens/Controls';
import { Display } from './screens/Display';
import { Fields } from './screens/Fields';
import { FormControls } from './screens/FormControls';
import { InputOtp } from './screens/InputOtp';
import { Menus } from './screens/Menus';
import { Overlays } from './screens/Overlays';
import { SpinnerEmptyItem } from './screens/SpinnerEmptyItem';
import { Toasts } from './screens/Toasts';

export default function App() {
  const { colors } = useTheme();
  return (
    <PortalHost>
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text variant="h2">marcn</Text>
          <ButtonsBadges />
          <CardForm />
          <Display />
          <SpinnerEmptyItem />
          <Controls />
          <Calendars />
          <DatePickers />
          <FormControls />
          <Fields />
          <Overlays />
          <Menus />
          <ContextMenus />
          <Comboboxes />
          <InputOtp />
          <Toasts />
        </ScrollView>
        <StatusBar style="auto" />
        <Toaster />
      </SafeAreaView>
    </PortalHost>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, paddingTop: 48, gap: 24 },
});
