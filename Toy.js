import React, { useRef, useEffect } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { ANCHORS, SCREEN } from '../constants';

export default function Toy({ petType, isPlaying }) {
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPlaying) {
      x.setValue(-SCREEN.width / 2);
      y.setValue(ANCHORS.floorMaxY - 40);
      rotate.setValue(0);
      opacity.setValue(1);

      Animated.parallel([
        Animated.timing(x, { toValue: SCREEN.width / 2, duration: 2000, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(y, { toValue: ANCHORS.floorMinY - 20, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(y, { toValue: ANCHORS.floorMaxY, duration: 500, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.timing(y, { toValue: ANCHORS.floorMinY, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(y, { toValue: ANCHORS.floorMaxY, duration: 500, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.timing(rotate, { toValue: 720, duration: 2000, useNativeDriver: true }),
      ]).start(() => {
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      });
    }
  }, [isPlaying]);

  if (!isPlaying) return null;

  const toySource = petType === 'dog'
    ? require('../assets/sprites/tennis_ball.png')
    : require('../assets/sprites/yarn.png');

  const rotateInterp = rotate.interpolate({
    inputRange: [0, 720], outputRange: ['0deg', '720deg'],
  });

  return (
    <Animated.Image
      source={toySource}
      style={[styles.toy, {
        opacity,
        transform: [{ translateX: x }, { translateY: y }, { rotate: rotateInterp }],
      }]}
    />
  );
}

const styles = StyleSheet.create({
  toy: { position: 'absolute', width: 36, height: 36, resizeMode: 'contain', zIndex: 8 },
});
