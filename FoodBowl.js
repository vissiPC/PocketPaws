import React, { useRef, useEffect } from 'react';
import { Animated, Image, View, StyleSheet } from 'react-native';
import { ANCHORS } from '../constants';
import { KibbleBurst } from './Particles';

export default function FoodBowl({ isFeeding }) {
  const kibbleOpacity = useRef(new Animated.Value(0)).current;
  const showBurst = useRef(false);

  useEffect(() => {
    if (isFeeding) {
      showBurst.current = true;
      Animated.sequence([
        Animated.delay(1200), // Wait for pet to arrive at bowl
        Animated.timing(kibbleOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1500),
        Animated.timing(kibbleOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => { showBurst.current = false; });
    }
  }, [isFeeding]);

  return (
    <View style={[styles.container, {
      transform: [{ translateX: ANCHORS.bowl.x }, { translateY: ANCHORS.bowl.y }],
    }]}>
      <Image source={require('../assets/sprites/bowl.png')} style={styles.bowl} />
      <Animated.View style={[styles.kibbleOverlay, { opacity: kibbleOpacity }]} />
      {isFeeding && <KibbleBurst />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', zIndex: 5 },
  bowl: { width: 55, height: 38, resizeMode: 'contain' },
  kibbleOverlay: {
    position: 'absolute', top: 5, left: 13,
    width: 28, height: 13, backgroundColor: '#8B5E3C', borderRadius: 10,
  },
});
