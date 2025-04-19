// // // // import { Volume2, Turtle } from "lucide-react-native";
// // // // import { useEffect, useState, useRef } from "react";
// // // // import { View, Text, TouchableOpacity } from "react-native";
// // // // import { useTranslator } from "~/lib/use-translator";
// // // // import { Audio } from "expo-av";

// // // // // Define the cache structure for better typing
// // // // interface AudioCacheItem {
// // // //   fast: string | null;
// // // //   slow: string | null;
// // // // }

// // // // interface AudioCache {
// // // //   [key: string]: AudioCacheItem;
// // // // }

// // // // const Pronounce = ({
// // // //   text,
// // // //   targetLanguage,
// // // // }: {
// // // //   text: string;
// // // //   targetLanguage: string;
// // // // }) => {
// // // //   const [isPlayingFast, setIsPlayingFast] = useState<boolean>(false);
// // // //   const [isPlayingSlow, setIsPlayingSlow] = useState<boolean>(false);
// // // //   const [error, setError] = useState<string | null>(null);
// // // //   const { soundBase64, fetchSound, translation } = useTranslator();
// // // //   const soundRef = useRef<Audio.Sound | null>(null);
// // // //   const isMounted = useRef(true);
// // // //   const lastFetchedSpeedRef = useRef<number | null>(null);

// // // //   // Create a persistent cache that stores audio data for each text+language combination
// // // //   const audioCache = useRef<AudioCache>({});

// // // //   // Generate a cache key using the text and language
// // // //   const getCacheKey = (textValue: string, lang: string) =>
// // // //     `${lang}:${textValue}`;
// // // //   const currentCacheKey = getCacheKey(text, targetLanguage);

// // // //   // Set up component mount/unmount tracking
// // // //   useEffect(() => {
// // // //     isMounted.current = true;

// // // //     // Initialize cache entry for this text/language if it doesn't exist
// // // //     if (!audioCache.current[currentCacheKey]) {
// // // //       audioCache.current[currentCacheKey] = {
// // // //         fast: null,
// // // //         slow: null,
// // // //       };
// // // //     }

// // // //     return () => {
// // // //       isMounted.current = false;
// // // //       // Clean up sound when component unmounts
// // // //       if (soundRef.current) {
// // // //         soundRef.current.unloadAsync();
// // // //         soundRef.current = null;
// // // //       }
// // // //     };
// // // //   }, [currentCacheKey]);

// // // //   // Update cache when soundBase64 changes
// // // //   useEffect(() => {
// // // //     if (soundBase64 && lastFetchedSpeedRef.current !== null) {
// // // //       // Ensure cache entry exists
// // // //       if (!audioCache.current[currentCacheKey]) {
// // // //         audioCache.current[currentCacheKey] = {
// // // //           fast: null,
// // // //           slow: null,
// // // //         };
// // // //       }

// // // //       // Store in the right speed slot
// // // //       if (lastFetchedSpeedRef.current === 1) {
// // // //         audioCache.current[currentCacheKey].fast = soundBase64;
// // // //       } else {
// // // //         audioCache.current[currentCacheKey].slow = soundBase64;
// // // //       }
// // // //     }
// // // //   }, [soundBase64, currentCacheKey]);

// // // //   // Reset audio playback
// // // //   const resetAudio = async () => {
// // // //     if (soundRef.current) {
// // // //       try {
// // // //         await soundRef.current.stopAsync();
// // // //         await soundRef.current.unloadAsync();
// // // //         soundRef.current = null;
// // // //       } catch (error) {
// // // //         console.error("Error resetting audio:", error);
// // // //       }
// // // //     }
// // // //     setIsPlayingFast(false);
// // // //     setIsPlayingSlow(false);
// // // //   };

// // // //   // Play audio from cache with given speed
// // // //   async function playSound(speed: number) {
// // // //     await resetAudio();

