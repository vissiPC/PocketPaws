import React, { useRef, useEffect } from 'react';
import { Animated, Easing, View, Text } from 'react-native';
import { SCREEN } from '../constants';

// ─── Floating Dust Mote ─────────────────────────────────────
export function DustMote({ delay, duration, startX, size, color }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1, duration, delay,
        easing: Easing.linear, useNativeDriver: true,
      }).start(loop);
    };
    loop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', width: size, height: size,
        borderRadius: size / 2, backgroundColor: color,
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 0.5, 0.35, 0] }),
        transform: [
          { translateX: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [startX, startX + 18, startX - 12] }) },
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [SCREEN.height * 0.5, -50] }) },
        ],
      }}
    />
  );
}

// ─── Rising Zzz Bubble ──────────────────────────────────────
export function ZzzBubble({ delay: d, index }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1, duration: 2500, delay: d,
        easing: Easing.out(Easing.quad), useNativeDriver: true,
      }).start(loop);
    };
    loop();
  }, []);

  const sizes = [14, 17, 20];
  return (
    <Animated.Text
      pointerEvents="none"
      style={{
        position: 'absolute', top: -25 - index * 5, right: -20 + index * 8,
        fontSize: sizes[index] || 16, fontWeight: '900',
        color: 'rgba(255,255,255,0.8)',
        textShadowColor: 'rgba(100,150,255,0.4)',
        textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
        opacity: anim.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 0.5, 0] }),
        transform: [
          { translateX: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 10 + index * 4, -5] }) },
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -60 - index * 10] }) },
          { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2 + index * 0.15] }) },
        ],
      }}
    >z</Animated.Text>
  );
}

// ─── Heart Particle ─────────────────────────────────────────
export function HeartParticle({ delay: d, startX }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1, duration: 1800, delay: d,
      easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.Text
      pointerEvents="none"
      style={{
        position: 'absolute', top: -20, fontSize: 18,
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.6, 1], outputRange: [0, 1, 0.6, 0] }),
        transform: [
          { translateX: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [startX, startX + 12, startX - 6] }) },
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -80] }) },
          { scale: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.3, 1.1, 0.7] }) },
        ],
      }}
    >❤️</Animated.Text>
  );
}

// ─── Kibble Burst Particles ─────────────────────────────────
export function KibbleBurst() {
  const particles = [0, 1, 2, 3, 4].map(i => {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(anim, {
        toValue: 1, duration: 600, delay: i * 80,
        easing: Easing.out(Easing.quad), useNativeDriver: true,
      }).start();
    }, []);
    const angle = (i / 5) * Math.PI - Math.PI / 2;
    const dist = 20 + Math.random() * 15;
    return (
      <Animated.View
        key={i}
        pointerEvents="none"
        style={{
          position: 'absolute', width: 5, height: 5,
          borderRadius: 2, backgroundColor: '#8B5E3C',
          opacity: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 0] }),
          transform: [
            { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * dist] }) },
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * dist - 10] }) },
          ],
        }}
      />
    );
  });
  return <View style={{ position: 'absolute' }}>{particles}</View>;
}
