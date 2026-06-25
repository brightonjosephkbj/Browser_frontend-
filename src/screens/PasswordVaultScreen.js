import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, Modal
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Clipboard from 'expo-clipboard';

const VAULT_KEY = 'b24_vault_v1';

export default function PasswordVaultScreen() {
  const [entries, setEntries] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ site: '', username: '', password: '' });
  const [showPasswords, setShowPasswords] = useState({});
  const [masterUnlocked, setMasterUnlocked] = useState(false);
  const [masterInput, setMasterInput] = useState('');

  useEffect(() => { loadVault(); }, []);

  const loadVault = async () => {
    try {
      const raw = await SecureStore.getItemAsync(VAULT_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  };

  const saveVault = async (data) => {
    await SecureStore.setItemAsync(VAULT_KEY, JSON.stringify(data));
    setEntries(data);
  };

  const addEntry = async () => {
    if (!form.site || !form.password) {
      Alert.alert('Required', 'Site and password are required.'); return;
    }
    const newEntry = { id: Date.now().toString(), ...form, date: Date.now() };
    const updated = [newEntry, ...entries];
    await saveVault(updated);
    setForm({ site: '', username: '', password: '' });
    setShowAdd(false);
  };

  const deleteEntry = (id) => {
    Alert.alert('Delete', 'Remove this password?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await saveVault(entries.filter(e => e.id !== id));
      }}
    ]);
  };

  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${label} copied to clipboard.`);
  };

  const filtered = entries.filter(e =>
    e.site.toLowerCase().includes(search.toLowerCase()) ||
    e.username.toLowerCase().includes(search.toLowerCase())
  );

  if (!masterUnlocked) {
    return (
      <View style={styles.lockScreen}>
        <Text style={styles.lockIcon}>🔐</Text>
        <Text style={styles.lockTitle}>Password Vault</Text>
        <Text style={styles.lockSub}>Enter master password to unlock</Text>
        <TextInput
          style={styles.masterInput}
          value={masterInput}
          onChangeText={setMasterInput}
          placeholder="Master password..."
          placeholderTextColor="#555"
          secureTextEntry
          autoFocus
        />
        <TouchableOpacity
          style={styles.unlockBtn}
          onPress={() => {
            if (masterInput.length >= 4) setMasterUnlocked(true);
            else Alert.alert('Too short', 'Master password must be at least 4 characters.');
          }}
        >
          <Text style={styles.unlockText}>Unlock</Text>
        </TouchableOpacity>
        <Text style={styles.lockNote}>Passwords are stored encrypted on this device only.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔐 Vault</Text>
        <Text style={styles.count}>{entries.length} saved</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>＋ Add</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Search passwords..."
        placeholderTextColor="#555577"
      />

      <FlatList
        data={filtered}
        keyExtractor={e => e.id}
        renderItem={({ item }) => (
          <View style={styles.entry}>
            <View style={styles.entryIcon}>
              <Text style={styles.entryIconText}>{item.site[0]?.toUpperCase()}</Text>
            </View>
            <View style={styles.entryInfo}>
              <Text style={styles.entrySite}>{item.site}</Text>
              <Text style={styles.entryUser}>{item.username}</Text>
              <View style={styles.entryPassRow}>
                <Text style={styles.entryPass}>
                  {showPasswords[item.id] ? item.password : '••••••••'}
                </Text>
                <TouchableOpacity onPress={() => setShowPasswords(p => ({ ...p, [item.id]: !p[item.id] }))}>
                  <Text style={styles.eyeBtn}>{showPasswords[item.id] ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.entryActions}>
              <TouchableOpacity onPress={() => copyToClipboard(item.password, 'Password')}>
                <Text style={styles.copyBtn}>📋</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteEntry(item.id)}>
                <Text style={styles.deleteBtn}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No passwords saved yet. Tap + Add to get started.</Text>
        }
      />

      {/* Add modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add Password</Text>
            {['site', 'username', 'password'].map(field => (
              <TextInput
                key={field}
                style={styles.formInput}
                value={form[field]}
                onChangeText={v => setForm(f => ({ ...f, [field]: v }))}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                placeholderTextColor="#555577"
                secureTextEntry={field === 'password'}
                autoCapitalize="none"
              />
            ))}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={addEntry}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050508' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 },
  count: { color: '#555577', fontSize: 12 },
  addBtn: { backgroundColor: '#6600ff', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  search: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    padding: 12,
    color: '#e0e0ff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  entryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#6600ff33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryIconText: { color: '#6600ff', fontWeight: 'bold', fontSize: 16 },
  entryInfo: { flex: 1 },
  entrySite: { color: '#fff', fontWeight: '600', fontSize: 14 },
  entryUser: { color: '#888', fontSize: 12, marginTop: 2 },
  entryPassRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  entryPass: { color: '#6600ff', fontFamily: 'monospace', fontSize: 13 },
  eyeBtn: { fontSize: 14 },
  entryActions: { gap: 8, alignItems: 'center' },
  copyBtn: { fontSize: 18 },
  deleteBtn: { fontSize: 18 },
  empty: { color: '#555577', textAlign: 'center', marginTop: 60, fontSize: 14 },

  lockScreen: { flex: 1, backgroundColor: '#050508', alignItems: 'center', justifyContent: 'center', padding: 32 },
  lockIcon: { fontSize: 60, marginBottom: 16 },
  lockTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  lockSub: { color: '#888', fontSize: 14, marginBottom: 32 },
  masterInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: 16,
    color: '#e0e0ff',
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(102,0,255,0.3)',
    marginBottom: 16,
  },
  unlockBtn: { backgroundColor: '#6600ff', borderRadius: 12, paddingHorizontal: 40, paddingVertical: 14, width: '100%', alignItems: 'center' },
  unlockText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  lockNote: { color: '#444', fontSize: 11, marginTop: 24, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#0d0d1a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  formInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: 14,
    color: '#e0e0ff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelText: { color: '#888', fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: '#6600ff', borderRadius: 10, padding: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },
});
