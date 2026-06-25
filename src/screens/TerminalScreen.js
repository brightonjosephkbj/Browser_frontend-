import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';

const BACKEND_WS = 'wss://browser-backend-1.onrender.com/terminal';

const WELCOME = `
  ██████╗ ██████╗ ██╗  ██╗
  ██╔══██╗╚════██╗██║  ██║
  ██████╔╝ █████╔╝███████║
  ██╔══██╗██╔═══╝ ╚════██║
  ██████╔╝███████╗     ██║
  ╚═════╝ ╚══════╝     ╚═╝
  B24 Terminal — Cloud Shell v1.0
  Connected to B24 Backend
  Type 'help' for available commands.
─────────────────────────────────────
`;

export default function TerminalScreen() {
  const [lines, setLines] = useState([{ type: 'output', text: WELCOME }]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const wsRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, []);

  const connect = () => {
    try {
      const ws = new WebSocket(BACKEND_WS);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        addLine('output', '✓ Shell connected\n');
      };

      ws.onmessage = (e) => {
        addLine('output', e.data);
      };

      ws.onerror = () => {
        addLine('error', '✗ Connection failed. Check backend URL.');
        setConnected(false);
      };

      ws.onclose = () => {
        setConnected(false);
        addLine('error', '⚡ Disconnected. Tap Reconnect to resume.\n');
      };
    } catch (err) {
      addLine('error', `Connection error: ${err.message}`);
    }
  };

  const addLine = (type, text) => {
    setLines(prev => [...prev, { type, text }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const sendCommand = () => {
    const cmd = input.trim();
    if (!cmd) return;
    addLine('input', `$ ${cmd}`);
    setHistory(h => [cmd, ...h].slice(0, 50));
    setHistoryIndex(-1);
    setInput('');

    if (!connected || !wsRef.current) {
      addLine('error', 'Not connected. Tap Reconnect.\n');
      return;
    }
    wsRef.current.send(cmd);
  };

  const handleHistoryUp = () => {
    const next = Math.min(historyIndex + 1, history.length - 1);
    setHistoryIndex(next);
    setInput(history[next] || '');
  };

  const handleHistoryDown = () => {
    const next = Math.max(historyIndex - 1, -1);
    setHistoryIndex(next);
    setInput(next === -1 ? '' : history[next]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.dot, connected ? styles.dotGreen : styles.dotRed]} />
        <Text style={styles.headerTitle}>B24 Terminal</Text>
        <TouchableOpacity onPress={connect} style={styles.reconnectBtn}>
          <Text style={styles.reconnectText}>↺ Reconnect</Text>
        </TouchableOpacity>
      </View>

      {/* Output */}
      <ScrollView
        ref={scrollRef}
        style={styles.output}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {lines.map((line, i) => (
          <Text
            key={i}
            style={[
              styles.line,
              line.type === 'input' && styles.lineInput,
              line.type === 'error' && styles.lineError,
            ]}
            selectable
          >
            {line.text}
          </Text>
        ))}
      </ScrollView>

      {/* History nav */}
      <View style={styles.historyNav}>
        <TouchableOpacity style={styles.histNavBtn} onPress={handleHistoryUp}>
          <Text style={styles.histNavText}>▲</Text>
        </TouchableOpacity>
        <Text style={styles.histNavLabel}>History</Text>
        <TouchableOpacity style={styles.histNavBtn} onPress={handleHistoryDown}>
          <Text style={styles.histNavText}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Input */}
      <View style={styles.inputRow}>
        <Text style={styles.prompt}>$</Text>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendCommand}
          placeholder="Enter command..."
          placeholderTextColor="#333"
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
          returnKeyType="send"
          selectionColor="#00ff41"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendCommand}>
          <Text style={styles.sendText}>↵</Text>
        </TouchableOpacity>
      </View>

      {/* Quick commands */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickBar}>
        {['ls', 'pwd', 'clear', 'top', 'df -h', 'free -m', 'whoami', 'uname -a'].map(cmd => (
          <TouchableOpacity
            key={cmd}
            style={styles.quickCmd}
            onPress={() => { setInput(cmd); }}
          >
            <Text style={styles.quickCmdText}>{cmd}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotGreen: { backgroundColor: '#00ff41' },
  dotRed: { backgroundColor: '#ff3333' },
  headerTitle: { color: '#00ff41', fontFamily: 'monospace', fontWeight: 'bold', flex: 1 },
  reconnectBtn: { backgroundColor: '#111', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#333' },
  reconnectText: { color: '#00ff41', fontSize: 12, fontFamily: 'monospace' },

  output: { flex: 1, padding: 10 },
  line: { color: '#00ff41', fontFamily: 'monospace', fontSize: 12, lineHeight: 18 },
  lineInput: { color: '#ffffff' },
  lineError: { color: '#ff4444' },

  historyNav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    gap: 8,
  },
  histNavBtn: { padding: 4 },
  histNavText: { color: '#555', fontSize: 14 },
  histNavLabel: { color: '#333', fontSize: 11, fontFamily: 'monospace' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  prompt: { color: '#00ff41', fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold' },
  input: {
    flex: 1,
    color: '#00ff41',
    fontFamily: 'monospace',
    fontSize: 13,
    paddingVertical: 6,
  },
  sendBtn: {
    backgroundColor: '#001a00',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#00ff41',
  },
  sendText: { color: '#00ff41', fontSize: 18, fontWeight: 'bold' },

  quickBar: { backgroundColor: '#050505', borderTopWidth: 1, borderTopColor: '#111', paddingVertical: 6, paddingHorizontal: 8 },
  quickCmd: {
    backgroundColor: '#0a0a0a',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1a3a1a',
  },
  quickCmdText: { color: '#00cc33', fontFamily: 'monospace', fontSize: 12 },
});
