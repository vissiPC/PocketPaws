import { useCallback } from 'react';
import { useAudioPlayer } from 'expo-audio';

/**
 * Safe audio hook wrapper for PocketPaws.
 * Each sound is loaded once via useAudioPlayer. Playback errors
 * are silently caught — audio must never crash the app.
 */
export function useGameAudio() {
  const barkPlayer  = useAudioPlayer(require('../assets/sounds/bark.wav'));
  const meowPlayer  = useAudioPlayer(require('../assets/sounds/meow.wav'));
  const eatPlayer   = useAudioPlayer(require('../assets/sounds/eat.wav'));
  const tapPlayer   = useAudioPlayer(require('../assets/sounds/tap.wav'));
  const cleanPlayer = useAudioPlayer(require('../assets/sounds/clean.wav'));

  // Set volumes high for all players
  try {
    if (barkPlayer)  barkPlayer.volume = 1.0;
    if (meowPlayer)  meowPlayer.volume = 1.0;
    if (eatPlayer)   eatPlayer.volume = 0.8;
    if (tapPlayer)   tapPlayer.volume = 0.6;
    if (cleanPlayer) cleanPlayer.volume = 0.8;
  } catch (e) {
    // Silent
  }

  const play = useCallback((soundName) => {
    try {
      const map = {
        bark: barkPlayer,
        meow: meowPlayer,
        eat: eatPlayer,
        tap: tapPlayer,
        clean: cleanPlayer,
      };
      const player = map[soundName];
      if (player) {
        player.seekTo(0);
        player.play();
      }
    } catch (e) {
      // Silent — never crash for audio
    }
  }, [barkPlayer, meowPlayer, eatPlayer, tapPlayer, cleanPlayer]);

  const playVoice = useCallback((petType) => {
    play(petType === 'dog' ? 'bark' : 'meow');
  }, [play]);

  return { play, playVoice };
}
