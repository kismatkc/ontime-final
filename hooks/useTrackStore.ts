// import { create } from "zustand";
// import TrackPlayer, {
//   Track,
//   State,
//   Capability,
//   AppKilledPlaybackBehavior,
//   Event,
//   RepeatMode,
// } from "react-native-track-player";

// export interface TrackType {
//   artist: string;
//   id: string;
//   title: string;
//   url: string;
//   artwork: string;
// }

// // Define the store's state
// interface TrackState {
//   track: TrackType | null; // Current track (using null for explicit emptiness)
//   queue: TrackType[]; // Full queue of tracks

//   showMiniPlayer: boolean; // Optional for mini player visibility

//   // Individual boolean state trackers instead of single playbackState
//   isNone: boolean; // State.None
//   isReady: boolean; // State.Ready
//   isPlaying: boolean; // State.Playing
//   isPaused: boolean; // State.Paused
//   isStopped: boolean; // State.Stopped
//   isLoading: boolean; // State.Loading/Connecting
//   isBuffering: boolean; // State.Buffering
//   isError: boolean; // State.Error
//   isEnded: boolean; // State.Ended
//   setTrack: (track: TrackType | null) => void; // Setter for current track

//   isSetup: boolean; // Whether the player is initialized
//   repeatMode: RepeatMode; // Repeat mode (Off, Track, Queue)
//   showMainPlayer: boolean; // Whether to show the main player
//   setShowMainPlayer: (show: boolean) => void; // Setter for showMainPlayer
// }

// // Define the store's actions
// interface TrackActions {
//   setup: () => Promise<boolean>; // Return success/failure status
//   setTrack: (track: TrackType | null) => void; // From your original store

//   play: () => Promise<void>; // Added explicit play method
//   pause: () => Promise<void>;
//   stop: () => Promise<void>;
//   skipToTrack: (trackId: string) => Promise<void>; // Skip to specific track
//   skipToNext: () => Promise<void>;
//   skipToPrevious: () => Promise<void>;
//   addToQueue: (tracks: TrackType[]) => Promise<void>;

//   setupListeners: () => void; // Add event listeners
//   removeListeners: () => void; // Clean up event listeners
//   updateStateFlags: (state: State) => void; // Helper to update all state flags
//   setShowMiniPlayer: (show: boolean) => void; // Setter for showMiniPlayer
// }

// // Combine state and actions into the store type
// type TrackStore = TrackState & TrackActions;

// // Create the Zustand store
// export const useTrackStore = create<TrackStore>((set, get) => {
//   // Store event subscription references for cleanup
//   let progressSubscription: any = null;
//   let stateSubscription: any = null;
//   let trackChangeSubscription: any = null;
//   let errorSubscription: any = null;

//   return {
//     // Initial state
//     track: null,
//     queue: [],
//     showMiniPlayer: false, // Optional for mini player visibility

//     // Boolean state flags (replacing playbackState)
//     isNone: true,
//     isReady: false,
//     isPlaying: false,
//     isPaused: false,
//     isStopped: false,
//     isLoading: false,
//     isBuffering: false,
//     isError: false,
//     isEnded: false,

//     isSetup: false,
//     repeatMode: RepeatMode.Off,
//     showMainPlayer: false, // Whether to show the main player

//     // Helper to update all state flags based on a state
//     updateStateFlags: (state: State) => {
//       set({
//         isNone: state === State.None,
//         isReady: state === State.Ready,
//         isPlaying: state === State.Playing,
//         isPaused: state === State.Paused,
//         isStopped: state === State.Stopped,
//         isLoading: state === State.Loading,
//         isBuffering: state === State.Buffering,
//         isError: state === State.Error,
//         isEnded: state === State.Ended,
//       });
//     },

//     // Actions

//     /** Setup the TrackPlayer (enhanced setup method) */
//     setup: async () => {
//       if (get().isSetup) return true;
//       try {
//         await TrackPlayer.getActiveTrackIndex(); // Check if already setup
//         set({ isSetup: true });
//         get().setupListeners(); // Setup event listeners
//         return true;
//       } catch {
//         try {
//           await TrackPlayer.setupPlayer({
//             // Provide setup options here for cleaner initialization
//             autoHandleInterruptions: true,
//             maxCacheSize: 1024 * 5, // 5MB cache
//           });