// // // //     // Get cached data for this text/language
// // // //     const cacheEntry = audioCache.current[currentCacheKey];
// // // //     if (!cacheEntry) {
// // // //       setError("Cache missing for this text");
// // // //       return;
// // // //     }

// // // //     // Get the appropriate audio data based on speed
// // // //     const audioData = speed === 1 ? cacheEntry.fast : cacheEntry.slow;

// // // //     if (!audioData) {
// // // //       setError("No audio data available");
// // // //       return;
// // // //     }

// // // //     try {
// // // //       setError(null);
// // // //       if (speed === 1) {
// // // //         setIsPlayingFast(true);
// // // //       } else {
// // // //         setIsPlayingSlow(true);
// // // //       }

// // // //       // Create a new sound object
// // // //       const newSound = new Audio.Sound();
// // // //       soundRef.current = newSound;

// // // //       // Load the audio from base64
// // // //       await newSound.loadAsync({
// // // //         uri: `data:audio/mp3;base64,${audioData}`,
// // // //       });

// // // //       // Set up completion callback
// // // //       newSound.setOnPlaybackStatusUpdate((status) => {
// // // //         if (status.didJustFinish && isMounted.current) {
// // // //           if (speed === 1) {
// // // //             setIsPlayingFast(false);
// // // //           } else {
// // // //             setIsPlayingSlow(false);
// // // //           }
// // // //         }
// // // //       });

// // // //       // Play the sound
// // // //       await newSound.playAsync();
// // // //     } catch (error) {
// // // //       console.error("Error playing sound:", error);
// // // //       //@ts-ignore
// // // //       setError(error.message || "Error playing sound");
// // // //       setIsPlayingFast(false);
// // // //       setIsPlayingSlow(false);
// // // //     }
// // // //   }

// // // //   const handlePress = async (speed: number) => {
// // // //     // If this speed is already playing, stop and reset
// // // //     if ((speed === 1 && isPlayingFast) || (speed === 0.5 && isPlayingSlow)) {
// // // //       await resetAudio();
// // // //       return;
// // // //     }

// // // //     // If the other speed is playing, stop it first
// // // //     if (isPlayingFast || isPlayingSlow) {
// // // //       await resetAudio();
// // // //     }

// // // //     // Ensure cache entry exists for this text/language
// // // //     if (!audioCache.current[currentCacheKey]) {
// // // //       audioCache.current[currentCacheKey] = {
// // // //         fast: null,
// // // //         slow: null,
// // // //       };
// // // //     }

// // // //     // Check if we already have this audio in cache
// // // //     const cachedAudio =
// // // //       speed === 1
// // // //         ? audioCache.current[currentCacheKey].fast
// // // //         : audioCache.current[currentCacheKey].slow;

// // // //     if (cachedAudio) {
// // // //       console.log("Playing from cache for", text, targetLanguage, speed);
// // // //       // Play from cache if available
// // // //       playSound(speed);
// // // //     } else {
// // // //       try {
// // // //         console.log("Fetching audio for", text, targetLanguage, speed);
// // // //         // Set which speed we're fetching
// // // //         lastFetchedSpeedRef.current = speed;

// // // //         // Fetch sound data
// // // //         await fetchSound(text, speed);

// // // //         // Play if data was fetched (soundBase64 should be updated via useEffect)
// // // //         if (soundBase64) {
// // // //           // Update cache immediately for this playback
// // // //           if (speed === 1) {
// // // //             audioCache.current[currentCacheKey].fast = soundBase64;
// // // //           } else {
// // // //             audioCache.current[currentCacheKey].slow = soundBase64;
// // // //           }

// // // //           playSound(speed);
// // // //         }
// // // //       } catch (error) {
// // // //         console.error("Error fetching sound:", error);
// // // //         setError("Failed to fetch audio");
// // // //         setIsPlayingFast(false);
// // // //         setIsPlayingSlow(false);
// // // //       }
// // // //     }
// // // //   };

