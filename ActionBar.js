import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';

function ActionButton({ icon, label, onPress, disabled, active }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.82, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handlePress} disabled={disabled}>
      <Animated.View style={[
        styles.btn,
        disabled && styles.btnDisabled,
        active && styles.btnActive,
        { transform: [{ scale }] },
      ]}>
        <Text style={styles.btnIcon}>{icon}</Text>
        <Text style={[styles.btnLabel, disabled && styles.btnLabelDisabled]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function ActionBar({ onFeed, onPlay, onClean, onMedicine, isSick, isSleeping, canPlay }) {
  return (
    <View style={styles.container}>
      <ActionButton icon="🍖" label="FEED" onPress={onFeed} disabled={isSleeping} />
      <ActionButton icon="🎾" label="PLAY" onPress={onPlay} disabled={isSleeping || !canPlay} />
      <ActionButton icon="🧹" label="CLEAN" onPress={onClean} disabled={isSleeping} />
      {isSick && (
        <ActionButton icon="💊" label="MEDS" onPress={onMedicine} active />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', justifyContent: 'space-evenly',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginHorizontal: 20, marginBottom: 25,
    paddingVertical: 10, borderRadius: 30,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  btn: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 14, paddingVertical: 4,
  },
  btnDisabled: { opacity: 0.35 },
  btnActive: {
    backgroundColor: 'rgba(163,230,53,0.15)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(163,230,53,0.3)',
  },
  btnIcon: { fontSize: 22, marginBottom: 1 },
  btnLabel: {
    fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.8,
  },
  btnLabelDisabled: { color: 'rgba(255,255,255,0.3)' },
});
