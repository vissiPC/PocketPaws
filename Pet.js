import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Animated, Image, Easing, View, StyleSheet } from 'react-native';
import { ANCHORS, SCREEN, TIMING } from '../constants';
import { ZzzBubble, HeartParticle } from './Particles';

// ─── Sprite Map ─────────────────────────────────────────────
const SPRITES = {
  dog: {
    idle:  require('../assets/sprites/dog_idle.png'),
    walk:  require('../assets/sprites/dog_walk.png'),
    sleep: require('../assets/sprites/dog_sleep.png'),
    happy: require('../assets/sprites/dog_happy.png'),
    sad:   require('../assets/sprites/dog_sad.png'),
    eat:   require('../assets/sprites/dog_eat.png'),
    play:  require('../assets/sprites/dog_play.png'),
    yawn:  require('../assets/sprites/dog_yawn.png'),
    sick:  require('../assets/sprites/dog_sick.png'),
  },
  cat: {
    idle:  require('../assets/sprites/cat_idle.png'),
    walk:  require('../assets/sprites/cat_walk.png'),
    sleep: require('../assets/sprites/cat_sleep.png'),
    happy: require('../assets/sprites/cat_happy.png'),
    sad:   require('../assets/sprites/cat_sad.png'),
    eat:   require('../assets/sprites/cat_eat.png'),
    play:  require('../assets/sprites/cat_play.png'),
    yawn:  require('../assets/sprites/cat_yawn.png'),
    sick:  require('../assets/sprites/cat_sick.png'),
  },
};

