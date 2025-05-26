import React, { useCallback, useEffect, useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, View } from "react-native";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react-native";
import { useTrackStore } from "~/hooks/useTrackStore";
import { MovingText } from "./moving-text";

/* ——————————————————————————————————————————— */
/* MiniPlayer — fully-integrated with skip + bounce */
/* ——————————————————————————————————————————— */
const MiniPlayer = () => {
  const {
    track,
    isPlaying,
    pause,
    play,
    setShowMainPlayer,
    setShowMiniPlayer,
    showMiniPlayer,
    skipToNext,
    skipToPrevious,
  } = useTrackStore();

  /* ---------- visibility fade-in ---------- */
  const initialOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (showMiniPlayer) {
      Animated.timing(initialOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [showMiniPlayer, initialOpacity]);

  /* ---------- icon opacities ---------- */
  const playIconOpacity = useRef(new Animated.Value(0)).current;
  const pauseIconOpacity = useRef(new Animated.Value(0)).current;

  /* set correct icon immediately on mount */
  useEffect(() => {
    playIconOpacity.setValue(isPlaying ? 0 : 1);
    pauseIconOpacity.setValue(isPlaying ? 1 : 0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* sync icons when playing state changes (animated) */
  useEffect(() => {
    const duration = 200;
    Animated.parallel([
      Animated.timing(playIconOpacity, {
        toValue: isPlaying ? 0 : 1,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(pauseIconOpacity, {
        toValue: isPlaying ? 1 : 0,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isPlaying, playIconOpacity, pauseIconOpacity]);

  /* ---------- play / pause bounce ---------- */
  const playScale = useRef(new Animated.Value(1)).current;
  const bounce = (val: Animated.Value) =>
    Animated.sequence([
      Animated.timing(val, {
        toValue: 0.9,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(val, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);

  const handlePlayPause = useCallback(() => {
    bounce(playScale).start();
    isPlaying ? pause() : play();
  }, [isPlaying, pause, play, playScale]);

  /* ---------- skip controls ---------- */
  const prevScale = useRef(new Animated.Value(1)).current;
  const nextScale = useRef(new Animated.Value(1)).current;

  const handleSkipPrevious = useCallback(() => {
    bounce(prevScale).start();
    skipToPrevious();
  }, [prevScale, skipToPrevious]);

  const handleSkipNext = useCallback(() => {
    bounce(nextScale).start();
    skipToNext();
  }, [nextScale, skipToNext]);

  /* ---------- open full player ---------- */
  const openMainPlayer = useCallback(() => {
    setShowMainPlayer(true);
    setShowMiniPlayer(false);
  }, [setShowMainPlayer, setShowMiniPlayer]);

  /* ---------- render ---------- */
  return (
    <Animated.View
      className="h-[15%] absolute bottom-20 right-0 left-0"
      style={{ opacity: initialOpacity }}
    >
      <Pressable className="flex flex-row gap-x-1" onPress={openMainPlayer}>
        {/* artwork + title */}
        <View className="flex flex-row items-center shrink w-[60%] overflow-hidden">
          <Image
            source={
              track?.artwork
                ? { uri: track.artwork }
                : require("~/assets/unknown_track.png")
            }
            className="w-20 h-20 rounded-lg z-[50]"
          />
          <MovingText
            text={track?.title || ""}
            style={styles.trackTitle}
            animationThreshold={18}
          />
        </View>

        {/* controls */}
        <View className="flex flex-row gap-x-3 flex-1 justify-center items-center pr-2">
          {/* previous */}
          <Animated.View style={{ transform: [{ scale: prevScale }] }}>
            <Pressable onPress={handleSkipPrevious}>
              <SkipBack color="#fff" size={25} strokeWidth={4} />
            </Pressable>
          </Animated.View>

          {/* play / pause */}
          <Animated.View style={{ transform: [{ scale: playScale }] }}>
            <Pressable
              className="bg-[#6156E2] rounded-full p-4 relative"
              onPress={handlePlayPause}
              style={styles.playButton}
            >
              <Animated.View
                style={{
                  opacity: playIconOpacity,
                  position: "absolute",
                  top: 16,
                  left: 16,
                }}
              >
                <Play color="#fff" size={25} strokeWidth={4} />
              </Animated.View>
              <Animated.View
                style={{
                  opacity: pauseIconOpacity,
                  position: "absolute",
                  top: 16,
                  left: 16,
                }}
              >
                <Pause color="#fff" size={25} strokeWidth={2.5} />
              </Animated.View>
            </Pressable>
          </Animated.View>

          {/* next */}
          <Animated.View style={{ transform: [{ scale: nextScale }] }}>
            <Pressable onPress={handleSkipNext}>
              <SkipForward color="#fff" size={25} strokeWidth={4} />
            </Pressable>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default MiniPlayer;

/* ————————————————————— styles ————————————————————— */
const styles = StyleSheet.create({
  trackTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    paddingLeft: 10,
  },
  playButton: {
    width: 57,
    height: 57,
    justifyContent: "center",
    alignItems: "center",
  },
});
