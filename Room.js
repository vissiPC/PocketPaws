import React, { useRef, useEffect } from 'react';
import { Animated, ImageBackground, StyleSheet, View, Easing } from 'react-native';
import { SCREEN, TIMING } from '../constants';
import { DustMote } from './Particles';

export default function Room({ isDayTime, isSleeping }) {
  const bgOpacity = useRef(new Animated.Value(isDayTime ? 1 : 0)).current;
  const darkOpacity = useRef(new Animated.Value(isSleeping ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(bgOpacity, {
      toValue: isDayTime ? 1 : 0, duration: TIMING.crossfadeDuration,
      easing: Easing.inOut(Easing.quad), useNativeDriver: true,
    }).start();
  }, [isDayTime]);

  useEffect(() => {
    Animated.timing(darkOpacity, {
      toValue: isSleeping ? 1 : 0, duration: 1200,
      easing: Easing.inOut(Easing.quad), useNativeDriver: true,
    }).start();
  }, [isSleeping]);

  return (
    <>
      {/* Night background — always behind */}
      <View style={[StyleSheet.absoluteFill, { zIndex: -1 }]}>
        <ImageBackground
          source={require('../assets/room_night.png')}
          style={styles.bg} resizeMode="cover"
        />
        {/* Subtle overlay to mute the night background */}
        <View style={styles.bgMuteOverlay} />
      </View>

      {/* Day background — fades out at night */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        <ImageBackground
          source={require('../assets/room_day.png')}
          style={styles.bg} resizeMode="cover"
        />
        {/* Subtle overlay to mute the day background so pet pops */}
        <View style={styles.bgMuteOverlay} />
      </Animated.View>

      {/* Sleep darkness overlay */}
      <Animated.View
        style={[styles.sleepOverlay, { opacity: darkOpacity }]}
        pointerEvents="none"
      />

      {/* Dust motes — visible during day when not sleeping */}
      {isDayTime && !isSleeping && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <DustMote delay={0}    duration={8000}  startX={SCREEN.width * 0.15} size={4} color="rgba(255,235,180,0.45)" />
          <DustMote delay={2000} duration={10000} startX={SCREEN.width * 0.45} size={3} color="rgba(255,245,200,0.35)" />
          <DustMote delay={4000} duration={9000}  startX={SCREEN.width * 0.7}  size={5} color="rgba(255,230,160,0.3)" />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  bgMuteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sleepOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 5, 25, 0.72)', zIndex: 15,
  },
});
