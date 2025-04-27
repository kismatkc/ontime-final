import { Volume2, Turtle } from "lucide-react-native";
import { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTranslator } from "~/lib/use-translator";
import { Audio } from "expo-av";

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
  const { soundBase64, fetchSound, translation } = useTranslator();
  const soundRef = useRef<Audio.Sound | null>(null);
  const isMounted = useRef(true);
  const lastPlayedSpeedRef = useRef<number | null>(null);
  const lastTextRef = useRef<string>("");
  const soundCache = useRef<{ fast: string | null; slow: string | null }>({
    fast: null,
    slow: null,
  });

  // Reset cache when text changes
  useEffect(() => {
    if (text !== lastTextRef.current) {
      console.log("Text changed, resetting cache");
      soundCache.current = { fast: null, slow: null };
      lastTextRef.current = text;

      // Also reset audio if playing
      if (isPlayingFast || isPlayingSlow) {
        resetAudio();
      }
    }
  }, [text, targetLanguage]);

  // Set up component mount/unmount tracking
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      // Clean up sound when component unmounts
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  // Monitor soundBase64 changes and update cache
  useEffect(() => {
    if (soundBase64 && lastPlayedSpeedRef.current !== null) {
      // Cache the sound data
      if (lastPlayedSpeedRef.current === 1) {
        soundCache.current.fast = soundBase64;
      } else {
        soundCache.current.slow = soundBase64;
      }

      // Play the sound immediately
      playSound(soundBase64, lastPlayedSpeedRef.current);
    }
  }, [soundBase64]);

  // Reset audio playback
  const resetAudio = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      } catch (error) {
        console.error("Error resetting audio:", error);
      }
    }
    setIsPlayingFast(false);
    setIsPlayingSlow(false);
  };

  // Play audio with given speed
  async function playSound(soundData: any, speed: number) {
    try {
      setError(null);
      if (speed === 1) {
        setIsPlayingFast(true);
        setIsPlayingSlow(false);
      } else {
        setIsPlayingSlow(true);
        setIsPlayingFast(false);
      }

      // Create a new sound object
      const newSound = new Audio.Sound();
      soundRef.current = newSound;

      // Load the audio from base64
      await newSound.loadAsync({
        uri: `data:audio/mp3;base64,${soundData}`,
      });

      // Set up completion callback
      newSound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish && isMounted.current) {
          if (speed === 1) {
            setIsPlayingFast(false);
          } else {
            setIsPlayingSlow(false);
          }
        }
      });

      // Play the sound
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
      await newSound.playAsync();
    } catch (error: any) {
      console.error("Error playing sound:", error);
      setError(error.message || "Error playing sound");
      setIsPlayingFast(false);
      setIsPlayingSlow(false);
    }
  }

  const handlePress = async (speed: number) => {
    // If this speed is already playing, stop and reset
    if ((speed === 1 && isPlayingFast) || (speed === 0.5 && isPlayingSlow)) {
      await resetAudio();
      return;
    }

    // If the other speed is playing, stop it first
    if (isPlayingFast || isPlayingSlow) {
      await resetAudio();
    }

    // Check if we have cached sound data for this speed
    const cachedSound =
      speed === 1 ? soundCache.current.fast : soundCache.current.slow;

    if (cachedSound) {
      // Play directly from cache
      playSound(cachedSound, speed);
    } else {
      try {
        console.log("Fetching audio for", text, targetLanguage, speed);

        // Set temporary loading state
        if (speed === 0.5) {
          setIsPlayingSlow(true);
        } else {
          setIsPlayingFast(true);
        }

        // Remember which speed we're fetching
        lastPlayedSpeedRef.current = speed;

        // Fetch sound data - sound will be played via the useEffect when soundBase64 updates
        await fetchSound(text, speed, targetLanguage);
      } catch (error: any) {
        console.error("Error fetching sound:", error);
        setError("Failed to fetch audio");
        setIsPlayingFast(false);
        setIsPlayingSlow(false);
      }
    }
  };

  return (
    <View className={`flex flex-row justify-between items-center gap-x-2`}>
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
