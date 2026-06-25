import React, { useRef, useState } from 'react';
import {
  View, StyleSheet, ActivityIndicator, Text,
  TouchableOpacity, Alert
} from 'react-native';
import { WebView } from 'react-native-webview';
import useStore from '../store/browserStore';
import NewTabScreen from './NewTabScreen';

const AD_BLOCK_SCRIPT = `
(function() {
  const blocked = [
    'doubleclick.net','googlesyndication.com','adservice.google.com',
    'amazon-adsystem.com','ads.twitter.com','facebook.com/tr',
    'scorecardresearch.com','quantserve.com','outbrain.com','taboola.com',
    'adsafeprotected.com','moatads.com','pubmatic.com','rubiconproject.com',
    'openx.net','appnexus.com','criteo.com','adroll.com','hotjar.com',
  ];
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(m, url) {
    if (blocked.some(d => url && url.includes(d))) return;
    return origOpen.apply(this, arguments);
  };
  const origFetch = window.fetch;
  window.fetch = function(url, ...args) {
    if (typeof url === 'string' && blocked.some(d => url.includes(d)))
      return Promise.reject(new Error('Blocked'));
    return origFetch(url, ...args);
  };
  const bannerSelectors = [
    '#cookie-banner','#cookie-notice','.cookie-consent','.gdpr-banner',
    '#onetrust-banner-sdk','#cookieConsent','.cc-banner',
  ];
  const removeBanners = () => {
    bannerSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.remove());
    });
  };
  document.addEventListener('DOMContentLoaded', removeBanners);
  setTimeout(removeBanners, 2000);
})();
true;
`;

const DARK_MODE_SCRIPT = `
(function() {
  const style = document.createElement('style');
  style.id = 'b24-dark';
  style.textContent = \`
    html { filter: invert(1) hue-rotate(180deg) !important; }
    img, video, iframe, canvas, svg { filter: invert(1) hue-rotate(180deg) !important; }
  \`;
  if (!document.getElementById('b24-dark')) document.head.appendChild(style);
})();
true;
`;

const READER_MODE_SCRIPT = `
(function() {
  const article = document.querySelector('article') ||
    document.querySelector('[role="main"]') ||
    document.querySelector('main') ||
    document.body;
  const text = article ? article.innerText : document.body.innerText;
  document.body.innerHTML = \`
    <div style="max-width:680px;margin:40px auto;padding:0 20px;font-family:Georgia,serif;
    font-size:18px;line-height:1.8;color:#e0e0e0;background:#0d0d1a;min-height:100vh;">
      <div style="margin-bottom:32px;padding-bottom:16px;border-bottom:1px solid #333;">
        <div style="font-size:12px;color:#6600ff;font-weight:bold;letter-spacing:2px;
        text-transform:uppercase;margin-bottom:8px;">B24 Reader Mode</div>
        <h1 style="color:#fff;font-size:24px;margin:0;">\${document.title}</h1>
      </div>
      <div style="white-space:pre-wrap;">\${text}</div>
    </div>
  \`;
  document.body.style.background = '#0d0d1a';
})();
true;
`;

function TabWebView({ tab, isActive, onNavigationStateChange, onLoadEnd, settings }) {
  const webviewRef = useRef(null);

  const handleLoadEnd = (e) => {
    onLoadEnd(tab.id, e, webviewRef);
    const wv = webviewRef.current;
    if (!wv) return;
    if (settings.adBlockEnabled) wv.injectJavaScript(AD_BLOCK_SCRIPT);
    if (settings.darkModeInjector) wv.injectJavaScript(DARK_MODE_SCRIPT);
    if (settings.readerMode) wv.injectJavaScript(READER_MODE_SCRIPT);
  };

  const handleShouldLoad = (request) => {
    const { url } = request;
    const phishingPatterns = ['verify-account','login-secure','paypal-verify','bank-update','account-suspended'];
    if (phishingPatterns.some(p => url.includes(p))) {
      Alert.alert(
        '⚠️ Security Warning',
        `This site may be attempting to steal your information.\n\n${url}`,
        [
          { text: 'Go Back', style: 'cancel', onPress: () => webviewRef.current?.goBack() },
          { text: 'Continue Anyway', style: 'destructive' },
        ]
      );
    }
    return true;
  };

  return (
    <View style={[styles.webviewWrapper, !isActive && styles.hidden]}>
      <WebView
        ref={webviewRef}
        source={{ uri: tab.url }}
        style={styles.webview}
        onNavigationStateChange={(state) => onNavigationStateChange(tab.id, state)}
        onLoadEnd={handleLoadEnd}
        onShouldStartLoadWithRequest={handleShouldLoad}
        javaScriptEnabled
        domStorageEnabled={!tab.isIncognito}
        incognito={tab.isIncognito}
        thirdPartyCookiesEnabled={false}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        pullToRefreshEnabled
        renderToHardwareTextureAndroid
        userAgent="B24Browser/1.0 (Android; Mobile)"
      />
    </View>
  );
}

