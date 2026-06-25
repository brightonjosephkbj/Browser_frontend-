import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Modal, StyleSheet, Keyboard
} from 'react-native';
import useStore from '../store/browserStore';

const COMMANDS = [
  { id: 'new_tab', label: '＋ New Tab', icon: '🗂️', action: 'addTab' },
  { id: 'incognito', label: 'New Incognito Tab', icon: '🕵️', action: 'addIncognito' },
  { id: 'bookmarks', label: 'View Bookmarks', icon: '★', action: 'bookmarks' },
  { id: 'history', label: 'View History', icon: '🕐', action: 'history' },
  { id: 'downloads', label: 'Downloads', icon: '⬇️', action: 'downloads' },
  { id: 'notes', label: 'Open Notes', icon: '📝', action: 'notes' },
  { id: 'terminal', label: 'Open Terminal', icon: '⌨️', action: 'terminal' },
  { id: 'dark_mode', label: 'Toggle Dark Mode Injection', icon: '🌑', action: 'darkMode' },
  { id: 'reader', label: 'Toggle Reader Mode', icon: '📖', action: 'readerMode' },
  { id: 'resource', label: 'Resource Monitor', icon: '📊', action: 'resourceMonitor' },
  { id: 'qr', label: 'Scan QR Code', icon: '📷', action: 'qr' },
  { id: 'settings', label: 'Settings', icon: '⚙️', action: 'settings' },
  { id: 'clear_cache', label: 'Clear Cache & Data', icon: '🧹', action: 'clearCache' },
  { id: 'view_source', label: 'View Page Source', icon: '🔍', action: 'viewSource' },
  { id: 'screenshot', label: 'Screenshot Page', icon: '📸', action: 'screenshot' },
  { id: 'split_screen', label: 'Split Screen View', icon: '⊞', action: 'splitScreen' },
  { id: 'password', label: 'Password Vault', icon: '🔐', action: 'passwordVault' },
];

export default function CommandPalette({ navigation }) {
  const { showCommandPalette, setUI, addTab, navigate,
          updateSetting, settings, history, bookmarks } = useStore();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    const q = query.toLowerCase();
    return COMMANDS.filter(c => c.label.toLowerCase().includes(q));
  }, [query]);

  const historyResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    return history.filter(h => h.url?.toLowerCase().includes(q) || h.title?.toLowerCase().includes(q)).slice(0, 3);
  }, [query, history]);

  const handleCommand = (cmd) => {
    setUI('showCommandPalette', false);
    setQuery('');
    Keyboard.dismiss();
    switch (cmd.action) {
      case 'addTab': addTab(); break;
      case 'addIncognito': addTab(true); break;
      case 'notes': setUI('showNotes', true); break;
      case 'downloads': setUI('showDownloads', true); break;
      case 'resourceMonitor': setUI('showResourceMonitor', true); break;
      case 'darkMode': updateSetting('darkModeInjector', !settings.darkModeInjector); break;
      case 'readerMode': updateSetting('readerMode', !settings.readerMode); break;
      case 'terminal': navigation?.navigate('Terminal'); break;
      case 'settings': navigation?.navigate('Settings'); break;
      case 'passwordVault': navigation?.navigate('PasswordVault'); break;
      default: break;
    }
  };

  const handleHistoryNav = (url) => {
    navigate(url);
    setUI('showCommandPalette', false);
    setQuery('');
  };

  return (
    <Modal visible={showCommandPalette} transparent animationType="fade">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => { setUI('showCommandPalette', false); setQuery(''); }}
      >
        <View style={styles.palette} onStartShouldSetResponder={() => true}>
          <View style={styles.searchRow}>
            <Text style={styles.cmdIcon}>⌘</Text>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search commands, history, or URLs..."
              placeholderTextColor="#555577"
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <FlatList
            data={[
              ...historyResults.map(h => ({ ...h, isHistory: true, id: 'h_' + h.url })),
              ...filtered
            ]}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="always"
            renderItem={({ item }) => item.isHistory ? (
              <TouchableOpacity style={styles.historyItem} onPress={() => handleHistoryNav(item.url)}>
                <Text style={styles.historyIcon}>🕐</Text>
                <View>
                  <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.historyUrl} numberOfLines={1}>{item.url}</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.commandItem} onPress={() => handleCommand(item)}>
                <Text style={styles.commandIcon}>{item.icon}</Text>
                <Text style={styles.commandLabel}>{item.label}</Text>
                {item.action === 'darkMode' && settings.darkModeInjector && (
                  <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>ON</Text></View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 12,
  },
  palette: {
    backgroundColor: '#0d0d1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(102,0,255,0.3)',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  cmdIcon: { fontSize: 18, marginRight: 10, color: '#6600ff' },
  searchInput: { flex: 1, color: '#e0e0ff', fontSize: 15, paddingVertical: 12 },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  commandIcon: { fontSize: 16, marginRight: 14, width: 24, textAlign: 'center' },
  commandLabel: { color: '#ccc', fontSize: 14 },
  activeBadge: { marginLeft: 'auto', backgroundColor: '#6600ff', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  activeBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(102,0,255,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    gap: 12,
  },
  historyIcon: { fontSize: 16 },
  historyTitle: { color: '#aaa', fontSize: 13 },
  historyUrl: { color: '#555', fontSize: 11 },
});
