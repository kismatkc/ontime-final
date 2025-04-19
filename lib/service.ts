import TrackPlayer from "react-native-track-player";

export default async function playbackService() {
  // Play when triggered remotely (e.g., lock screen)
  TrackPlayer.addEventListener("remote-play", () => TrackPlayer.play());

  // Pause when triggered remotely
  TrackPlayer.addEventListener("remote-pause", () => TrackPlayer.pause());

  // Log playback state changes for debugging
  TrackPlayer.addEventListener("playback-state", (state) => {
    console.log("Playback state:", state);
  });

  // Handle playback errors
  TrackPlayer.addEventListener("playback-error", (error) => {
    console.error("Playback error:", error);
  });
}