//           await TrackPlayer.updateOptions({
//             android: {
//               appKilledPlaybackBehavior:
//                 AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
//             },
//             capabilities: [
//               Capability.Play,
//               Capability.Pause,
//               Capability.Stop,
//               Capability.SkipToNext,
//               Capability.SkipToPrevious,
//               Capability.SeekTo,
//               Capability.SetRating,
//               Capability.JumpForward,
//               Capability.JumpBackward,
//             ],
//             compactCapabilities: [
//               Capability.Play,
//               Capability.Pause,
//               Capability.Stop,
//             ],
//             notificationCapabilities: [
//               Capability.Play,
//               Capability.Pause,
//               Capability.SkipToNext,
//               Capability.SkipToPrevious,
//             ],
//             progressUpdateEventInterval: 1, // More frequent updates (each second)
//             alwaysPauseOnInterruption: true,
//           });

//           TrackPlayer.registerPlaybackService(() => playbackService);
//           set({ isSetup: true });
//           get().setupListeners(); // Setup event listeners
//           return true;
//         } catch (error) {
//           console.error("Failed to setup TrackPlayer:", error);
//           return false;
//         }
//       }
//     },

//     /** Set up event listeners for player events */
//     setupListeners: () => {
//       if (
//         progressSubscription ||
//         stateSubscription ||
//         trackChangeSubscription
//       ) {
//         // Already set up
//         return;
//       }

//       // Track playback state changes
//       stateSubscription = TrackPlayer.addEventListener(
//         Event.PlaybackState,
//         async (data) => {
//           const state = data.state;
//           get().updateStateFlags(state);
//         }
//       );

//       // Handle playback errors
//       errorSubscription = TrackPlayer.addEventListener(
//         Event.PlaybackError,
//         async (data) => {
//           console.error("Playback error:", data.message);
//           set({ isError: true });
//         }
//       );
//     },

//     /** Remove event listeners to prevent memory leaks */
//     removeListeners: () => {
//       if (progressSubscription) {
//         progressSubscription.remove();
//         progressSubscription = null;
//       }

//       if (stateSubscription) {
//         stateSubscription.remove();
//         stateSubscription = null;
//       }

//       if (trackChangeSubscription) {
//         trackChangeSubscription.remove();
//         trackChangeSubscription = null;
//       }

//       if (errorSubscription) {
//         errorSubscription.remove();
//         errorSubscription = null;
//       }
//     },

//     /** Set the current track */
//     setTrack: (track: TrackType | null) => set({ track }),

//     /** Explicit play method */
//     play: async () => {
//       try {
//         await TrackPlayer.play();
//         get().updateStateFlags(State.Playing);
//       } catch (error) {
//         console.error("Failed to play:", error);
//         set({ isError: true });
//       }
//     },

//     getCurrentState: async () => {
//       try {
//         const state = await TrackPlayer.getState();
//         get().updateStateFlags(state);
//         return state;
//       } catch (error) {
//         console.error("Failed to get current state:", error);
//         set({ isError: true });
//         return State.None;
//       }
//     },

//     /** Pause playback */
//     pause: async () => {
//       try {
//         await TrackPlayer.pause();
//         get().updateStateFlags(State.Paused);
//       } catch (error) {
//         console.error("Failed to pause:", error);
//         set({ isError: true });
//       }
//     },

//     /** Stop playback */
//     stop: async () => {
//       try {
//         await TrackPlayer.stop();
//         get().updateStateFlags(State.Stopped);
//       } catch (error) {
//         console.error("Failed to stop:", error);
//         set({ isError: true });
//       }
//     },

//     /** Skip to the next track */
//     skipToNext: async () => {
//       try {
//         await TrackPlayer.skipToNext();
//         // The track will be updated via event listeners
//       } catch (error) {
//         console.error("Failed to skip to next:", error);
//         set({ isError: true });
//       }
//     },

//     /** Skip to the previous track */
//     skipToPrevious: async () => {
//       try {
//         await TrackPlayer.skipToPrevious();
//         // The track will be updated via event listeners
//       } catch (error) {
//         console.error("Failed to skip to previous:", error);
//         set({ isError: true });
//       }
//     },

//     /** Skip to specific track by ID */
//     skipToTrack: async (trackId: string) => {
//       try {
//         const queue = await TrackPlayer.getQueue();
//         const trackIndex = queue.findIndex((track) => track.id === trackId);

