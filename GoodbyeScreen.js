import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

export default function GoodbyeScreen({ petType, onReset }) {
  const fade = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const textSlide = useRef(new Animated.Value(20)).current;

  const name = petType === 'dog' ? 'Milo' : 'Snowbell';
  const emoji = petType === 'dog' ? '🐕' : '🐱';

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fade, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(iconScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
        Animated.timing(textSlide, { toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      <Animated.Text style={[styles.icon, { transform: [{ scale: iconScale }] }]}>
        {emoji}
      </Animated.Text>

      <Animated.View style={{ transform: [{ translateY: textSlide }] }}>
        <Text style={styles.title}>{name} ran away...</Text>
        <Text style={styles.message}>
          {name} wasn't getting the care {petType === 'dog' ? 'he' : 'she'} needed{'\n'}
          and went to find a better home.
        </Text>
        <Text style={styles.hint}>
          Remember: pets need food, play, and a clean space{'\n'}
          to be happy and healthy.
        </Text>
      </Animated.View>

      <TouchableOpacity style={styles.btn} onPress={onReset} activeOpacity={0.8}>
        <Text style={styles.btnText}>Try Again</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 30,
  },
  icon: { fontSize: 80, marginBottom: 24 },
  title: {
    fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'center',
    lineHeight: 22, marginBottom: 12,
  },
  hint: {
    fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center',
    lineHeight: 20, fontStyle: 'italic', marginBottom: 40,
  },
  btn: {
    backgroundColor: COLORS.accent, paddingVertical: 14, paddingHorizontal: 40,
    borderRadius: 24,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
