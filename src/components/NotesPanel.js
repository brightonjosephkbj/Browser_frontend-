import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Modal, StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import useStore from '../store/browserStore';

export default function NotesPanel() {
  const { showNotes, setUI, notes, addNote, deleteNote, getActiveTab } = useStore();
  const [input, setInput] = useState('');
  const activeTab = getActiveTab();

  const handleAdd = () => {
    if (!input.trim()) return;
    addNote({
      id: Date.now().toString(),
      text: input.trim(),
      source: activeTab?.url !== 'home' ? activeTab?.url : null,
      sourceTitle: activeTab?.title,
      date: Date.now(),
    });
    setInput('');
  };

  return (
    <Modal visible={showNotes} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>📝 Notes</Text>
            <Text style={styles.count}>{notes.length}</Text>
            <TouchableOpacity onPress={() => setUI('showNotes', false)}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={notes}
            keyExtractor={n => n.id}
            style={styles.list}
            renderItem={({ item }) => (
              <View style={styles.note}>
                <Text style={styles.noteText}>{item.text}</Text>
                {item.source && (
                  <Text style={styles.noteSource} numberOfLines={1}>
                    📎 {item.sourceTitle || item.source}
                  </Text>
                )}
                <View style={styles.noteMeta}>
                  <Text style={styles.noteDate}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                  <TouchableOpacity onPress={() => deleteNote(item.id)}>
                    <Text style={styles.noteDelete}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No notes yet. Type below to add one.</Text>
            }
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Write a note..."
              placeholderTextColor="#555577"
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Text style={styles.addBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  panel: {
    backgroundColor: '#0d0d1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: 'rgba(102,0,255,0.2)',
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1 },
  count: { color: '#6600ff', fontSize: 12, fontWeight: 'bold', backgroundColor: '#6600ff22', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  close: { color: '#666', fontSize: 18, padding: 4 },
  list: { maxHeight: 350 },
  note: { padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', marginHorizontal: 12, marginVertical: 4, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10 },
  noteText: { color: '#e0e0ff', fontSize: 14, lineHeight: 20 },
  noteSource: { color: '#6600ff', fontSize: 11, marginTop: 6 },
  noteMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  noteDate: { color: '#444', fontSize: 11 },
  noteDelete: { fontSize: 14 },
  empty: { color: '#555577', textAlign: 'center', padding: 32, fontSize: 14 },
  inputRow: { flexDirection: 'row', padding: 12, gap: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: 12, color: '#e0e0ff', fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  addBtn: { backgroundColor: '#6600ff', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
});