//         if (trackIndex >= 0) {
//           await TrackPlayer.skip(trackIndex);
//           // The track will be updated via event listeners
//         } else {
//           console.warn("Track not found in queue:", trackId);
//         }
//       } catch (error) {
//         console.error("Failed to skip to track:", error);
//         set({ isError: true });
//       }
//     },

//     /** Add tracks to the queue */
//     addToQueue: async (tracks: TrackType[]) => {
//       if (!get().isSetup) {
//         await get().setup();
//       }

//       try {
//         // Add to the player
//         await TrackPlayer.add(tracks);
//       } catch (error) {
//         console.error("Failed to add to queue:", error);
//         set({ isError: true });
//       }
//     },

//     setShowMainPlayer: (show: boolean) => {
//       set({ showMainPlayer: show });
//     },

//     setShowMiniPlayer: (show: boolean) => {
//       set({ showMiniPlayer: show });
//     },
//   };
// });

// export const playbackService = async () => {
//   TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
//   TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
//   TrackPlayer.addEventListener(Event.RemoteNext, () =>
//     TrackPlayer.skipToNext()
//   );
//   TrackPlayer.addEventListener(Event.RemotePrevious, () =>
//     TrackPlayer.skipToPrevious()
//   );
//   TrackPlayer.addEventListener(
//     Event.PlaybackProgressUpdated,
//     ({ position, duration }) => {
//       // your app logic (e.g. sleep timer, UI sync)
//     }
//   );
//   TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
//     // handle state changes
//   });
//   TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
//     // e.g. reset or loop
//   });

//   TrackPlayer.addEventListener(Event.RemoteStop, () => {
//     TrackPlayer.stop();
//   });
// };

import { create } from "zustand";
import TrackPlayer, {
  Track,
  State,
  Capability,
  AppKilledPlaybackBehavior,
  Event,
  RepeatMode,
} from "react-native-track-player";

export interface TrackType {
  artist: string;
  id: string;
  title: string;
  url: string;
  artwork: string;
}

// Define the store's state
interface TrackState {
  track: TrackType | null; // Current track (using null for explicit emptiness)
  queue: TrackType[]; // Full queue of tracks

  showMiniPlayer: boolean; // Optional for mini player visibility

  // Individual boolean state trackers instead of single playbackState
  isNone: boolean; // State.None
  isReady: boolean; // State.Ready
  isPlaying: boolean; // State.Playing
  isPaused: boolean; // State.Paused
  isStopped: boolean; // State.Stopped
  isLoading: boolean; // State.Loading/Connecting
  isBuffering: boolean; // State.Buffering
  isError: boolean; // State.Error
  isEnded: boolean; // State.Ended
  setTrack: (track: TrackType | null) => void; // Setter for current track

  isSetup: boolean; // Whether the player is initialized
  repeatMode: RepeatMode; // Repeat mode (Off, Track, Queue)
  showMainPlayer: boolean; // Whether to show the main player
  setShowMainPlayer: (show: boolean) => void; // Setter for showMainPlayer
}

// Define the store's actions
interface TrackActions {
  setup: () => Promise<boolean>; // Return success/failure status
  setTrack: (track: TrackType | null) => void; // From your original store

  play: () => Promise<void>; // Added explicit play method
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  skipToTrack: (trackId: string) => Promise<void>; // Skip to specific track
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  jumpForward: (seconds?: number) => Promise<void>; // Jump forward (default 15s)
  jumpBackward: (seconds?: number) => Promise<void>; // Jump backward (default 15s)
  addToQueue: (tracks: TrackType[]) => Promise<void>;
  getCurrentState: () => Promise<State>;

  setupListeners: () => void; // Add event listeners
  removeListeners: () => void; // Clean up event listeners
  updateStateFlags: (state: State) => void; // Helper to update all state flags
  setShowMiniPlayer: (show: boolean) => void; // Setter for showMiniPlayer
}

// Combine state and actions into the store type
type TrackStore = TrackState & TrackActions;

