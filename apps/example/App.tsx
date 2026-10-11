import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { Toaster } from '@/components/ui/sonner';
import { PortalHost } from '@/components/ui/portal';
import { useTheme } from '@/lib/theme';
import { BreadcrumbPagination } from './screens/BreadcrumbPagination';
import { ButtonsBadges } from './screens/ButtonsBadges';
import { CardForm } from './screens/CardForm';
import { Calendars } from './screens/Calendars';
import { DatePickers } from './screens/DatePickers';
import { Comboboxes } from './screens/Comboboxes';
import { Commands } from './screens/Commands';
import { ContextMenus } from './screens/ContextMenus';
import { Controls } from './screens/Controls';
import { DataTables } from './screens/DataTables';
import { Display } from './screens/Display';
import { Fields } from './screens/Fields';
import { Forms } from './screens/Forms';
import { FormControls } from './screens/FormControls';
import { Groups } from './screens/Groups';
import { Carousels } from './screens/Carousels';
import { Charts } from './screens/Charts';
import { InputOtp } from './screens/InputOtp';
import { Menus } from './screens/Menus';
import { Overlays } from './screens/Overlays';
import { ScrollAreas } from './screens/ScrollAreas';
import { SpinnerEmptyItem } from './screens/SpinnerEmptyItem';
import { Tables } from './screens/Tables';
import { Toasts } from './screens/Toasts';
import { Typography } from './screens/Typography';

export default function App() {
  const { colors } = useTheme();
  return (
    <PortalHost>
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text variant="h2">marcn</Text>
          <ButtonsBadges />
          <CardForm />
          <Display />
          <Typography />
          <SpinnerEmptyItem />
          <Controls />
          <Calendars />
          <DatePickers />
          <FormControls />
          <Fields />
          <Forms />
          <Overlays />
          <Menus />
          <ContextMenus />
          <Comboboxes />
          <Commands />
          <InputOtp />
          <Carousels />
          <Charts />
          <BreadcrumbPagination />
          <Groups />
          <ScrollAreas />
          <Tables />
          <DataTables />
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