export default function Pet({
  petType, isSleeping, isSick,
  hunger, happiness, energy,
  isFeeding, isPlaying,
  showHearts, onWalkComplete,
  petX, petY, petBounce, petRotate, petScaleY,
}) {
  const [pose, setPose] = useState('idle');
  const [direction, setDirection] = useState(1);
  const [facingFront, setFacingFront] = useState(false);

  // ─── Breathing Animation ────────────────────────────────
  useEffect(() => {
    const breathe = () => {
      const inhale = TIMING.breatheMin + Math.random() * TIMING.breatheRange;
      const exhale = TIMING.breatheMin + Math.random() * TIMING.breatheRange;
      const amplitude = isSleeping ? 0.025 : 0.03;
      Animated.sequence([
        Animated.timing(petScaleY, {
          toValue: 1 + amplitude + Math.random() * 0.01,
          duration: isSleeping ? inhale * 1.5 : inhale,
          easing: Easing.inOut(Easing.sin), useNativeDriver: true,
        }),
        Animated.timing(petScaleY, {
          toValue: 1,
          duration: isSleeping ? exhale * 1.5 : exhale,
          easing: Easing.inOut(Easing.sin), useNativeDriver: true,
        }),
      ]).start(breathe);
    };
    breathe();
  }, [isSleeping]);

  // ─── Auto-Sleep Transition ──────────────────────────────
  useEffect(() => {
    if (isSleeping) {
      // Yawn first
      setPose('yawn');
      setFacingFront(false);

      setTimeout(() => {
        // Walk to couch
        setPose('walk');
        const target = petType === 'dog' ? ANCHORS.couchLeft : ANCHORS.couchRight;
        setDirection(target.x > 0 ? 1 : -1);

        // Bouncy walk to couch
        const hops = 4;
        const hopDuration = 250;
        const bounceSeq = [];
        for (let i = 0; i < hops; i++) {
          bounceSeq.push(
            Animated.timing(petBounce, { toValue: -10, duration: hopDuration / 2, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(petBounce, { toValue: 0, duration: hopDuration / 2, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          );
        }

        Animated.parallel([
          Animated.spring(petX, { toValue: target.x, useNativeDriver: true, tension: 40, friction: 7 }),
          Animated.spring(petY, { toValue: target.y, useNativeDriver: true, tension: 40, friction: 7 }),
          Animated.sequence(bounceSeq),
        ]).start(() => {
          // Settle squash
          Animated.sequence([
            Animated.timing(petScaleY, { toValue: 0.88, duration: 150, useNativeDriver: true }),
            Animated.spring(petScaleY, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }),
          ]).start(() => {
            setPose('sleep');
          });
        });
      }, 1200); // Hold yawn for 1.2s
    } else if (!isSleeping && pose === 'sleep') {
      // Wake up sequence
      setPose('yawn');

      // Stretch animation
      Animated.sequence([
        Animated.timing(petScaleY, { toValue: 1.08, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(petScaleY, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();

      // Quick shake
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(petRotate, { toValue: 5, duration: 80, useNativeDriver: true }),
          Animated.timing(petRotate, { toValue: -5, duration: 80, useNativeDriver: true }),
          Animated.timing(petRotate, { toValue: 4, duration: 80, useNativeDriver: true }),
          Animated.timing(petRotate, { toValue: -3, duration: 80, useNativeDriver: true }),
          Animated.timing(petRotate, { toValue: 0, duration: 80, useNativeDriver: true }),
        ]).start();
      }, 600);

      // Hop down to floor
      setTimeout(() => {
        setPose('idle');
        setFacingFront(false);
        Animated.parallel([
          Animated.spring(petY, { toValue: ANCHORS.floorMinY, useNativeDriver: true, tension: 50, friction: 7 }),
          Animated.sequence([
            Animated.timing(petBounce, { toValue: -15, duration: 200, useNativeDriver: true }),
            Animated.timing(petBounce, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]),
        ]).start();
      }, 1400);
    }
  }, [isSleeping]);

  // ─── Feeding Animation ──────────────────────────────────
  useEffect(() => {
    if (isFeeding) {
      setFacingFront(false);
      setPose('walk');
      setDirection(-1);

      // Walk to bowl
      const hops = 3;
      const bounceSeq = [];
      for (let i = 0; i < hops; i++) {
        bounceSeq.push(
          Animated.timing(petBounce, { toValue: -10, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(petBounce, { toValue: 0, duration: 200, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        );
      }

      Animated.parallel([
        Animated.timing(petX, { toValue: ANCHORS.bowl.x - 35, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(petY, { toValue: ANCHORS.bowl.y - 10, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.sequence(bounceSeq),
      ]).start(() => {
        // Arrive squash
        Animated.sequence([
          Animated.timing(petScaleY, { toValue: 0.9, duration: 100, useNativeDriver: true }),
          Animated.spring(petScaleY, { toValue: 1, useNativeDriver: true }),
        ]).start();

        setPose('eat');

        // Head-bob eating
        Animated.sequence([
          Animated.timing(petRotate, { toValue: 8, duration: 150, useNativeDriver: true }),
          Animated.timing(petRotate, { toValue: -2, duration: 150, useNativeDriver: true }),
          Animated.timing(petRotate, { toValue: 6, duration: 150, useNativeDriver: true }),
          Animated.timing(petRotate, { toValue: -1, duration: 150, useNativeDriver: true }),
          Animated.timing(petRotate, { toValue: 5, duration: 150, useNativeDriver: true }),
          Animated.timing(petRotate, { toValue: -1, duration: 150, useNativeDriver: true }),
          Animated.timing(petRotate, { toValue: 4, duration: 150, useNativeDriver: true }),
          Animated.timing(petRotate, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start(() => {
          setPose('happy');
          setFacingFront(true);
          setTimeout(() => {
            setPose('idle');
            setFacingFront(false);
            setDirection(1);
            if (onWalkComplete) onWalkComplete('feed');
          }, 1000);
        });
      });
    }
  }, [isFeeding]);

  // ─── Playing Animation ──────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      setFacingFront(false);
      setPose('play');

      // Anticipation crouch
      Animated.sequence([
        Animated.timing(petScaleY, { toValue: 0.85, duration: 200, useNativeDriver: true }),
        Animated.timing(petScaleY, { toValue: 1.08, duration: 150, useNativeDriver: true }),
        Animated.timing(petScaleY, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();

      // Bounding chase — constrained to floor zone
      const bounds = [];
      const positions = [ANCHORS.floorMinX * 0.7, ANCHORS.floorMaxX * 0.7, ANCHORS.floorMinX * 0.4, ANCHORS.floorMaxX * 0.5, 0];
      positions.forEach((pos, i) => {
        setDirection(pos > 0 ? 1 : -1);
        bounds.push(
          Animated.parallel([
            Animated.timing(petX, { toValue: pos, duration: 350, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(petBounce, { toValue: -25, duration: 175, easing: Easing.out(Easing.quad), useNativeDriver: true }),
              Animated.timing(petBounce, { toValue: 0, duration: 175, easing: Easing.in(Easing.quad), useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(petScaleY, { toValue: 1.1, duration: 175, useNativeDriver: true }),
              Animated.timing(petScaleY, { toValue: 0.9, duration: 175, useNativeDriver: true }),
            ]),
          ])
        );
      });

      Animated.sequence(bounds).start(() => {
        // Catch freeze + scale pulse
        Animated.sequence([
          Animated.timing(petScaleY, { toValue: 1.15, duration: 100, useNativeDriver: true }),
          Animated.spring(petScaleY, { toValue: 1, useNativeDriver: true, tension: 200, friction: 6 }),
        ]).start();

        setPose('happy');
        setFacingFront(true);

        setTimeout(() => {
          setPose('idle');
          setFacingFront(false);
          setDirection(1);
          if (onWalkComplete) onWalkComplete('play');
        }, 1500);
      });
    }
  }, [isPlaying]);

  // ─── Wandering (idle movement) ──────────────────────────
  const wander = useCallback(() => {
    if (isSleeping || isFeeding || isPlaying) return;

    const isStarving = hunger < 30;
    const isTired = energy < 25;

    // Random fourth-wall breaks
    if ((isStarving || isTired) && Math.random() < 0.3) {
      setFacingFront(true);
      setPose(isSick ? 'sick' : 'sad');
      setTimeout(() => { setFacingFront(false); setPose('idle'); }, 3000);
      return;
    }
    if (Math.random() < 0.12 && !isStarving && !isTired) {
      setFacingFront(true);
      setPose('happy');
      setTimeout(() => { setFacingFront(false); setPose('idle'); }, 2500);
      return;
    }
    // Random yawn when tired
    if (energy < 30 && Math.random() < 0.2) {
      setPose('yawn');
      setTimeout(() => setPose('idle'), 2000);
      return;
    }

    // Normal walk — constrained to safe floor zone (no couch/table overlap)
    const randX = ANCHORS.floorMinX + Math.random() * (ANCHORS.floorMaxX - ANCHORS.floorMinX);
    const randY = ANCHORS.floorMinY + Math.random() * (ANCHORS.floorMaxY - ANCHORS.floorMinY);
    const newDir = randX > (petX._value || 0) ? 1 : -1;
    setDirection(newDir);
    setPose('walk');

    const duration = isStarving ? 1200 : 2500;
    const hops = Math.floor(duration / 350);
    const bounceSeq = [];
    for (let i = 0; i < hops; i++) {
      bounceSeq.push(
        Animated.timing(petBounce, { toValue: -10, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(petBounce, { toValue: 0, duration: 150, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      );
    }
    // Squash on each landing
    const squashSeq = [];
    for (let i = 0; i < hops; i++) {
      squashSeq.push(
        Animated.timing(petScaleY, { toValue: 1.04, duration: 150, useNativeDriver: true }),
        Animated.timing(petScaleY, { toValue: 0.96, duration: 100, useNativeDriver: true }),
        Animated.timing(petScaleY, { toValue: 1, duration: 50, useNativeDriver: true }),
      );
    }

    Animated.parallel([
      Animated.timing(petX, { toValue: randX, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(petY, { toValue: randY, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.sequence(bounceSeq),
      Animated.sequence(squashSeq),
      // Head bob during walk
      Animated.sequence([
        Animated.timing(petRotate, { toValue: 3, duration: duration / 4, useNativeDriver: true }),
        Animated.timing(petRotate, { toValue: -3, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(petRotate, { toValue: 0, duration: duration / 4, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setPose(isSick ? 'sick' : 'idle');
    });
  }, [isSleeping, isFeeding, isPlaying, hunger, energy, isSick]);

  // ─── Get Current Sprite ─────────────────────────────────
  const getCurrentSprite = () => {
    if (!petType || !SPRITES[petType]) return SPRITES.dog.idle;
    const sprites = SPRITES[petType];

    if (isSick && pose !== 'sleep' && pose !== 'yawn' && pose !== 'eat') {
      return facingFront ? sprites.sick : sprites.sick;
    }
    if (facingFront) {
      if (pose === 'happy') return sprites.happy;
      if (pose === 'sad') return sprites.sad;
      if (pose === 'sick') return sprites.sick;
      return sprites.happy;
    }
    return sprites[pose] || sprites.idle;
  };

  // ─── Scale based on Y position (depth) ─────────────────
  const petScaleInterp = petY.interpolate({
    inputRange: [SCREEN.height * 0.08, ANCHORS.floorMinY, ANCHORS.floorMaxY],
    outputRange: [0.85, 0.85, 1.15],
    extrapolate: 'clamp',
  });

  const rotateInterp = petRotate.interpolate({
    inputRange: [-10, 0, 10], outputRange: ['-10deg', '0deg', '10deg'],
  });

  // Expose wander to parent
  useEffect(() => {
    if (onWalkComplete) {
      // Store wander function on a ref the parent can call
      Pet._wander = wander;
    }
  }, [wander]);

  return (
    <Animated.View style={[styles.wrapper, {
      transform: [
        { translateX: petX },
        { translateY: petY },
        { scale: petScaleInterp },
        { scaleY: petScaleY },
        { translateY: petBounce },
      ],
    }]}>
      <Animated.Image
        source={getCurrentSprite()}
        style={[styles.sprite, {
          transform: [
            { scaleX: facingFront ? 1 : direction },
            { rotate: rotateInterp },
          ],
        }]}
      />

      {/* Sleeping Zzz */}
      {isSleeping && pose === 'sleep' && (
        <View style={{ position: 'absolute', top: -20, right: -20 }}>
          <ZzzBubble delay={0} index={0} />
          <ZzzBubble delay={800} index={1} />
          <ZzzBubble delay={1600} index={2} />
        </View>
      )}

      {/* Hearts during/after play */}
      {showHearts && (
        <View style={{ position: 'absolute', top: -10 }}>
          <HeartParticle delay={0} startX={-15} />
          <HeartParticle delay={200} startX={10} />
          <HeartParticle delay={400} startX={-5} />
          <HeartParticle delay={600} startX={15} />
          <HeartParticle delay={800} startX={-10} />
        </View>
      )}
    </Animated.View>
  );
}

// Static reference for parent to call wander
Pet._wander = null;

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  sprite: { width: 115, height: 115, resizeMode: 'contain' },
});
