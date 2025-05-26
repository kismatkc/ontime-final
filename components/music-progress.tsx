import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import TrackPlayer, { useProgress } from "react-native-track-player";
import Slider from "@react-native-community/slider";

const MusicProgress = () => {
  // Get the current position and duration of the track, updating every 100ms
  const progress = useProgress(100);

  // State to manage sliding behavior and last sought position
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [lastSeek, setLastSeek] = useState(null);

  // Handle slider events
  const handleSlidingStart = () => setIsSeeking(true);
  const handleValueChange = (value) => setSeekValue(value);
  const handleSlidingComplete = (value) => {
    TrackPlayer.seekTo(value); // Skip to the selected position
    setLastSeek(value); // Store the sought position
    setIsSeeking(false); // End seeking state
  };

  // Format time from seconds to MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Determine what value to display on the slider
  const displayValue = isSeeking
    ? seekValue
    : lastSeek !== null
    ? lastSeek
    : progress.position;

  // Use effect to clear lastSeek when progress.position is close to it
  useEffect(() => {
    if (lastSeek !== null && Math.abs(progress.position - lastSeek) < 0.5) {
      setLastSeek(null); // Switch back to progress.position
    }
  }, [progress.position, lastSeek]);

  // Handle case when no track is loaded
  if (!progress.duration) {
    return <Text>No track loaded</Text>; // Fixed: Wrapped in Text component
  }

  return (
    <View style={styles.container}>
      {/* Progress Slider */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={progress.duration}
        value={displayValue}
        onSlidingStart={handleSlidingStart}
        onValueChange={handleValueChange}
        onSlidingComplete={handleSlidingComplete}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
        thumbTintColor="#FFFFFF"
      />
      {/* Time Display */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(displayValue)}</Text>
        <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  slider: {
    width: 300,
    height: 40,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 300,
  },
  timeText: {
    color: "#FFFFFF",
  },
});

export default MusicProgress;