export default function BrowserScreen() {
  const { tabs, activeTabId, updateTab, addHistory, navigate, settings } = useStore();
  const webviewNavStates = useRef({});
  const webviewRefs = useRef({});
  const [loadingTabs, setLoadingTabs] = useState({});

  const activeTab = tabs.find(t => t.id === activeTabId);
  const isHome = activeTab?.url === 'home';

  const handleNavigationStateChange = (tabId, navState) => {
    webviewNavStates.current[tabId] = navState;
    updateTab(tabId, { url: navState.url, title: navState.title || navState.url });
  };

  const handleLoadEnd = (tabId, e, ref) => {
    setLoadingTabs(prev => ({ ...prev, [tabId]: false }));
    const { url, title } = e.nativeEvent;
    addHistory({ url, title, date: Date.now() });
    webviewRefs.current[tabId] = ref;
  };

  const activeNavState = webviewNavStates.current[activeTabId];
  const canGoBack = activeNavState?.canGoBack || false;
  const canGoForward = activeNavState?.canGoForward || false;
  const isLoading = loadingTabs[activeTabId];
  const urlTabs = tabs.filter(t => t.url !== 'home');
  const getActiveWV = () => webviewRefs.current[activeTabId]?.current;

  return (
    <View style={styles.container}>
      {isLoading && <View style={styles.progressBar}><View style={styles.progressFill} /></View>}

      {/* Home screen */}
      {isHome && <NewTabScreen />}

      {/* ALL url tabs rendered at once — hidden ones stay alive in background */}
      <View style={[styles.webviewContainer, isHome && styles.hidden]}>
        {urlTabs.map(tab => (
          <TabWebView
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId && !isHome}
            onNavigationStateChange={handleNavigationStateChange}
            onLoadEnd={handleLoadEnd}
            settings={settings}
          />
        ))}
      </View>

      <View style={styles.navBar}>
        <TouchableOpacity style={[styles.navBtn, !canGoBack && styles.navBtnDisabled]} onPress={() => canGoBack && getActiveWV()?.goBack()}>
          <Text style={styles.navIcon}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, !canGoForward && styles.navBtnDisabled]} onPress={() => canGoForward && getActiveWV()?.goForward()}>
          <Text style={styles.navIcon}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => getActiveWV()?.reload()}>
          <Text style={styles.navIcon}>↺</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigate('home')}>
          <Text style={styles.navIcon}>⌂</Text>
        </TouchableOpacity>
        {isLoading && <ActivityIndicator size="small" color="#6600ff" style={{ marginLeft: 8 }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050508' },
  webviewContainer: { flex: 1 },
  webviewWrapper: { ...StyleSheet.absoluteFillObject },
  hidden: { display: 'none' },
  webview: { flex: 1 },
  progressBar: { height: 2, backgroundColor: 'rgba(255,255,255,0.05)' },
  progressFill: { height: 2, backgroundColor: '#6600ff', width: '60%' },
  navBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(5,5,8,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  navBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  navBtnDisabled: { opacity: 0.3 },
  navIcon: { color: '#e0e0ff', fontSize: 22, fontWeight: '300' },
});
