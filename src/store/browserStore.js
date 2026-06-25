import { create } from 'zustand';

const useStore = create((set, get) => ({
  tabs: [
    { id: '1', url: 'home', title: 'New Tab', favicon: null, isIncognito: false, workspace: 'personal' }
  ],
  activeTabId: '1',
  workspace: 'personal',

  addTab: (isIncognito = false) => {
    const id = Date.now().toString();
    const workspace = get().workspace;
    set(s => ({
      tabs: [...s.tabs, { id, url: 'home', title: 'New Tab', favicon: null, isIncognito, workspace }],
      activeTabId: id
    }));
  },

  closeTab: (id) => {
    const tabs = get().tabs;
    if (tabs.length === 1) { get().addTab(); }
    const remaining = tabs.filter(t => t.id !== id);
    const activeTabId = get().activeTabId === id
      ? remaining[remaining.length - 1]?.id
      : get().activeTabId;
    set({ tabs: remaining, activeTabId });
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  updateTab: (id, data) => set(s => ({
    tabs: s.tabs.map(t => t.id === id ? { ...t, ...data } : t)
  })),

  setWorkspace: (workspace) => set({ workspace }),

  getActiveTab: () => {
    const { tabs, activeTabId } = get();
    return tabs.find(t => t.id === activeTabId);
  },

  navigate: (url) => {
    const id = get().activeTabId;
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://') && url !== 'home') {
      if (url.includes('.') && !url.includes(' ')) {
        finalUrl = 'https://' + url;
      } else {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }
    get().updateTab(id, { url: finalUrl });
  },

  bookmarks: [],
  addBookmark: (bookmark) => set(s => ({ bookmarks: [...s.bookmarks, bookmark] })),
  removeBookmark: (url) => set(s => ({ bookmarks: s.bookmarks.filter(b => b.url !== url) })),
  isBookmarked: (url) => get().bookmarks.some(b => b.url === url),

  history: [],
  addHistory: (entry) => set(s => ({ history: [entry, ...s.history].slice(0, 500) })),

  downloads: [],
  addDownload: (dl) => set(s => ({ downloads: [dl, ...s.downloads] })),
  updateDownload: (id, data) => set(s => ({
    downloads: s.downloads.map(d => d.id === id ? { ...d, ...data } : d)
  })),

  notes: [],
  addNote: (note) => set(s => ({ notes: [note, ...s.notes] })),
  deleteNote: (id) => set(s => ({ notes: s.notes.filter(n => n.id !== id) })),

  settings: {
    adBlockEnabled: true,
    darkModeInjector: false,
    readerMode: false,
    wallpaper: 'animated_aurora',
    searchEngine: 'google',
    fontSize: 'medium',
  },
  updateSetting: (key, value) => set(s => ({
    settings: { ...s.settings, [key]: value }
  })),

  showTabManager: false,
  showCommandPalette: false,
  showNotes: false,
  showDownloads: false,
  showResourceMonitor: false,
  setUI: (key, val) => set({ [key]: val }),
}));

export default useStore;
