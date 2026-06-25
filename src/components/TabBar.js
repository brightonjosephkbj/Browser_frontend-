import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Modal, FlatList, Animated
} from 'react-native';
import useStore from '../store/browserStore';

const WORKSPACE_COLORS = {
  personal: '#6600ff',
  work: '#0066ff',
  school: '#00aa44',
};

function TabPill({ tab, isActive, onPress, onClose }) {
  const color = WORKSPACE_COLORS[tab.workspace] || '#6600ff';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabPill, isActive && { borderColor: color, borderWidth: 1.5 }]}
    >
      <View style={[styles.tabDot, { backgroundColor: color }]} />
      <Text style={styles.tabTitle} numberOfLines={1}>
        {tab.isIncognito ? '🕵️ ' : ''}{tab.title}
      </Text>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Text style={styles.closeX}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, addTab, setUI } = useStore();
  return (
    <View style={styles.tabBarWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        {tabs.map(tab => (
          <TabPill
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onPress={() => setActiveTab(tab.id)}
            onClose={() => closeTab(tab.id)}
          />
        ))}
        <TouchableOpacity style={styles.newTabBtn} onPress={() => addTab()}>
          <Text style={styles.newTabText}>＋</Text>
        </TouchableOpacity>
      </ScrollView>
      <TouchableOpacity style={styles.tabCountBtn} onPress={() => setUI('showTabManager', true)}>
        <Text style={styles.tabCount}>{tabs.length}</Text>
      </TouchableOpacity>
    </View>
  );
}

export function TabManager() {
  const { tabs, activeTabId, setActiveTab, closeTab, addTab, addTab: addIncognito,
          showTabManager, setUI, workspace, setWorkspace } = useStore();

  return (
    <Modal visible={showTabManager} animationType="slide" transparent>
      <View style={styles.managerOverlay}>
        <View style={styles.managerSheet}>

          {/* Workspace selector */}
          <View style={styles.workspaceRow}>
            {['personal', 'work', 'school'].map(ws => (
              <TouchableOpacity
                key={ws}
                onPress={() => setWorkspace(ws)}
                style={[styles.wsBtn, workspace === ws && { backgroundColor: WORKSPACE_COLORS[ws] + '33', borderColor: WORKSPACE_COLORS[ws] }]}
              >
                <Text style={[styles.wsText, workspace === ws && { color: WORKSPACE_COLORS[ws] }]}>
                  {ws === 'personal' ? '👤' : ws === 'work' ? '💼' : '🎓'} {ws}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.managerTitle}>
            {tabs.length} Tab{tabs.length !== 1 ? 's' : ''}
          </Text>

          <FlatList
            data={tabs}
            keyExtractor={t => t.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.managerTab, item.id === activeTabId && styles.managerTabActive]}
                onPress={() => { setActiveTab(item.id); setUI('showTabManager', false); }}
              >
                <View style={[styles.tabDot, { backgroundColor: WORKSPACE_COLORS[item.workspace] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.managerTabTitle} numberOfLines={1}>
                    {item.isIncognito ? '🕵️ ' : ''}{item.title}
                  </Text>
                  <Text style={styles.managerTabUrl} numberOfLines={1}>
                    {item.url === 'home' ? 'New Tab' : item.url}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => closeTab(item.id)} style={styles.closeBtn}>
                  <Text style={styles.closeX}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />

          <View style={styles.managerActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { addTab(); setUI('showTabManager', false); }}>
              <Text style={styles.actionText}>＋ New Tab</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.incogBtn]}
              onPress={() => { addTab(true); setUI('showTabManager', false); }}>
              <Text style={styles.actionText}>🕵️ Incognito</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={() => setUI('showTabManager', false)}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  tabScroll: { flex: 1 },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 4,
    maxWidth: 150,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  tabTitle: { color: '#ccc', fontSize: 12, flex: 1 },
  closeBtn: { padding: 4 },
  closeX: { color: '#888', fontSize: 11 },
  newTabBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    margin: 4,
  },
  newTabText: { color: '#6600ff', fontSize: 20, fontWeight: 'bold' },
  tabCountBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.08)',
  },
  tabCount: { color: '#6600ff', fontWeight: 'bold', fontSize: 13 },

  // Manager
  managerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  managerSheet: {
    backgroundColor: '#0d0d1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  workspaceRow: { flexDirection: 'row', padding: 12, gap: 8 },
  wsBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  wsText: { color: '#888', fontSize: 12, textTransform: 'capitalize' },
  managerTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 8 },
  managerTab: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    gap: 10,
  },
  managerTabActive: { backgroundColor: 'rgba(102,0,255,0.15)', borderWidth: 1, borderColor: '#6600ff44' },
  managerTabTitle: { color: '#fff', fontSize: 13, fontWeight: '500' },
  managerTabUrl: { color: '#666', fontSize: 11, marginTop: 2 },
  managerActions: { flexDirection: 'row', gap: 10, padding: 12 },
  actionBtn: {
    flex: 1,
    backgroundColor: 'rgba(102,0,255,0.2)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6600ff44',
  },
  incogBtn: { backgroundColor: 'rgba(100,0,150,0.2)', borderColor: '#aa00ff44' },
  actionText: { color: '#ccc', fontWeight: '600' },
  doneBtn: {
    marginHorizontal: 12,
    backgroundColor: '#6600ff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  doneBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
