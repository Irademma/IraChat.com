import { useAudioPlayer } from "expo-audio";
import { useState } from "react";
import { Text, TouchableOpacity } from "react-native";

export default function AudioPlayer({ uri }: { uri: string }) {
  const player = useAudioPlayer(uri);
  const [isPlaying, setIsPlaying] = useState(false);

  async function handlePlayPause() {
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePlayPause}
      className="bg-blue-100 p-2 rounded"
    >
      <Text>{isPlaying ? "Pause" : "Play"} Audio</Text>
    </TouchableOpacity>
  );
}
