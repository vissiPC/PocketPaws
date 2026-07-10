import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

function StatBar({ value, icon }) {
  const fillWidth = useRef(new Animated.Value(value)).current;
  useEffect(() => {
    Animated.timing(fillWidth, {
      toValue: value, duration: 600,
      easing: Easing.out(Easing.quad), useNativeDriver: false,
    }).start();
  }, [value]);

  const barColor = value > 60 ? COLORS.statGreen : value > 30 ? COLORS.statAmber : COLORS.statRed;

  return (
    <View style={styles.statContainer}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statTrack}>
        <Animated.View style={[styles.statFill, {
          width: fillWidth.interpolate({
            inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp',
          }),
          backgroundColor: barColor,
        }]} />
      </View>
      <Text style={styles.statValue}>{Math.round(value)}</Text>
    </View>
  );
}

export default function HUD({ store }) {
  const age = store.getAge();
  const name = store.getPetName();

  return (
    <View style={styles.container}>
      <View style={styles.nameRow}>
        <Text style={styles.petName}>{name}</Text>
        <Text style={styles.ageText}>Day {age + 1}</Text>
        {store.isSick && <Text style={styles.sickBadge}>🤒 SICK</Text>}
      </View>
      <View style={styles.barsRow}>
        <StatBar value={store.hunger} icon="🍗" />
        <StatBar value={store.happiness} icon="❤️" />
        <StatBar value={store.energy} icon="⚡" />
        <StatBar value={store.cleanliness} icon="✨" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6 },
  nameRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginBottom: 8,
  },
  petName: {
    fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  ageText: {
    fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8,
  },
  sickBadge: {
    fontSize: 11, fontWeight: '700', color: COLORS.sickGreen,
    backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8,
  },
  barsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 5 },
  statContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 12,
    paddingHorizontal: 5, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  statIcon: { fontSize: 11 },
  statTrack: {
    flex: 1, height: 5, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3, overflow: 'hidden',
  },
  statFill: { height: '100%', borderRadius: 3 },
  statValue: {
    fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.75)',
    minWidth: 20, textAlign: 'right',
  },
});
