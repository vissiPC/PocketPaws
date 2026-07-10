import React, { useRef, useEffect } from 'react';
import { Animated, Image, View, Text, StyleSheet } from 'react-native';
import { SCREEN } from '../constants';

export default function PoopPiles({ count }) {
  if (count === 0) return null;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PoopPile key={i} index={i} />
      ))}
    </>
  );
}

function PoopPile({ index }) {
  const flyRotate = useRef(new Animated.Value(0)).current;
  const stinkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(flyRotate, { toValue: 360, duration: 1200, useNativeDriver: true })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(stinkAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(stinkAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const flyInterp = flyRotate.interpolate({
    inputRange: [0, 360], outputRange: ['0deg', '360deg'],
  });

  const positions = [
    { left: SCREEN.width / 2 - 70, bottom: SCREEN.height * 0.06 },
    { left: SCREEN.width / 2 + 10, bottom: SCREEN.height * 0.04 },
    { left: SCREEN.width / 2 - 25, bottom: SCREEN.height * 0.08 },
  ];

  const pos = positions[index] || positions[0];

  return (
    <View style={[styles.container, { left: pos.left, bottom: pos.bottom }]}>
      <Image source={require('../assets/sprites/poop.png')} style={styles.poopImg} />

      {/* Rotating flies */}
      <Animated.View style={[styles.flyRing, { transform: [{ rotate: flyInterp }] }]}>
        <View style={[styles.fly, { top: -2, left: 12 }]} />
        <View style={[styles.fly, { top: 18, right: -2 }]} />
        <View style={[styles.fly, { bottom: 2, left: 4 }]} />
      </Animated.View>

      {/* Stink waves */}
      <Animated.Text style={[styles.stink, {
        opacity: stinkAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] }),
        transform: [{ translateY: stinkAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }],
      }]}>~</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', zIndex: 5, alignItems: 'center' },
  poopImg: { width: 32, height: 32, resizeMode: 'contain' },
  flyRing: { position: 'absolute', width: 45, height: 45 },
  fly: { position: 'absolute', width: 3, height: 3, backgroundColor: '#444', borderRadius: 2 },
  stink: {
    position: 'absolute', top: -14, fontSize: 16,
    color: 'rgba(120,140,80,0.6)', fontWeight: '300',
  },
});
