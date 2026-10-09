import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/lib/theme';
import { ButtonsBadges } from './screens/ButtonsBadges';
import { CardForm } from './screens/CardForm';
import { Controls } from './screens/Controls';
import { Display } from './screens/Display';

export default function App() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="h2">marcn</Text>
        <ButtonsBadges />
        <CardForm />
        <Display />
        <Controls />
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, paddingTop: 48, gap: 24 },
});
