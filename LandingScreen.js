import React, { useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import { ImageBackground } from 'react-native';
import { COLORS } from '../constants';

const { width, height } = Dimensions.get('window');
const PAWS = ['🐾', '🐾', '🐾', '🐾', '🐾', '🐾', '🐾', '🐾'];

// ─── Floating Paw Print ─────────────────────────────────────
function FloatingPaw({ delay, startX, startY, size }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1, duration: 6000 + Math.random() * 3000, delay,
        easing: Easing.linear, useNativeDriver: true,
      }).start(loop);
    };
    loop();
  }, []);

  return (
    <Animated.Text
      pointerEvents="none"
      style={{
        position: 'absolute', left: startX, top: startY,
        fontSize: size, color: 'rgba(255,255,255,0.12)',
        opacity: anim.interpolate({ inputRange: [0, 0.2, 0.7, 1], outputRange: [0, 0.15, 0.08, 0] }),
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -height * 0.25] }) },
          { translateX: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 15 * (Math.random() > 0.5 ? 1 : -1), 0] }) },
          { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${(Math.random() - 0.5) * 40}deg`] }) },
          { scale: anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.6, 1, 0.7] }) },
        ],
      }}
    >🐾</Animated.Text>
  );
}

// ─── Pet Card with Avatar Bobbing ───────────────────────────
function PetCard({ name, desc, traits, emoji, spriteSource, onAdopt, delay: d, accentColor }) {
  const cardScale = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const avatarBob = useRef(new Animated.Value(0)).current;
  const pulseBtn  = useRef(new Animated.Value(1)).current;
  const glowRing  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Card entrance
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, delay: d, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(cardSlide, { toValue: 0, delay: d, duration: 600, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
    ]).start();

    // Avatar bobbing
    Animated.loop(
      Animated.sequence([
        Animated.timing(avatarBob, { toValue: -6, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(avatarBob, { toValue: 6, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Button pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseBtn, { toValue: 1.06, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseBtn, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Ring glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowRing, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowRing, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.card, {
      transform: [{ scale: cardScale }, { translateY: cardSlide }],
    }]}>
      {/* Glowing avatar ring */}
      <Animated.View style={[styles.avatarRing, {
        borderColor: accentColor,
        shadowColor: accentColor,
        shadowOpacity: glowRing.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] }),
        shadowRadius: glowRing.interpolate({ inputRange: [0, 1], outputRange: [4, 14] }),
      }]}>
        <Animated.View style={[styles.avatarInner, {
          transform: [{ translateY: avatarBob }],
        }]}>
          <Image source={spriteSource} style={styles.avatarImg} />
        </Animated.View>
      </Animated.View>

      <Text style={styles.petName}>{name}</Text>

      {/* Personality traits */}
      <View style={styles.traitsRow}>
        {traits.map((trait, i) => (
          <View key={i} style={[styles.traitBadge, { backgroundColor: `${accentColor}18` }]}>
            <Text style={[styles.traitText, { color: accentColor }]}>{trait}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.petDesc}>{desc}</Text>

      <TouchableOpacity onPress={onAdopt} activeOpacity={0.8} style={{ width: '100%' }}>
        <Animated.View style={[styles.adoptBtn, {
          backgroundColor: accentColor,
          transform: [{ scale: pulseBtn }],
        }]}>
          <Text style={styles.adoptLabel}>ADOPT {emoji}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Landing Screen ─────────────────────────────────────
export default function LandingScreen({ onAdopt }) {
  const titleFade  = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(-20)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(15)).current;
  const dividerWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered title entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(titleSlide, { toValue: 0, duration: 600, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(dividerWidth, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(taglineFade, { toValue: 1, duration: 500, delay: 100, useNativeDriver: true }),
        Animated.timing(taglineSlide, { toValue: 0, duration: 500, delay: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/landing_bg.png')} style={styles.bg} resizeMode="cover">
        {/* Floating paw prints */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {PAWS.map((_, i) => (
            <FloatingPaw
              key={i}
              delay={i * 800}
              startX={Math.random() * width * 0.85}
              startY={height * 0.3 + Math.random() * height * 0.5}
              size={18 + Math.random() * 14}
            />
          ))}
        </View>

        <View style={styles.overlay}>
          {/* Title Block */}
          <Animated.View style={{
            opacity: titleFade,
            transform: [{ translateY: titleSlide }],
            alignItems: 'center',
          }}>
            <Text style={styles.pawIcon}>🐾</Text>
            <Text style={styles.title}>POCKET{'\n'}PAWS</Text>
          </Animated.View>

          {/* Animated divider line */}
          <Animated.View style={[styles.divider, {
            width: dividerWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '40%'] }),
          }]} />

          {/* Tagline */}
          <Animated.Text style={[styles.tagline, {
            opacity: taglineFade,
            transform: [{ translateY: taglineSlide }],
          }]}>
            Choose your companion
          </Animated.Text>

          {/* Pet Cards */}
          <View style={styles.cardsRow}>
            <PetCard
              name="Snowbell"
              desc="A fluffy white Persian cat who loves yarn and long afternoon naps."
              traits={['Elegant', 'Playful']}
              emoji="🐱"
              spriteSource={require('../assets/sprites/cat_happy.png')}
              onAdopt={() => onAdopt('cat')}
              delay={400}
              accentColor="#7c5cbf"
            />
            <PetCard
              name="Milo"
              desc="A bouncy Jack Russell who lives for tennis balls, belly rubs, and treats."
              traits={['Energetic', 'Loyal']}
              emoji="🐕"
              spriteSource={require('../assets/sprites/dog_happy.png')}
              onAdopt={() => onAdopt('dog')}
              delay={600}
              accentColor={COLORS.accent}
            />
          </View>

          {/* Footer hint */}
          <Animated.Text style={[styles.footer, { opacity: taglineFade }]}>
            Your pet needs love, food, and care to survive!
          </Animated.Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0a2e' },
  bg: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14,
  },
  pawIcon: { fontSize: 36, marginBottom: 4 },
  title: {
    fontSize: 46, fontWeight: '900', color: '#fff', letterSpacing: 6,
    textAlign: 'center', lineHeight: 52,
    textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 15,
  },
  divider: {
    height: 2, borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginVertical: 12,
  },
  tagline: {
    fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: '600', letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
    marginBottom: 24,
  },
  cardsRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', width: '100%' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)', width: width * 0.42,
    padding: 14, borderRadius: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 10,
  },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  avatarInner: {
    width: 78, height: 78, borderRadius: 39, backgroundColor: '#f8f9fa',
    overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
  },
  avatarImg: { width: 64, height: 64, resizeMode: 'contain' },
  petName: { fontSize: 19, fontWeight: '800', color: '#2d3436', marginBottom: 4, letterSpacing: 0.5 },
  traitsRow: { flexDirection: 'row', gap: 5, marginBottom: 6 },
  traitBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  traitText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  petDesc: { fontSize: 10, color: '#636e72', textAlign: 'center', marginBottom: 12, lineHeight: 14 },
  adoptBtn: {
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 18,
    width: '100%', alignItems: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8,
  },
  adoptLabel: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  footer: {
    marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.45)',
    fontStyle: 'italic', letterSpacing: 0.5,
  },
});
