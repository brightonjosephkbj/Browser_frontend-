import React from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import useStore from '../store/browserStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

const SettingRow = ({ icon, label, sub, value, onToggle, onPress, danger }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress && !onToggle}>
    <Text style={styles.rowIcon}>{icon}</Text>
    <View style={styles.rowText}>
      <Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>
      {sub && <Text style={styles.rowSub}>{sub}</Text>}
    </View>
    {onToggle !== undefined && (
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#333', true: '#6600ff' }}
        thumbColor={value ? '#fff' : '#888'}
      />
    )}
    {onPress && !onToggle && <Text style={styles.chevron}>›</Text>}
  </TouchableOpacity>
);

export default function SettingsScreen({ navigation }) {
  const { settings, updateSetting, history, bookmarks, downloads } = useStore();

  const clearHistory = () => {
    Alert.alert('Clear History', 'This will delete all browsing history.', [
      { text: 'Cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => useStore.setState({ history: [] }) }
    ]);
  };

  const clearAll = () => {
    Alert.alert('Clear All Data', 'This will delete history, bookmarks, downloads, and settings.', [
      { text: 'Cancel' },
      { text: 'Clear Everything', style: 'destructive', onPress: async () => {
        useStore.setState({ history: [], bookmarks: [], downloads: [] });
        await AsyncStorage.clear();
        Alert.alert('Done', 'All data cleared.');
      }}
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>Settings</Text>

      <Section title="Privacy & Security">
        <SettingRow icon="🛡️" label="Ad Blocker" sub="Block ads and trackers" value={settings.adBlockEnabled} onToggle={v => updateSetting('adBlockEnabled', v)} />
        <SettingRow icon="🌑" label="Dark Mode Injection" sub="Force dark mode on all sites" value={settings.darkModeInjector} onToggle={v => updateSetting('darkModeInjector', v)} />
        <SettingRow icon="📖" label="Reader Mode" sub="Strip clutter from articles" value={settings.readerMode} onToggle={v => updateSetting('readerMode', v)} />
      </Section>

      <Section title="Search Engine">
        {['google', 'duckduckgo', 'bing', 'brave'].map(engine => (
          <TouchableOpacity
            key={engine}
            style={styles.row}
            onPress={() => updateSetting('searchEngine', engine)}
          >
            <Text style={styles.rowIcon}>
              {engine === 'google' ? '🔍' : engine === 'duckduckgo' ? '🦆' : engine === 'bing' ? '🅱️' : '🦁'}
            </Text>
            <Text style={[styles.rowLabel, { flex: 1, textTransform: 'capitalize' }]}>{engine}</Text>
            {settings.searchEngine === engine && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </Section>

      <Section title="Appearance">
        <SettingRow icon="🎨" label="Background Wallpaper" sub={settings.wallpaper?.replace(/_/g, ' ')} onPress={() => navigation.navigate('Home')} />
        <SettingRow icon="🔤" label="Font Size" sub={settings.fontSize} onPress={() => {
          const sizes = ['small', 'medium', 'large'];
          const next = sizes[(sizes.indexOf(settings.fontSize) + 1) % sizes.length];
          updateSetting('fontSize', next);
        }} />
      </Section>

      <Section title="Data">
        <SettingRow icon="🕐" label="History" sub={`${history.length} entries`} onPress={clearHistory} />
        <SettingRow icon="★" label="Bookmarks" sub={`${bookmarks.length} saved`} />
        <SettingRow icon="⬇️" label="Downloads" sub={`${downloads.length} files`} />
        <SettingRow icon="🔐" label="Password Vault" onPress={() => navigation.navigate('PasswordVault')} />
      </Section>

      <Section title="About">
        <SettingRow icon="⬡" label="B24 Browser" sub="Version 1.0.0 — B24 Technologies" />
        <SettingRow icon="⌨️" label="Terminal" sub="Cloud shell via backend" onPress={() => navigation.navigate('Terminal')} />
      </Section>

      <Section title="Danger Zone">
        <SettingRow icon="🧹" label="Clear History" danger onPress={clearHistory} />
        <SettingRow icon="💣" label="Clear All Data" sub="Cannot be undone" danger onPress={clearAll} />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050508' },
  header: { color: '#fff', fontSize: 28, fontWeight: 'bold', padding: 20, paddingBottom: 8 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { color: '#555577', fontSize: 11, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  sectionCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', gap: 12 },
  rowIcon: { fontSize: 18, width: 28, textAlign: 'center' },
  rowText: { flex: 1 },
  rowLabel: { color: '#e0e0ff', fontSize: 14 },
  rowSub: { color: '#555577', fontSize: 12, marginTop: 2 },
  dangerText: { color: '#ff4444' },
  chevron: { color: '#444', fontSize: 18 },
  checkmark: { color: '#6600ff', fontSize: 16, fontWeight: 'bold' },
});
