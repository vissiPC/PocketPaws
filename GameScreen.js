import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, Animated, StyleSheet, SafeAreaView } from 'react-native';
import { usePetStore } from '../store';
import { TIMING, THRESHOLDS } from '../constants';
import { useGameAudio } from '../hooks/useAudio';
import Room from './Room';
import Pet from './Pet';
import HUD from './HUD';
import ActionBar from './ActionBar';
import FoodBowl from './FoodBowl';
import Toy from './Toy';
import PoopPiles from './Poop';

export default function GameScreen() {
  const store = usePetStore();
  const { play: playSound, playVoice } = useGameAudio();

  const [isDayTime, setIsDayTime] = useState(true);
  const [message, setMessage] = useState('');
  const [isFeeding, setIsFeeding] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  // Core animated values (owned by GameScreen, passed to Pet)
  const petX      = useRef(new Animated.Value(0)).current;
  const petY      = useRef(new Animated.Value(150)).current;
  const petBounce = useRef(new Animated.Value(0)).current;
  const petRotate = useRef(new Animated.Value(0)).current;
  const petScaleY = useRef(new Animated.Value(1)).current;

  // Vignette for critical stats
  const vignetteOpacity = useRef(new Animated.Value(0)).current;

  // Message toast fade
  const msgFade = useRef(new Animated.Value(0)).current;

  // ─── Time-of-day Check ──────────────────────────────────
  useEffect(() => {
    const check = () => {
      const hour = new Date().getHours();
      setIsDayTime(hour >= 6 && hour < 18);
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  // ─── Vignette Effect ────────────────────────────────────
  useEffect(() => {
    const lowest = Math.min(store.hunger, store.happiness, store.energy);
    const target = lowest < 15 ? 0.5 : lowest < 30 ? 0.2 : 0;
    Animated.timing(vignetteOpacity, {
      toValue: target, duration: 1000, useNativeDriver: true,
    }).start();
  }, [store.hunger, store.happiness, store.energy]);

  // ─── Game Loop ──────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      store.tick(TIMING.tickInterval);
      store.saveState();

      // Trigger wandering on the pet
      if (!store.isSleeping && !isFeeding && !isPlaying && Pet._wander) {
        Pet._wander();
      }

      // Play voice on sad breaks
      if (!store.isSleeping && (store.hunger < 25 || store.energy < 20)) {
        if (Math.random() < 0.15) {
          playVoice(store.petType);
        }
      }
    }, TIMING.tickInterval);

    return () => clearInterval(interval);
  }, [store.isSleeping, isFeeding, isPlaying, store.petType]);

  // ─── Show Message ───────────────────────────────────────
  const showMsg = useCallback((msg) => {
    setMessage(msg);
    msgFade.setValue(0);
    Animated.sequence([
      Animated.timing(msgFade, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(msgFade, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setMessage(''));
  }, []);

  // ─── Action Completion ──────────────────────────────────
  const handleActionComplete = useCallback((action) => {
    if (action === 'feed') setIsFeeding(false);
    if (action === 'play') {
      setIsPlaying(false);
      setTimeout(() => setShowHearts(false), 1800);
    }
  }, []);

  // ─── Action Handlers ───────────────────────────────────
  const handleFeed = useCallback(() => {
    playSound('tap');
    const result = store.feed();
    switch (result) {
      case 'sleeping': showMsg('💤 Shhh... sleeping'); break;
      case 'cooldown': showMsg('Wait a moment...'); break;
      case 'overfeed':
        showMsg('🤢 Tummy ache! Don\'t overfeed!');
        playVoice(store.petType);
        break;
      case 'ok':
        setIsFeeding(true);
        playSound('eat');
        // Play bark/meow after a short delay (while walking to bowl)
        setTimeout(() => playVoice(store.petType), 800);
        showMsg('🍖 Yum!');
        break;
    }
  }, [store.petType]);

  const handlePlay = useCallback(() => {
    playSound('tap');
    const result = store.play();
    switch (result) {
      case 'sleeping': showMsg('💤 Shhh... sleeping'); break;
      case 'tired': showMsg('😩 Too tired to play...'); break;
      case 'cooldown': showMsg('Wait a moment...'); break;
      case 'happy': showMsg('Already happy! 😊'); break;
      case 'ok':
        setIsPlaying(true);
        setShowHearts(true);
        playVoice(store.petType);
        // Play a second bark/meow during the chase
        setTimeout(() => playVoice(store.petType), 1200);
        showMsg('🎾 Yay!');
        break;
    }
  }, [store.petType]);

  const handleClean = useCallback(() => {
    playSound('tap');
    const result = store.clean();
    switch (result) {
      case 'sleeping': showMsg('💤 Shhh... sleeping'); break;
      case 'clean': showMsg('Already clean! ✨'); break;
      case 'cooldown': showMsg('Wait a moment...'); break;
      case 'ok':
        playSound('clean');
        showMsg('✨ Squeaky clean!');
        break;
    }
  }, []);

  const handleMedicine = useCallback(() => {
    playSound('tap');
    const result = store.giveMedicine();
    switch (result) {
      case 'not_sick': showMsg('Not sick!'); break;
      case 'cooldown': showMsg('Wait a moment...'); break;
      case 'ok':
        showMsg('💊 Feeling better!');
        playVoice(store.petType);
        break;
    }
  }, [store.petType]);

  return (
    <View style={styles.container}>
      {/* Background */}
      <Room isDayTime={isDayTime} isSleeping={store.isSleeping} />

      <SafeAreaView style={styles.safe}>
        {/* HUD */}
        <HUD store={store} />

        {/* Living Area */}
        <View style={styles.livingArea}>
          {/* Food Bowl */}
          <FoodBowl isFeeding={isFeeding} />

          {/* Toy */}
          <Toy petType={store.petType} isPlaying={isPlaying} />

          {/* Pet */}
          <Pet
            petType={store.petType}
            isSleeping={store.isSleeping}
            isSick={store.isSick}
            hunger={store.hunger}
            happiness={store.happiness}
            energy={store.energy}
            isFeeding={isFeeding}
            isPlaying={isPlaying}
            showHearts={showHearts}
            onWalkComplete={handleActionComplete}
            petX={petX} petY={petY}
            petBounce={petBounce} petRotate={petRotate} petScaleY={petScaleY}
          />

          {/* Poop */}
          <PoopPiles count={store.poopCount} />

          {/* Critical stat vignette */}
          <Animated.View style={[styles.vignette, { opacity: vignetteOpacity }]} pointerEvents="none" />
        </View>

        {/* Message Toast */}
        {message !== '' && (
          <Animated.View style={[styles.msgToast, { opacity: msgFade }]}>
            <Text style={styles.msgText}>{message}</Text>
          </Animated.View>
        )}

        {/* Action Bar */}
        <ActionBar
          onFeed={handleFeed}
          onPlay={handlePlay}
          onClean={handleClean}
          onMedicine={handleMedicine}
          isSick={store.isSick}
          isSleeping={store.isSleeping}
          canPlay={store.energy >= THRESHOLDS.playMinEnergy}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  safe: { flex: 1, zIndex: 2 },
  livingArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject, zIndex: 14,
    borderWidth: 35, borderColor: 'rgba(220, 40, 40, 0.18)',
    backgroundColor: 'transparent',
  },
  msgToast: {
    position: 'absolute', top: '20%', alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 22, paddingVertical: 9,
    borderRadius: 18, zIndex: 100,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  msgText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
});