// // // //   return (
// // // //     <View className="flex flex-row justify-between items-center gap-x-2">
// // // //       <TouchableOpacity onPress={() => handlePress(1)}>
// // // //         <Volume2 color={isPlayingFast ? "green" : "grey"} />
// // // //       </TouchableOpacity>

// // // //       <TouchableOpacity onPress={() => handlePress(0.5)}>
// // // //         <Turtle color={isPlayingSlow ? "green" : "grey"} />
// // // //       </TouchableOpacity>
// // // //       {error && <Text style={{ color: "red", fontSize: 10 }}>{error}</Text>}
// // // //     </View>
// // // //   );
// // // // };

// // // // export default Pronounce;
// // // import { Volume2, Turtle } from "lucide-react-native";
// // // import { useEffect, useState, useRef } from "react";
// // // import { View, Text, TouchableOpacity } from "react-native";
// // // import { useTranslator } from "~/lib/use-translator";
// // // import { Audio } from "expo-av";

// // // const Pronounce = ({
// // //   text,
// // //   targetLanguage,
// // // }: {
// // //   text: string;
// // //   targetLanguage: string;
// // // }) => {
// // //   const [isPlayingFast, setIsPlayingFast] = useState<boolean>(false);
// // //   const [isPlayingSlow, setIsPlayingSlow] = useState<boolean>(false);
// // //   const [error, setError] = useState<string | null>(null);
// // //   const { soundBase64, fetchSound, translation } = useTranslator();
// // //   const soundRef = useRef<Audio.Sound | null>(null);
// // //   const isMounted = useRef(true);

// // //   // Set up component mount/unmount tracking
// // //   useEffect(() => {
// // //     isMounted.current = true;

// // //     return () => {
// // //       isMounted.current = false;
// // //       // Clean up sound when component unmounts
// // //       if (soundRef.current) {
// // //         soundRef.current.unloadAsync();
// // //         soundRef.current = null;
// // //       }
// // //     };
// // //   }, []);

// // //   // Reset audio playback
// // //   const resetAudio = async () => {
// // //     if (soundRef.current) {
// // //       try {
// // //         await soundRef.current.stopAsync();
// // //         await soundRef.current.unloadAsync();
// // //         soundRef.current = null;
// // //       } catch (error) {
// // //         console.error("Error resetting audio:", error);
// // //       }
// // //     }
// // //     setIsPlayingFast(false);
// // //     setIsPlayingSlow(false);
// // //   };

// // //   // Play audio with given speed
// // //   async function playSound(soundData: any, speed: number) {
// // //     try {
// // //       setError(null);
// // //       if (speed === 1) {
// // //         setIsPlayingFast(true);
// // //       } else {
// // //         setIsPlayingSlow(true);
// // //       }

// // //       // Create a new sound object
// // //       const newSound = new Audio.Sound();
// // //       soundRef.current = newSound;

// // //       // Load the audio from base64
// // //       await newSound.loadAsync({
// // //         uri: `data:audio/mp3;base64,${soundData}`,
// // //       });

// // //       // Set up completion callback
// // //       newSound.setOnPlaybackStatusUpdate((status: any) => {
// // //         if (status.didJustFinish && isMounted.current) {
// // //           if (speed === 1) {
// // //             setIsPlayingFast(false);
// // //           } else {
// // //             setIsPlayingSlow(false);
// // //           }
// // //         }
// // //       });

// // //       // Play the sound
// // //       await Audio.setAudioModeAsync({
// // //         playsInSilentModeIOS: true,
// // //       });
// // //       await newSound.playAsync();
// // //     } catch (error: any) {
// // //       console.error("Error playing sound:", error);
// // //       setError(error.message || "Error playing sound");
// // //       setIsPlayingFast(false);
// // //       setIsPlayingSlow(false);
// // //     }
// // //   }

