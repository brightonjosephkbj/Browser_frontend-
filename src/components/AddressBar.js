import React, { useState, useRef } from 'react';
import {
  View, TextInput, TouchableOpacity, Text, StyleSheet,
  Animated, Keyboard
} from 'react-native';
import useStore from '../store/browserStore';

const SEARCH_ENGINES = {
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  brave: 'https://search.brave.com/search?q=',
};

export default function AddressBar() {
  const { getActiveTab, navigate, addBookmark, removeBookmark, isBookmarked,
          setUI, showCommandPalette, settings } = useStore();
  const activeTab = getActiveTab();
  const url = activeTab?.url || '';
  const isHome = url === 'home';
  const isSecure = url.startsWith('https://');
  const isIncognito = activeTab?.isIncognito;

  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const displayUrl = isHome ? '' : url.replace(/^https?:\/\//, '');
  const bookmarked = isBookmarked(url);

  const handleFocus = () => {
    setEditing(true);
    setInputVal(isHome ? '' : url);
    Animated.spring(scaleAnim, { toValue: 1.02, useNativeDriver: true }).start();
  };

  const handleBlur = () => {
    setEditing(false);
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleSubmit = () => {
    if (inputVal.trim()) navigate(inputVal.trim());
    Keyboard.dismiss();
    setEditing(false);
  };

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(url);
    } else {
      addBookmark({ url, title: activeTab?.title || url, date: Date.now() });
    }
  };

  return (
    <View style={[styles.wrapper, isIncognito && styles.incognitoWrapper]}>
      {/* Security / Incognito icon */}
      <TouchableOpacity style={styles.iconBtn}>
        <Text style={styles.secIcon}>
          {isIncognito ? '🕵️' : isSecure ? '🔒' : isHome ? '🏠' : '⚠️'}
        </Text>
      </TouchableOpacity>

      {/* Address input */}
      <Animated.View style={[styles.inputContainer, { transform: [{ scale: scaleAnim }] }]}>
        <TextInput
          style={[styles.input, isIncognito && styles.incognitoInput]}
          value={editing ? inputVal : displayUrl}
          onChangeText={setInputVal}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          placeholder={isIncognito ? 'Incognito — Go anywhere...' : 'Search or type URL...'}
          placeholderTextColor={isIncognito ? '#8888aa' : '#555577'}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="go"
          selectTextOnFocus
        />
      </Animated.View>

      {/* Bookmark */}
      {!isHome && (
        <TouchableOpacity style={styles.iconBtn} onPress={handleBookmark}>
          <Text style={styles.secIcon}>{bookmarked ? '★' : '☆'}</Text>
        </TouchableOpacity>
      )}

      {/* Command Palette trigger */}
      <TouchableOpacity style={styles.iconBtn} onPress={() => setUI('showCommandPalette', true)}>
        <Text style={styles.secIcon}>⌘</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    marginHorizontal: 8,
    marginVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  incognitoWrapper: {
    backgroundColor: 'rgba(100,0,150,0.2)',
    borderColor: 'rgba(160,0,255,0.3)',
  },
  inputContainer: { flex: 1 },
  input: {
    color: '#e0e0ff',
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    fontFamily: 'monospace',
  },
  incognitoInput: { color: '#cc99ff' },
  iconBtn: { padding: 8 },
  secIcon: { fontSize: 16 },
});
