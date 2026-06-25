import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Dimensions
} from 'react-native';
import AnimatedBackground, { WALLPAPERS } from '../components/AnimatedBackground';
import useStore from '../store/browserStore';
import axios from 'axios';

const { width } = Dimensions.get('window');

const QUICK_LINKS = [
  { title: 'Google', url: 'https://google.com', icon: '🔍' },
  { title: 'YouTube', url: 'https://youtube.com', icon: '▶️' },
  { title: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { title: 'Reddit', url: 'https://reddit.com', icon: '🟠' },
  { title: 'X', url: 'https://x.com', icon: '✕' },
  { title: 'Wikipedia', url: 'https://wikipedia.org', icon: '📖' },
  { title: 'HuggingFace', url: 'https://huggingface.co', icon: '🤗' },
  { title: 'B24', url: 'https://b24tech.dev', icon: '⬡' },
];

export default function NewTabScreen() {
  const { navigate, bookmarks, history, settings } = useStore();
  const [search, setSearch] = useState('');
  const [weather, setWeather] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchWeather();
    return () => clearInterval(timer);
  }, []);

  const fetchWeather = async () => {
    try {
      // Open-Meteo (free, no key) — Kampala coordinates
      const res = await axios.get(
        'https://api.open-meteo.com/v1/forecast?latitude=0.3476&longitude=32.5825&current_weather=true&hourly=relativehumidity_2m'
      );
      const w = res.data.current_weather;
      setWeather({
        temp: Math.round(w.temperature),
        wind: Math.round(w.windspeed),
        code: w.weathercode,
      });
    } catch { /* silent */ }
  };

  const weatherIcon = (code) => {
    if (!code && code !== 0) return '🌡️';
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌦️';
    return '⛈️';
  };

  const handleSearch = () => {
    if (search.trim()) {
      navigate(search.trim());
      setSearch('');
    }
  };

  const hours = time.getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AnimatedBackground wallpaper={settings.wallpaper}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Clock & Greeting */}
        <View style={styles.hero}>
          <Text style={styles.clock}>
            {time.getHours().toString().padStart(2,'0')}:{time.getMinutes().toString().padStart(2,'0')}
          </Text>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.brand}>B24</Text>
        </View>

        {/* Weather */}
        {weather && (
          <View style={styles.weatherCard}>
            <Text style={styles.weatherIcon}>{weatherIcon(weather.code)}</Text>
            <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
            <Text style={styles.weatherSub}>Kampala · Wind {weather.wind} km/h</Text>
          </View>
        )}

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            placeholder="Search the web or enter URL..."
            placeholderTextColor="#555577"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Quick links */}
        <Text style={styles.sectionLabel}>Quick Access</Text>
        <View style={styles.quickGrid}>
          {QUICK_LINKS.map((link, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickItem}
              onPress={() => navigate(link.url)}
            >
              <Text style={styles.quickIcon}>{link.icon}</Text>
              <Text style={styles.quickTitle}>{link.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent bookmarks */}
        {bookmarks.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Bookmarks</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {bookmarks.slice(0, 8).map((b, i) => (
                <TouchableOpacity key={i} style={styles.bookmarkChip} onPress={() => navigate(b.url)}>
                  <Text style={styles.bookmarkStar}>★</Text>
                  <Text style={styles.bookmarkTitle} numberOfLines={1}>{b.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Recent history */}
        {history.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Recent</Text>
            {history.slice(0, 5).map((h, i) => (
              <TouchableOpacity key={i} style={styles.historyRow} onPress={() => navigate(h.url)}>
                <Text style={styles.historyIcon}>🕐</Text>
                <Text style={styles.historyText} numberOfLines={1}>{h.title || h.url}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Wallpaper selector */}
        <Text style={styles.sectionLabel}>Background</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wallpaperRow}>
          {Object.keys(WALLPAPERS).map(key => (
            <TouchableOpacity
              key={key}
              style={[styles.wallpaperChip, settings.wallpaper === key && styles.wallpaperActive]}
              onPress={() => useStore.getState().updateSetting('wallpaper', key)}
            >
              <Text style={styles.wallpaperLabel}>{key.replace(/_/g, ' ')}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

      </ScrollView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  hero: { alignItems: 'center', paddingTop: 40, marginBottom: 20 },
  clock: { fontSize: 72, fontWeight: '100', color: '#ffffff', letterSpacing: -2 },
  greeting: { fontSize: 16, color: '#8888bb', marginTop: 4 },
  brand: { fontSize: 13, color: '#6600ff', fontWeight: 'bold', letterSpacing: 4, marginTop: 8 },

  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  weatherIcon: { fontSize: 28 },
  weatherTemp: { fontSize: 24, color: '#fff', fontWeight: '300' },
  weatherSub: { color: '#888', fontSize: 12, flex: 1 },

  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(102,0,255,0.3)',
    marginBottom: 28,
    overflow: 'hidden',
  },
  searchInput: { flex: 1, color: '#e0e0ff', fontSize: 15, paddingHorizontal: 16, paddingVertical: 14 },
  searchBtn: { backgroundColor: '#6600ff', paddingHorizontal: 20, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontSize: 20 },

  sectionLabel: { color: '#555577', fontSize: 11, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  quickItem: {
    width: (width - 40 - 30) / 4,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  quickIcon: { fontSize: 22, marginBottom: 4 },
  quickTitle: { color: '#aaa', fontSize: 11, textAlign: 'center' },

  bookmarkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  bookmarkStar: { color: '#6600ff', fontSize: 12 },
  bookmarkTitle: { color: '#ccc', fontSize: 12, maxWidth: 100 },

  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  historyIcon: { fontSize: 14 },
  historyText: { color: '#888', fontSize: 13, flex: 1 },

  wallpaperRow: { marginBottom: 20 },
  wallpaperChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  wallpaperActive: {
    backgroundColor: 'rgba(102,0,255,0.25)',
    borderColor: '#6600ff',
  },
  wallpaperLabel: { color: '#ccc', fontSize: 12, textTransform: 'capitalize' },
});
