// Audio Service - Handles call sounds and ringtones
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class AudioService {
  private ringtoneSound: Audio.Sound | null = null;
  private incomingCallSound: Audio.Sound | null = null;
  private callConnectSound: Audio.Sound | null = null;
  private callEndSound: Audio.Sound | null = null;
  private isInitialized = false;

  /**
   * Initialize audio service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔊 Initializing audio service...');

      // Set audio mode for calls
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      // Preload audio files
      await this.preloadSounds();

      this.isInitialized = true;
      console.log('✅ Audio service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize audio service:', error);
    }
  }

  /**
   * Preload all sound files
   */
  private async preloadSounds(): Promise<void> {
    try {
      // For now, we'll use system sounds as fallback since MP3 files don't exist
      console.log('🔊 Using system sounds for calling (MP3 files not provided)');

      // Set all sounds to null to use system fallbacks
      this.ringtoneSound = null;
      this.incomingCallSound = null;
      this.callConnectSound = null;
      this.callEndSound = null;

      console.log('🔊 Audio service ready with system sounds');
    } catch (error) {
      console.error('❌ Failed to preload sounds:', error);
    }
  }

  /**
   * Play ringtone for outgoing calls
   */
  async playRingtone(): Promise<void> {
    try {
      if (this.ringtoneSound) {
        await this.ringtoneSound.replayAsync();
        console.log('🔊 Playing ringtone');
      } else {
        // Use system ringtone as fallback
        await this.playSystemRingtone();
      }
    } catch (error) {
      console.error('❌ Failed to play ringtone:', error);
    }
  }

  /**
   * Stop ringtone
   */
  async stopRingtone(): Promise<void> {
    try {
      if (this.ringtoneSound) {
        await this.ringtoneSound.stopAsync();
        console.log('🔇 Stopped ringtone');
      }
    } catch (error) {
      console.error('❌ Failed to stop ringtone:', error);
    }
  }

  /**
   * Play incoming call sound
   */
  async playIncomingCallSound(): Promise<void> {
    try {
      if (this.incomingCallSound) {
        await this.incomingCallSound.replayAsync();
        console.log('🔊 Playing incoming call sound');
      } else {
        // Use system ringtone as fallback
        await this.playSystemRingtone();
      }
    } catch (error) {
      console.error('❌ Failed to play incoming call sound:', error);
    }
  }

  /**
   * Stop incoming call sound
   */
  async stopIncomingCallSound(): Promise<void> {
    try {
      if (this.incomingCallSound) {
        await this.incomingCallSound.stopAsync();
        console.log('🔇 Stopped incoming call sound');
      }
    } catch (error) {
      console.error('❌ Failed to stop incoming call sound:', error);
    }
  }

  /**
   * Play call connect sound
   */
  async playCallConnectSound(): Promise<void> {
    try {
      if (this.callConnectSound) {
        await this.callConnectSound.replayAsync();
        console.log('🔊 Playing call connect sound');
      }
    } catch (error) {
      console.error('❌ Failed to play call connect sound:', error);
    }
  }

  /**
   * Play call end sound
   */
  async playCallEndSound(): Promise<void> {
    try {
      // Use system sound or create a simple beep
      console.log('🔊 Playing call end sound');
      
      // For now, we'll use a simple vibration as feedback
      const { Vibration } = await import('react-native');
      Vibration.vibrate([100, 50, 100]);
    } catch (error) {
      console.error('❌ Failed to play call end sound:', error);
    }
  }

  /**
   * Play system ringtone (fallback)
   */
  private async playSystemRingtone(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        // Use iOS system sound
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'system://ringtone_default' },
          { shouldPlay: true, isLooping: true, volume: 0.8 }
        );
        this.ringtoneSound = sound;
      } else {
        // Use Android system ringtone
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'android.resource://android/R.raw.ringtone' },
          { shouldPlay: true, isLooping: true, volume: 0.8 }
        );
        this.ringtoneSound = sound;
      }
      console.log('🔊 Playing system ringtone');
    } catch (error) {
      console.error('❌ Failed to play system ringtone:', error);
    }
  }

  /**
   * Set audio mode for calls
   */
  async setCallAudioMode(isSpeakerOn: boolean = false): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: !isSpeakerOn,
        staysActiveInBackground: true,
      });
      console.log(`🔊 Audio mode set: ${isSpeakerOn ? 'Speaker' : 'Earpiece'}`);
    } catch (error) {
      console.error('❌ Failed to set audio mode:', error);
    }
  }

  /**
   * Set audio mode for normal app usage
   */
  async setNormalAudioMode(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      console.log('🔊 Audio mode set to normal');
    } catch (error) {
      console.error('❌ Failed to set normal audio mode:', error);
    }
  }

  /**
   * Stop all sounds
   */
  async stopAllSounds(): Promise<void> {
    try {
      await this.stopRingtone();
      await this.stopIncomingCallSound();
      console.log('🔇 All sounds stopped');
    } catch (error) {
      console.error('❌ Failed to stop all sounds:', error);
    }
  }

  /**
   * Cleanup audio resources
   */
  async cleanup(): Promise<void> {
    try {
      await this.stopAllSounds();

      if (this.ringtoneSound) {
        await this.ringtoneSound.unloadAsync();
        this.ringtoneSound = null;
      }

      if (this.incomingCallSound) {
        await this.incomingCallSound.unloadAsync();
        this.incomingCallSound = null;
      }

      if (this.callConnectSound) {
        await this.callConnectSound.unloadAsync();
        this.callConnectSound = null;
      }

      await this.setNormalAudioMode();
      this.isInitialized = false;
      console.log('🔇 Audio service cleaned up');
    } catch (error) {
      console.error('❌ Failed to cleanup audio service:', error);
    }
  }

  /**
   * Check if audio service is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const audioService = new AudioService();
export default audioService;