// // //   const handlePress = async (speed: number) => {
// // //     // If this speed is already playing, stop and reset
// // //     if ((speed === 1 && isPlayingFast) || (speed === 0.5 && isPlayingSlow)) {
// // //       await resetAudio();
// // //       return;
// // //     }

// // //     // If the other speed is playing, stop it first
// // //     if (isPlayingFast || isPlayingSlow) {
// // //       await resetAudio();
// // //     }

// // //     try {
// // //       console.log("Fetching audio for", text, targetLanguage, speed);

// // //       // Fetch sound data
// // //       await fetchSound(text, speed, targetLanguage);

// // //       // Play if data was fetched
// // //       if (soundBase64) {
// // //         playSound(soundBase64, speed);
// // //       }
// // //     } catch (error: any) {
// // //       console.error("Error fetching sound:", error);
// // //       setError("Failed to fetch audio");
// // //       setIsPlayingFast(false);
// // //       setIsPlayingSlow(false);
// // //     }
// // //   };

// // //   return (
// // //     <View className="flex flex-row justify-between items-center gap-x-2">
// // //       <TouchableOpacity onPress={() => handlePress(1)}>
// // //         <Volume2 color={isPlayingFast ? "green" : "grey"} />
// // //       </TouchableOpacity>

// // //       <TouchableOpacity onPress={() => handlePress(0.5)}>
// // //         <Turtle color={isPlayingSlow ? "green" : "grey"} />
// // //       </TouchableOpacity>
// // //       {error && <Text style={{ color: "red", fontSize: 10 }}>{error}</Text>}
// // //     </View>
// // //   );
// // // };

// // // export default Pronounce;
// // import { Volume2, Turtle } from "lucide-react-native";
// // import { useEffect, useState, useRef } from "react";
// // import { View, Text, TouchableOpacity } from "react-native";
// // import { useTranslator } from "~/lib/use-translator";
// // import { Audio } from "expo-av";

// // const Pronounce = ({
// //   text,
// //   targetLanguage,
// // }: {
// //   text: string;
// //   targetLanguage: string;
// // }) => {
// //   const [isPlayingFast, setIsPlayingFast] = useState<boolean>(false);
// //   const [isPlayingSlow, setIsPlayingSlow] = useState<boolean>(false);
// //   const [error, setError] = useState<string | null>(null);
// //   const { soundBase64, fetchSound, translation } = useTranslator();
// //   const soundRef = useRef<Audio.Sound | null>(null);
// //   const isMounted = useRef(true);

// //   // Set up component mount/unmount tracking
// //   useEffect(() => {
// //     isMounted.current = true;

// //     return () => {
// //       isMounted.current = false;
// //       // Clean up sound when component unmounts
// //       if (soundRef.current) {
// //         soundRef.current.unloadAsync();
// //         soundRef.current = null;
// //       }
// //     };
// //   }, []);

// //   // Monitor soundBase64 changes and play when available
// //   useEffect(() => {
// //     const playPendingSound = async () => {
// //       if (soundBase64) {
// //         const speed = isPlayingSlow ? 0.5 : 1;
// //         playSound(soundBase64, speed);
// //       }
// //     };

// //     playPendingSound();
// //   }, [soundBase64]);

// //   // Reset audio playback
// //   const resetAudio = async () => {
// //     if (soundRef.current) {
// //       try {
// //         await soundRef.current.stopAsync();
// //         await soundRef.current.unloadAsync();
// //         soundRef.current = null;
// //       } catch (error) {
// //         console.error("Error resetting audio:", error);
// //       }
// //     }
// //     setIsPlayingFast(false);
// //     setIsPlayingSlow(false);
// //   };

// //   // Play audio with given speed
// //   async function playSound(soundData: any, speed: number) {
// //     try {
// //       setError(null);
// //       if (speed === 1) {
// //         setIsPlayingFast(true);
// //       } else {
// //         setIsPlayingSlow(true);
// //       }

