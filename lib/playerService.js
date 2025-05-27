// lib/playerService.js
import TrackPlayer, { Event } from "react-native-track-player";

/**
 * This synchronous function is what RNTP expects.
 * All async work stays inside the individual event callbacks.
 */
export default function playbackService() {
  /** === lock-screen / Control-Centre controls === */
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () =>
    TrackPlayer.skipToNext()
  );
  TrackPlayer.addEventListener(Event.RemotePrevious, () =>
    TrackPlayer.skipToPrevious()
  );

  /** Jump  ♻️  */
  TrackPlayer.addEventListener(Event.RemoteJumpForward, async (e) => {
    const pos = await TrackPlayer.getPosition();
    await TrackPlayer.seekTo(pos + (e.interval || 15));
  });
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (e) => {
    const pos = await TrackPlayer.getPosition();
    await TrackPlayer.seekTo(Math.max(0, pos - (e.interval || 15)));
  });

  /** Scrubbing */
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) =>
    TrackPlayer.seekTo(position)
  );

  /** House-keeping listeners (optional) */
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    /* loop / reset logic */
  });
  TrackPlayer.addEventListener(Event.PlaybackError, (err) =>
    console.error("RNTP error", err)
  );
}

module.exports = playbackService; // ← add this line
