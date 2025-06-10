import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

export default function AudioPlayer({ uri }: { uri: string }) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  async function handlePlayPause() {
    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      await newSound.playAsync();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  }

  return (
    <TouchableOpacity onPress={handlePlayPause} className="bg-blue-100 p-2 rounded">
      <Text>{isPlaying ? 'Pause' : 'Play'} Audio</Text>
    </TouchableOpacity>
  );
}