// //       // Create a new sound object
// //       const newSound = new Audio.Sound();
// //       soundRef.current = newSound;

// //       // Load the audio from base64
// //       await newSound.loadAsync({
// //         uri: `data:audio/mp3;base64,${soundData}`,
// //       });

// //       // Set up completion callback
// //       newSound.setOnPlaybackStatusUpdate((status: any) => {
// //         if (status.didJustFinish && isMounted.current) {
// //           if (speed === 1) {
// //             setIsPlayingFast(false);
// //           } else {
// //             setIsPlayingSlow(false);
// //           }
// //         }
// //       });

// //       // Play the sound
// //       await Audio.setAudioModeAsync({
// //         playsInSilentModeIOS: true,
// //       });
// //       await newSound.playAsync();
// //     } catch (error: any) {
// //       console.error("Error playing sound:", error);
// //       setError(error.message || "Error playing sound");
// //       setIsPlayingFast(false);
// //       setIsPlayingSlow(false);
// //     }
// //   }

// //   const handlePress = async (speed: number) => {
// //     // If this speed is already playing, stop and reset
// //     if ((speed === 1 && isPlayingFast) || (speed === 0.5 && isPlayingSlow)) {
// //       await resetAudio();
// //       return;
// //     }

// //     // If the other speed is playing, stop it first
// //     if (isPlayingFast || isPlayingSlow) {
// //       await resetAudio();
// //     }

// //     try {
// //       console.log("Fetching audio for", text, targetLanguage, speed);

// //       // Set the appropriate flag based on speed
// //       if (speed === 0.5) {
// //         setIsPlayingSlow(true);
// //       } else {
// //         setIsPlayingFast(true);
// //       }

// //       // Fetch sound data - sound will be played via the useEffect when soundBase64 updates
// //       await fetchSound(text, speed, targetLanguage);
// //     } catch (error: any) {
// //       console.error("Error fetching sound:", error);
// //       setError("Failed to fetch audio");
// //       setIsPlayingFast(false);
// //       setIsPlayingSlow(false);
// //     }
// //   };

// //   return (
// //     <View className="flex flex-row justify-between items-center gap-x-2">
// //       <TouchableOpacity onPress={() => handlePress(1)}>
// //         <Volume2 color={isPlayingFast ? "green" : "grey"} />
// //       </TouchableOpacity>

// //       <TouchableOpacity onPress={() => handlePress(0.5)}>
// //         <Turtle color={isPlayingSlow ? "green" : "grey"} />
// //       </TouchableOpacity>
// //       {error && <Text style={{ color: "red", fontSize: 10 }}>{error}</Text>}
// //     </View>
// //   );
// // };

// // export default Pronounce;
// import { Volume2, Turtle } from "lucide-react-native";
// import { useEffect, useState, useRef } from "react";
// import { View, Text, TouchableOpacity } from "react-native";
// import { useTranslator } from "~/lib/use-translator";
// import { Audio } from "expo-av";

// const Pronounce = ({
//   text,
//   targetLanguage,
// }: {
//   text: string;
//   targetLanguage: string;
// }) => {
//   const [isPlayingFast, setIsPlayingFast] = useState<boolean>(false);
//   const [isPlayingSlow, setIsPlayingSlow] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const { soundBase64, fetchSound, translation } = useTranslator();
//   const soundRef = useRef<Audio.Sound | null>(null);
//   const isMounted = useRef(true);
//   const pendingPlaybackRef = useRef<{ speed: number; shouldPlay: boolean }>({
//     speed: 1,
//     shouldPlay: false,
//   });

//   // Set up component mount/unmount tracking
//   useEffect(() => {
//     isMounted.current = true;

//     return () => {
//       isMounted.current = false;
//       // Clean up sound when component unmounts
//       if (soundRef.current) {
//         soundRef.current.unloadAsync();
//         soundRef.current = null;
//       }
//     };
//   }, []);

