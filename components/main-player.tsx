import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  SkipBack,
  Play,
  SkipForward,
  Pause,
  MicVocal,
  Guitar,
  X,
} from "lucide-react-native";
import { useTrackStore } from "~/hooks/useTrackStore";
import MusicProgress from "./music-progress";
import { MovingText } from "./moving-text";
import Lyrisc from "./lyrics";

const MainPlayer = () => {
  const {
    track,
    isPlaying,
    pause,
    isPaused,
    play,
    showMainPlayer,
    setShowMainPlayer,
    setShowMiniPlayer,
    /** ⬇️  NEW: bring these two helpers in */
    skipToNext,
    skipToPrevious,
  } = useTrackStore();

  const height = Dimensions.get("window").height;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ───────────────────────── Play / Pause logic (unchanged) ────────────────────────
  const playIconOpacity = useRef(new Animated.Value(isPlaying ? 0 : 1)).current;
  const pauseIconOpacity = useRef(
    new Animated.Value(isPlaying ? 1 : 0)
  ).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handlePlayPause = useCallback(() => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const duration = 150;

    if (isPlaying) {
      Animated.parallel([
        Animated.timing(playIconOpacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(pauseIconOpacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
      pause();
    } else {
      Animated.parallel([
        Animated.timing(playIconOpacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(pauseIconOpacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
      play();
    }
  }, [isPlaying, play, pause, playIconOpacity, pauseIconOpacity, buttonScale]);

  // ───────────────────────── NEW skip-button animation helpers ─────────────────────
  const prevScale = useRef(new Animated.Value(1)).current;
  const nextScale = useRef(new Animated.Value(1)).current;

  const bounce = (target: Animated.Value) =>
    Animated.sequence([
      Animated.timing(target, {
        toValue: 0.85,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(target, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);

  const handleSkipPrevious = useCallback(() => {
    bounce(prevScale).start();
    skipToPrevious(); // ignore await so UI stays snappy
  }, [prevScale, skipToPrevious]);

  const handleSkipNext = useCallback(() => {
    bounce(nextScale).start();
    skipToNext();
  }, [nextScale, skipToNext]);

  // ───────────────────────── rest of the original component ────────────────────────
  useEffect(() => {
    if (showMainPlayer) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showMainPlayer, fadeAnim]);

  const handleClose = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowMainPlayer(false);
      setShowMiniPlayer(true);
    });
  }, [fadeAnim, setShowMainPlayer, setShowMiniPlayer]);

  return (
    <Animated.View
      className="absolute bottom-20 z-50 bg-[#0A071E] w-full rounded-xl flex-col flex-1 pt-4"
      style={{ height: height * 0.76, opacity: fadeAnim }}
    >
      <Pressable className="self-end px-2" onPress={handleClose}>
        <X color="white" size={30} />
      </Pressable>

      {/* ─────────── track info ─────────── */}
      <View className="py-2 flex-row items-center z-50">
        <Image
          source={
            track?.artwork
              ? { uri: track.artwork }
              : require("~/assets/unknown_track.png")
          }
          className="w-20 h-20 rounded-lg z-50"
        />
        <View className="ml-4 flex-1">
          <MovingText
            text={track?.title || ""}
            style={styles.trackTitle}
            animationThreshold={40}
          />
          <Text style={styles.artistName}>
            {track?.artist || "Unknown Artist"}
          </Text>
        </View>
      </View>

      <Lyrisc trackName={track?.title || null} />
      <MusicProgress />

      {/* ─────────── controls row ─────────── */}
      <View className="flex flex-row items-center mt-4">
        <View className="px-4">
          <Guitar color="white" size={35} />
        </View>

        <View className="flex flex-row gap-x-6 flex-1 justify-center items-center">
          {/* PREVIOUS */}
          <Animated.View style={{ transform: [{ scale: prevScale }] }}>
            <Pressable onPress={handleSkipPrevious}>
              <SkipBack color="white" size={35} strokeWidth={4} />
            </Pressable>
          </Animated.View>

          {/* PLAY / PAUSE (unchanged) */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable
              className="bg-[#6156E2] rounded-full p-4"
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
                <Play color="white" size={35} strokeWidth={4} />
              </Animated.View>
              <Animated.View
                style={{
                  opacity: pauseIconOpacity,
                  position: "absolute",
                  top: 16,
                  left: 16,
                }}
              >
                <Pause color="white" size={35} strokeWidth={2.5} />
              </Animated.View>
            </Pressable>
          </Animated.View>

          {/* NEXT */}
          <Animated.View style={{ transform: [{ scale: nextScale }] }}>
            <Pressable onPress={handleSkipNext}>
              <SkipForward color="white" size={35} strokeWidth={4} />
            </Pressable>
          </Animated.View>
        </View>

        <View className="px-4">
          <MicVocal color="white" size={35} />
        </View>
      </View>
    </Animated.View>
  );
};

export default MainPlayer;

/* ——————— styles (unchanged) ——————— */
export const colors = { text: "#fff" };
export const fontSize = { base: 20 };

export const defaultStyles = StyleSheet.create({
  text: { fontSize: fontSize.base, color: colors.text },
});

const styles = StyleSheet.create({
  trackTitle: {
    ...defaultStyles.text,
    fontSize: 16,
    fontWeight: "bold",
    paddingLeft: 10,
  },
  mainTrackTitle: { color: colors.text, fontSize: 18, fontWeight: "bold" },
  artistName: { color: "#aaa", fontSize: 16 },
  playButton: {
    width: 67,
    height: 67,
    justifyContent: "center",
    alignItems: "center",
  },
});
