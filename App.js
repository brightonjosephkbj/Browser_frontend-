import 'react-native-gesture-handler';
import React from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import BrowserScreen from './src/screens/BrowserScreen';
import TerminalScreen from './src/screens/TerminalScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PasswordVaultScreen from './src/screens/PasswordVaultScreen';

import { TabBar, TabManager } from './src/components/TabBar';
import AddressBar from './src/components/AddressBar';
import CommandPalette from './src/components/CommandPalette';
import NotesPanel from './src/components/NotesPanel';

import useStore from './src/store/browserStore';

const Stack = createStackNavigator();

function BrowserLayout({ navigation }) {
  const { showCommandPalette, showNotes } = useStore();
  return (
    <View style={styles.layout}>
      <StatusBar barStyle="light-content" backgroundColor="#050508" />
      <TabBar />
      <AddressBar />
      <View style={styles.content}>
        <BrowserScreen />
      </View>
      <TabManager />
      {showCommandPalette && <CommandPalette navigation={navigation} />}
      {showNotes && <NotesPanel />}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.root}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: '#050508', elevation: 0, shadowOpacity: 0 },
              headerTintColor: '#e0e0ff',
              headerTitleStyle: { fontWeight: 'bold' },
              cardStyle: { backgroundColor: '#050508' },
            }}
          >
            <Stack.Screen name="Home" component={BrowserLayout} options={{ headerShown: false }} />
            <Stack.Screen name="Terminal" component={TerminalScreen}
              options={{ title: 'B24 Terminal', headerStyle: { backgroundColor: '#000' }, headerTintColor: '#00ff41' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
            <Stack.Screen name="PasswordVault" component={PasswordVaultScreen} options={{ title: '🔐 Password Vault' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050508' },
  layout: { flex: 1, backgroundColor: '#050508' },
  content: { flex: 1 },
});