//   // Monitor soundBase64 changes and play when available
//   useEffect(() => {
//     const playPendingSound = async () => {
//       if (soundBase64 && pendingPlaybackRef.current.shouldPlay) {
//         pendingPlaybackRef.current.shouldPlay = false;
//         playSound(soundBase64, pendingPlaybackRef.current.speed);
//       }
//     };

//     playPendingSound();
//   }, [soundBase64]);

//   // Reset audio playback
//   const resetAudio = async () => {
//     if (soundRef.current) {
//       try {
//         await soundRef.current.stopAsync();
//         await soundRef.current.unloadAsync();
//         soundRef.current = null;
//       } catch (error) {
//         console.error("Error resetting audio:", error);
//       }
//     }
//     setIsPlayingFast(false);
//     setIsPlayingSlow(false);
//     pendingPlaybackRef.current.shouldPlay = false;
//   };

//   // Play audio with given speed
//   async function playSound(soundData: any, speed: number) {
//     try {
//       setError(null);
//       if (speed === 1) {
//         setIsPlayingFast(true);
//         setIsPlayingSlow(false);
//       } else {
//         setIsPlayingSlow(true);
//         setIsPlayingFast(false);
//       }

//       // Create a new sound object
//       const newSound = new Audio.Sound();
//       soundRef.current = newSound;

//       // Load the audio from base64
//       await newSound.loadAsync({
//         uri: `data:audio/mp3;base64,${soundData}`,
//       });

//       // Set up completion callback
//       newSound.setOnPlaybackStatusUpdate((status: any) => {
//         if (status.didJustFinish && isMounted.current) {
//           if (speed === 1) {
//             setIsPlayingFast(false);
//           } else {
//             setIsPlayingSlow(false);
//           }
//         }
//       });

//       // Play the sound
//       await Audio.setAudioModeAsync({
//         playsInSilentModeIOS: true,
//       });
//       await newSound.playAsync();
//     } catch (error: any) {
//       console.error("Error playing sound:", error);
//       setError(error.message || "Error playing sound");
//       setIsPlayingFast(false);
//       setIsPlayingSlow(false);
//     }
//   }

//   const handlePress = async (speed: number) => {
//     // If this speed is already playing, stop and reset
//     if ((speed === 1 && isPlayingFast) || (speed === 0.5 && isPlayingSlow)) {
//       await resetAudio();
//       return;
//     }

//     // If the other speed is playing, stop it first
//     if (isPlayingFast || isPlayingSlow) {
//       await resetAudio();
//     }

//     try {
//       console.log("Fetching audio for", text, targetLanguage, speed);

//       // Set pending playback info
//       pendingPlaybackRef.current = { speed, shouldPlay: true };

//       // Set temporary loading state
//       if (speed === 0.5) {
//         setIsPlayingSlow(true);
//       } else {
//         setIsPlayingFast(true);
//       }

//       // Fetch sound data - sound will be played via the useEffect when soundBase64 updates
//       await fetchSound(text, speed, targetLanguage);

//       // If no sound is returned, reset UI
//       if (!soundBase64) {
//         setIsPlayingFast(false);
//         setIsPlayingSlow(false);
//       }
//     } catch (error: any) {
//       console.error("Error fetching sound:", error);
//       setError("Failed to fetch audio");
//       setIsPlayingFast(false);
//       setIsPlayingSlow(false);
//     }
//   };

//   return (
//     <View className="flex flex-row justify-between items-center gap-x-2">
//       <TouchableOpacity onPress={() => handlePress(1)}>
//         <Volume2 color={isPlayingFast ? "green" : "grey"} />
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => handlePress(0.5)}>
//         <Turtle color={isPlayingSlow ? "green" : "grey"} />
//       </TouchableOpacity>
//       {error && <Text style={{ color: "red", fontSize: 10 }}>{error}</Text>}
//     </View>
//   );
// };

// export default Pronounce;
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
