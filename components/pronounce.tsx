import { Volume2, Turtle } from "lucide-react-native";
import { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTranslator } from "~/lib/use-translator";
import RNFS from "react-native-fs";
import { useTrackStore } from "~/hooks/useTrackStore";

const Pronounce = ({
  text,
  targetLanguage,
}: {
  text: string;
  targetLanguage: string;
}) => {
  const [isPlayingFast, setIsPlayingFast] = useState<boolean>(false);
  const [isPlayingSlow, setIsPlayingSlow] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { soundBase64, fetchSound } = useTranslator();
  const lastPlayedSpeedRef = useRef<number | null>(null);
  const lastTextRef = useRef<string>("");
  const soundCache = useRef<{ fast: string | null; slow: string | null }>({
    fast: null,
    slow: null,
  });
  const filePathsRef = useRef<string[]>([]);

  // Get track player methods from the store
  const trackPlayer = useTrackStore();

  // Setup track player on component mount
  useEffect(() => {
    const setupPlayer = async () => {
      await trackPlayer.setup();
    };

    setupPlayer();

    return () => {
      // Clean up any temporary files on unmount
      filePathsRef.current.forEach((filePath) => {
        RNFS.unlink(filePath).catch((err) =>
          console.error("Error deleting file:", err)
        );
      });

      // Stop playback on unmount
      trackPlayer.clearQueue();
    };
  }, []);

  // Reset cache and stop playback when text changes
  useEffect(() => {
    if (text !== lastTextRef.current) {
      // Delete old temporary files
      filePathsRef.current.forEach((filePath) => {
        RNFS.unlink(filePath).catch((err) =>
          console.error("Error deleting file:", err)
        );
      });
      filePathsRef.current = [];
      soundCache.current = { fast: null, slow: null };
      lastTextRef.current = text;

      // Stop playback if active
      if (isPlayingFast || isPlayingSlow) {
        trackPlayer.clearQueue();
        setIsPlayingFast(false);
        setIsPlayingSlow(false);
      }
    }
  }, [text, targetLanguage]);

  // Handle new soundBase64 data
  useEffect(() => {
    if (soundBase64 && lastPlayedSpeedRef.current !== null) {
      processSoundData();
    }

    async function processSoundData() {
      try {
        if (!soundBase64 || lastPlayedSpeedRef.current === null) return;

        const speed = lastPlayedSpeedRef.current;
        const speedLabel = speed === 1 ? "fast" : "slow";
        const trackId = `pronunciation-${speedLabel}-${Date.now()}`;
        const trackTitle = `Pronunciation (${speed === 1 ? "Fast" : "Slow"})`;

        // Play the track using the store's method
        const filePath = await trackPlayer.playTrackFromBase64(
          soundBase64,
          trackId,
          trackTitle
        );

        // Store the file path for cleanup
        filePathsRef.current.push(filePath);

        // Update the cache
        if (speed === 1) {
          soundCache.current.fast = filePath;
        } else {
          soundCache.current.slow = filePath;
        }

        // Update UI state
        setError(null);
        setIsPlayingFast(speed === 1);
        setIsPlayingSlow(speed === 0.5);

        // Add a listener for playback completion
        const checkPlaybackCompletion = setInterval(async () => {
          const state = await trackPlayer.getCurrentState();
          if (state !== "playing") {
            setIsPlayingFast(false);
            setIsPlayingSlow(false);
            clearInterval(checkPlaybackCompletion);
          }
        }, 500);
      } catch (err: any) {
        console.error("Error processing sound data:", err);
        setError(err.message || "Error playing sound");
        setIsPlayingFast(false);
        setIsPlayingSlow(false);
      }
    }
  }, [soundBase64]);

  // Handle button presses
  const handlePress = async (speed: number) => {
    try {
      // If the same speed is playing, stop it
      if ((speed === 1 && isPlayingFast) || (speed === 0.5 && isPlayingSlow)) {
        await trackPlayer.clearQueue();
        setIsPlayingFast(false);
        setIsPlayingSlow(false);
        return;
      }

      // If any speed is playing, stop it first
      if (isPlayingFast || isPlayingSlow) {
        await trackPlayer.clearQueue();
        setIsPlayingFast(false);
        setIsPlayingSlow(false);
      }

      // Check if we have a cached version
      const cachedFilePath =
        speed === 1 ? soundCache.current.fast : soundCache.current.slow;

      if (cachedFilePath) {
        // Read the file and play it
        try {
          const base64Data = await RNFS.readFile(cachedFilePath, "base64");
          const speedLabel = speed === 1 ? "fast" : "slow";
          const trackId = `pronunciation-${speedLabel}-${Date.now()}`;
          const trackTitle = `Pronunciation (${speed === 1 ? "Fast" : "Slow"})`;

          await trackPlayer.playTrackFromBase64(
            base64Data,
            trackId,
            trackTitle
          );

          setIsPlayingFast(speed === 1);
          setIsPlayingSlow(speed === 0.5);
          setError(null);
        } catch (err: any) {
          console.error("Error playing cached file:", err);
          setError(err.message || "Error playing cached sound");

          // If there was an error playing the cached file, remove it from cache
          if (speed === 1) {
            soundCache.current.fast = null;
          } else {
            soundCache.current.slow = null;
          }

          // Try fetching a new sound instead
          lastPlayedSpeedRef.current = speed;
          await fetchSound(text, speed, targetLanguage);
        }
      } else {
        // No cached version, fetch new sound
        lastPlayedSpeedRef.current = speed;
        setError(null);

        // Show loading state while we fetch the sound
        setIsPlayingFast(speed === 1);
        setIsPlayingSlow(speed === 0.5);

        await fetchSound(text, speed, targetLanguage);
      }
    } catch (err: any) {
      console.error("Error in handlePress:", err);
      setError(err.message || "Error playing sound");
      setIsPlayingFast(false);
      setIsPlayingSlow(false);
    }
  };

  return (
    <View className="flex flex-row justify-between items-center gap-x-2">
      <TouchableOpacity onPress={() => handlePress(1)}>
        <Volume2 color={isPlayingFast ? "green" : "grey"} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePress(0.5)}>
        <Turtle color={isPlayingSlow ? "green" : "grey"} />
      </TouchableOpacity>
      {error && <Text style={{ color: "red", fontSize: 10 }}>{error}</Text>}
    </View>
  );
};

export default Pronounce;