// Create the Zustand store
export const useTrackStore = create<TrackStore>((set, get) => {
  // Store event subscription references for cleanup
  let progressSubscription: any = null;
  let stateSubscription: any = null;
  let trackChangeSubscription: any = null;
  let errorSubscription: any = null;

  return {
    // Initial state
    track: null,
    queue: [],
    showMiniPlayer: false, // Optional for mini player visibility

    // Boolean state flags (replacing playbackState)
    isNone: true,
    isReady: false,
    isPlaying: false,
    isPaused: false,
    isStopped: false,
    isLoading: false,
    isBuffering: false,
    isError: false,
    isEnded: false,

    isSetup: false,
    repeatMode: RepeatMode.Off,
    showMainPlayer: false, // Whether to show the main player

    // Helper to update all state flags based on a state
    updateStateFlags: (state: State) => {
      set({
        isNone: state === State.None,
        isReady: state === State.Ready,
        isPlaying: state === State.Playing,
        isPaused: state === State.Paused,
        isStopped: state === State.Stopped,
        isLoading: state === State.Loading,
        isBuffering: state === State.Buffering,
        isError: state === State.Error,
        isEnded: state === State.Ended,
      });
    },

    // Actions

    /** Setup the TrackPlayer (enhanced setup method) */
    setup: async () => {
      if (get().isSetup) return true;
      try {
        await TrackPlayer.getActiveTrackIndex(); // Check if already setup
        set({ isSetup: true });
        get().setupListeners(); // Setup event listeners
        return true;
      } catch {
        try {
          await TrackPlayer.setupPlayer({
            // Provide setup options here for cleaner initialization
            autoHandleInterruptions: true,
            maxCacheSize: 1024 * 5, // 5MB cache
          });

          await TrackPlayer.updateOptions({
            android: {
              appKilledPlaybackBehavior:
                AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            },
            capabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.Stop,
              Capability.SkipToNext,
              Capability.SkipToPrevious,
              Capability.SeekTo,
              Capability.SetRating,
              Capability.JumpForward,
              Capability.JumpBackward,
            ],
            compactCapabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.Stop,
            ],
            notificationCapabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.SkipToNext,
              Capability.SkipToPrevious,
              Capability.JumpForward, // Added for lock screen
              Capability.JumpBackward, // Added for lock screen
            ],
            progressUpdateEventInterval: 1, // More frequent updates (each second)
            alwaysPauseOnInterruption: true,
          });

          TrackPlayer.registerPlaybackService(() => playbackService);
          set({ isSetup: true });
          get().setupListeners(); // Setup event listeners
          return true;
        } catch (error) {
          console.error("Failed to setup TrackPlayer:", error);
          return false;
        }
      }
    },

    /** Set up event listeners for player events */
    setupListeners: () => {
      if (
        progressSubscription ||
        stateSubscription ||
        trackChangeSubscription
      ) {
        // Already set up
        return;
      }

      // Track playback state changes
      stateSubscription = TrackPlayer.addEventListener(
        Event.PlaybackState,
        async (data) => {
          const state = data.state;
          get().updateStateFlags(state);
        }
      );

      // Handle track changes
      trackChangeSubscription = TrackPlayer.addEventListener(
        Event.PlaybackActiveTrackChanged,
        async (data) => {
          if (data.track) {
            // Update current track in store
            const trackData: TrackType = {
              id: data.track.id || "",
              title: data.track.title || "Unknown Title",
              artist: data.track.artist || "Unknown Artist",
              url: data.track.url || "",
              artwork: data.track.artwork || "",
            };
            set({ track: trackData });
          }
        }
      );

      // Handle playback errors
      errorSubscription = TrackPlayer.addEventListener(
        Event.PlaybackError,
        async (data) => {
          console.error("Playback error:", data.message);
          set({ isError: true });
        }
      );
    },

    /** Remove event listeners to prevent memory leaks */
    removeListeners: () => {
      if (progressSubscription) {
        progressSubscription.remove();
        progressSubscription = null;
      }

      if (stateSubscription) {
        stateSubscription.remove();
        stateSubscription = null;
      }

      if (trackChangeSubscription) {
        trackChangeSubscription.remove();
        trackChangeSubscription = null;
      }

      if (errorSubscription) {
        errorSubscription.remove();
        errorSubscription = null;
      }
    },

    /** Set the current track */
    setTrack: (track: TrackType | null) => set({ track }),

    /** Get current playback state */
    getCurrentState: async () => {
      try {
        const state = await TrackPlayer.getState();
        get().updateStateFlags(state);
        return state;
      } catch (error) {
        console.error("Failed to get current state:", error);
        set({ isError: true });
        return State.None;
      }
    },

    /** Explicit play method */
    play: async () => {
      try {
        await TrackPlayer.play();
        // Don't manually update state - let the event listener handle it
      } catch (error) {
        console.error("Failed to play:", error);
        set({ isError: true });
      }
    },

    /** Pause playback */
    pause: async () => {
      try {
        await TrackPlayer.pause();
        // Don't manually update state - let the event listener handle it
      } catch (error) {
        console.error("Failed to pause:", error);
        set({ isError: true });
      }
    },

    /** Stop playback */
    stop: async () => {
      try {
        await TrackPlayer.stop();
        // Don't manually update state - let the event listener handle it
      } catch (error) {
        console.error("Failed to stop:", error);
        set({ isError: true });
      }
    },

    /** Jump forward by specified seconds (default 15) */
    jumpForward: async (seconds = 15) => {
      try {
        const position = await TrackPlayer.getPosition();
        await TrackPlayer.seekTo(position + seconds);
      } catch (error) {
        console.error("Failed to jump forward:", error);
        set({ isError: true });
      }
    },

    /** Jump backward by specified seconds (default 15) */
    jumpBackward: async (seconds = 15) => {
      try {
        const position = await TrackPlayer.getPosition();
        const newPosition = Math.max(0, position - seconds);
        await TrackPlayer.seekTo(newPosition);
      } catch (error) {
        console.error("Failed to jump backward:", error);
        set({ isError: true });
      }
    },

    /** Skip to the next track */
    skipToNext: async () => {
      try {
        await TrackPlayer.skipToNext();
        // The track will be updated via event listeners
      } catch (error) {
        console.error("Failed to skip to next:", error);
        set({ isError: true });
      }
    },

    /** Skip to the previous track */
    skipToPrevious: async () => {
      try {
        await TrackPlayer.skipToPrevious();
        // The track will be updated via event listeners
      } catch (error) {
        console.error("Failed to skip to previous:", error);
        set({ isError: true });
      }
    },

    /** Skip to specific track by ID */
    skipToTrack: async (trackId: string) => {
      try {
        const queue = await TrackPlayer.getQueue();
        const trackIndex = queue.findIndex((track) => track.id === trackId);

        if (trackIndex >= 0) {
          await TrackPlayer.skip(trackIndex);
          // The track will be updated via event listeners
        } else {
          console.warn("Track not found in queue:", trackId);
        }
      } catch (error) {
        console.error("Failed to skip to track:", error);
        set({ isError: true });
      }
    },

    /** Add tracks to the queue */
    addToQueue: async (tracks: TrackType[]) => {
      if (!get().isSetup) {
        await get().setup();
      }

      try {
        // Add to the player
        await TrackPlayer.add(tracks);
        // Update queue in store
        set({ queue: [...get().queue, ...tracks] });
      } catch (error) {
        console.error("Failed to add to queue:", error);
        set({ isError: true });
      }
    },

    setShowMainPlayer: (show: boolean) => {
      set({ showMainPlayer: show });
    },

    setShowMiniPlayer: (show: boolean) => {
      set({ showMiniPlayer: show });
    },
  };
});

export const playbackService = async () => {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () =>
    TrackPlayer.skipToNext()
  );
  TrackPlayer.addEventListener(Event.RemotePrevious, () =>
    TrackPlayer.skipToPrevious()
  );

  // FIXED: Add jump forward/backward event listeners for lock screen
  TrackPlayer.addEventListener(Event.RemoteJumpForward, async (event) => {
    const position = await TrackPlayer.getPosition();
    await TrackPlayer.seekTo(position + (event.interval || 15));
  });

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (event) => {
    const position = await TrackPlayer.getPosition();
    const newPosition = Math.max(0, position - (event.interval || 15));
    await TrackPlayer.seekTo(newPosition);
  });

  TrackPlayer.addEventListener(
    Event.PlaybackProgressUpdated,
    ({ position, duration }) => {
      // your app logic (e.g. sleep timer, UI sync)
    }
  );

  TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
    // handle state changes
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    // e.g. reset or loop
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.stop();
  });

  // FIXED: Add seek event listener for lock screen scrubbing
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => {
    TrackPlayer.seekTo(position);
  });
};
