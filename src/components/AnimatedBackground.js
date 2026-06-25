import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const WALLPAPERS = {
  animated_aurora: {
    colors: ['#050508', '#0d0d2b', '#1a0533', '#050508'],
    orbs: [
      { color: '#6600ff', size: 200, x: 0.1, y: 0.2 },
      { color: '#00ccff', size: 150, x: 0.7, y: 0.1 },
      { color: '#ff0099', size: 180, x: 0.4, y: 0.6 },
      { color: '#0033ff', size: 120, x: 0.8, y: 0.7 },
    ]
  },
  cyber_night: {
    colors: ['#000000', '#001a00', '#000d1a', '#000000'],
    orbs: [
      { color: '#00ff41', size: 160, x: 0.2, y: 0.3 },
      { color: '#00ffff', size: 130, x: 0.8, y: 0.2 },
      { color: '#ff6600', size: 100, x: 0.5, y: 0.7 },
    ]
  },
  deep_space: {
    colors: ['#000000', '#05001a', '#0a0020', '#000000'],
    orbs: [
      { color: '#4444ff', size: 220, x: 0.3, y: 0.2 },
      { color: '#aa00ff', size: 170, x: 0.7, y: 0.5 },
      { color: '#ff4400', size: 140, x: 0.1, y: 0.7 },
    ]
  },
  sunset_fire: {
    colors: ['#0d0000', '#1a0500', '#200a00', '#0d0000'],
    orbs: [
      { color: '#ff3300', size: 200, x: 0.5, y: 0.3 },
      { color: '#ff9900', size: 160, x: 0.2, y: 0.6 },
      { color: '#ff0066', size: 140, x: 0.8, y: 0.2 },
    ]
  },
  ocean_deep: {
    colors: ['#000d1a', '#001533', '#001a2e', '#000d1a'],
    orbs: [
      { color: '#0066ff', size: 200, x: 0.4, y: 0.3 },
      { color: '#00ccff', size: 150, x: 0.1, y: 0.6 },
      { color: '#00ffcc', size: 130, x: 0.8, y: 0.5 },
    ]
  }
};

const Orb = ({ color, size, x, y, delay = 0 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const posX = useRef(new Animated.Value(0)).current;
  const posY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 3000 + delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.5, duration: 3000 + delay, useNativeDriver: true }),
      ])
    );

    const floatX = Animated.loop(
      Animated.sequence([
        Animated.timing(posX, { toValue: 30, duration: 4000 + delay, useNativeDriver: true }),
        Animated.timing(posX, { toValue: -20, duration: 4000 + delay, useNativeDriver: true }),
        Animated.timing(posX, { toValue: 0, duration: 4000 + delay, useNativeDriver: true }),
      ])
    );

    const floatY = Animated.loop(
      Animated.sequence([
        Animated.timing(posY, { toValue: -25, duration: 5000 + delay, useNativeDriver: true }),
        Animated.timing(posY, { toValue: 20, duration: 5000 + delay, useNativeDriver: true }),
        Animated.timing(posY, { toValue: 0, duration: 5000 + delay, useNativeDriver: true }),
      ])
    );

    pulse.start();
    floatX.start();
    floatY.start();

    return () => { pulse.stop(); floatX.stop(); floatY.stop(); };
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x * width - size / 2,
        top: y * height - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: anim,
        transform: [{ translateX: posX }, { translateY: posY }],
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: size / 2,
        elevation: 20,
      }}
    />
  );
};

export default function AnimatedBackground({ wallpaper = 'animated_aurora', children }) {
  const theme = WALLPAPERS[wallpaper] || WALLPAPERS.animated_aurora;

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.colors} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.orbContainer]}>
        {theme.orbs.map((orb, i) => (
          <Orb key={i} {...orb} delay={i * 800} />
        ))}
      </View>
      <View style={[StyleSheet.absoluteFill, styles.blur]} />
      {children}
    </View>
  );
}

export { WALLPAPERS };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050508' },
  orbContainer: { overflow: 'hidden' },
  blur: { backgroundColor: 'rgba(0,0,0,0.45)' },
});
