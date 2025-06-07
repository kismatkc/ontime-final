// import { create } from "zustand";
// import TrackPlayer, {
//   Track,
//   State,
//   Capability,
//   AppKilledPlaybackBehavior,
//   Event,
//   RepeatMode,
//   IOSCategory,
//   IOSCategoryMode,
//   IOSCategoryOptions,
// } from "react-native-track-player";

// /** Domain model for tracks kept in the queue */
// export interface TrackType {
//   artist: string;
//   id: string;
//   title: string;
//   url: string;
//   artwork: string;
// }

// /** ⬅️ SINGLE interface: state + setters + async actions */
// export interface TrackStore {
//   /* ────────────────  state  ──────────────── */
//   track: TrackType | null;
//   queue: TrackType[];
//   newDownloadedSong: TrackType | null;

//   showMiniPlayer: boolean;
//   showMainPlayer: boolean;

//   isNone: boolean;
//   isReady: boolean;
//   isPlaying: boolean;
//   isPaused: boolean;
//   isStopped: boolean;
//   isLoading: boolean;
//   isBuffering: boolean;
//   isError: boolean;
//   isEnded: boolean;

//   isSetup: boolean;
//   repeatMode: RepeatMode;

//   /* ────────────────  setters / sync helpers  ──────────────── */
//   setTrack: (track: TrackType | null) => void;
//   setShowMainPlayer: (show: boolean) => void;
//   setShowMiniPlayer: (show: boolean) => void;
//   updateStateFlags: (state: State) => void;
//   setNewDownloadedSong: (song: TrackType | null) => void;

//   /* ────────────────  async actions  ──────────────── */
//   setup: () => Promise<boolean>;

//   play: () => Promise<void>;
//   pause: () => Promise<void>;
//   stop: () => Promise<void>;

//   skipToTrack: (trackId: string) => Promise<void>;
//   skipToNext: () => Promise<void>;
//   skipToPrevious: () => Promise<void>;

//   jumpForward: (seconds?: number) => Promise<void>;
//   jumpBackward: (seconds?: number) => Promise<void>;

//   addToQueue: (tracks: TrackType[]) => Promise<void>;
//   getCurrentState: () => Promise<State>;

//   setupListeners: () => void;
//   removeListeners: () => void;
// }

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
//     newDownloadedSong: null, // Track for newly downloaded song
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
//             iosCategory: IOSCategory.Playback,
//             iosCategoryMode: IOSCategoryMode.Default,
//             iosCategoryOptions: [
//               IOSCategoryOptions.AllowBluetooth,
//               IOSCategoryOptions.AllowAirPlay,
//               IOSCategoryOptions.InterruptSpokenAudioAndMixWithOthers,
//             ],
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
//               Capability.JumpForward, // Added for lock screen
//               Capability.JumpBackward, // Added for lock screen
//             ],
//             progressUpdateEventInterval: 1, // More frequent updates (each second)
//             alwaysPauseOnInterruption: true,
//           });

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

//       // Handle track changes
//       trackChangeSubscription = TrackPlayer.addEventListener(
//         Event.PlaybackActiveTrackChanged,
//         async (data) => {
//           if (data.track) {
//             // Update current track in store
//             const trackData: TrackType = {
//               id: data.track.id || "",
//               title: data.track.title || "Unknown Title",
//               artist: data.track.artist || "Unknown Artist",
//               url: data.track.url || "",
//               artwork: data.track.artwork || "",
//             };
//             set({ track: trackData });
//           }
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

//     /** Get current playback state */
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

//     /** Explicit play method */
//     play: async () => {
//       try {
//         await TrackPlayer.play();
//         // Don't manually update state - let the event listener handle it
//       } catch (error) {
//         console.error("Failed to play:", error);
//         set({ isError: true });
//       }
//     },

//     /** Pause playback */
//     pause: async () => {
//       try {
//         await TrackPlayer.pause();
//         // Don't manually update state - let the event listener handle it
//       } catch (error) {
//         console.error("Failed to pause:", error);
//         set({ isError: true });
//       }
//     },

//     /** Stop playback */
//     stop: async () => {
//       try {
//         await TrackPlayer.stop();
//         // Don't manually update state - let the event listener handle it
//       } catch (error) {
//         console.error("Failed to stop:", error);
//         set({ isError: true });
//       }
//     },

//     /** Jump forward by specified seconds (default 15) */
//     jumpForward: async (seconds = 15) => {
//       try {
//         const position = await TrackPlayer.getPosition();
//         await TrackPlayer.seekTo(position + seconds);
//       } catch (error) {
//         console.error("Failed to jump forward:", error);
//         set({ isError: true });
//       }
//     },

//     /** Jump backward by specified seconds (default 15) */
//     jumpBackward: async (seconds = 15) => {
//       try {
//         const position = await TrackPlayer.getPosition();
//         const newPosition = Math.max(0, position - seconds);
//         await TrackPlayer.seekTo(newPosition);
//       } catch (error) {
//         console.error("Failed to jump backward:", error);
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
//         // Update queue in store
//         set({ queue: [...get().queue, ...tracks] });
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
//     setNewDownloadedSong: (song: TrackType | null) => {
//       set({ newDownloadedSong: song });
//     },
//   };
// });

import { create } from "zustand";
import TrackPlayer, {
  Track,
  State,
  Capability,
  AppKilledPlaybackBehavior,
  Event,
  RepeatMode,
  IOSCategory,
  IOSCategoryMode,
  IOSCategoryOptions,
} from "react-native-track-player";

/** Domain model for tracks kept in the queue */
export interface TrackType {
  artist: string;
  id: string;
  title: string;
  url: string;
  artwork: string;
}

/** ⬅️ SINGLE interface: state + setters + async actions */
export interface TrackStore {
  /* ────────────────  state  ──────────────── */
  track: TrackType | null;
  queue: TrackType[];
  newDownloadedSong: TrackType | null;

  showMiniPlayer: boolean;
  showMainPlayer: boolean;

  isNone: boolean;
  isReady: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isStopped: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  isError: boolean;
  isEnded: boolean;

  isSetup: boolean;
  repeatMode: RepeatMode;

  /* ────────────────  setters / sync helpers  ──────────────── */
  setTrack: (track: TrackType | null) => void;
  setShowMainPlayer: (show: boolean) => void;
  setShowMiniPlayer: (show: boolean) => void;
  updateStateFlags: (state: State) => void;
  setNewDownloadedSong: (song: TrackType | null) => void;

  /* ────────────────  async actions  ──────────────── */
  setup: () => Promise<boolean>;

  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;

  skipToTrack: (trackId: string) => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;

  jumpForward: (seconds?: number) => Promise<void>;
  jumpBackward: (seconds?: number) => Promise<void>;

  addToQueue: (tracks: TrackType[]) => Promise<void>;
  getCurrentState: () => Promise<State>;

  setupListeners: () => void;
  removeListeners: () => void;
}

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
    showMiniPlayer: false,
    newDownloadedSong: null,
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
    showMainPlayer: false,

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

    /** Setup the TrackPlayer (enhanced setup method) */
    setup: async () => {
      if (get().isSetup) return true;
      try {
        await TrackPlayer.getActiveTrackIndex();
        set({ isSetup: true });
        get().setupListeners();
        return true;
      } catch {
        try {
          console.log("=== SETTING UP TRACKPLAYER ===");
          await TrackPlayer.setupPlayer({
            autoHandleInterruptions: true,
            maxCacheSize: 1024 * 5,
            iosCategory: IOSCategory.Playback,
            iosCategoryMode: IOSCategoryMode.Default,
            iosCategoryOptions: [
              IOSCategoryOptions.AllowBluetooth,
              IOSCategoryOptions.AllowAirPlay,
              IOSCategoryOptions.InterruptSpokenAudioAndMixWithOthers,
            ],
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
              Capability.JumpForward,
              Capability.JumpBackward,
            ],
            progressUpdateEventInterval: 1,
            alwaysPauseOnInterruption: true,
          });

          set({ isSetup: true });
          get().setupListeners();
          console.log("✅ TrackPlayer setup complete");
          return true;
        } catch (error) {
          console.error("❌ Failed to setup TrackPlayer:", error);
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
        return;
      }

      console.log("=== SETTING UP LISTENERS ===");

      // Enhanced error subscription with detailed logging
      errorSubscription = TrackPlayer.addEventListener(
        Event.PlaybackError,
        async (data: any) => {
          console.error("=== DETAILED PLAYBACK ERROR ===");
          console.error("Error data:", JSON.stringify(data, null, 2));
          console.error("Error code:", data.code);
          console.error("Error message:", data.message);
          console.error("Error type:", data.type);

          // Get current track info for debugging
          try {
            const currentTrack = await TrackPlayer.getActiveTrack();
            console.error("Current track when error occurred:", currentTrack);

            if (currentTrack?.url) {
              console.error("Track URL:", currentTrack.url);
              console.error(
                "URL type:",
                currentTrack.url.startsWith("file://") ? "LOCAL" : "REMOTE"
              );
            }
          } catch (trackError) {
            console.error("Could not get active track:", trackError);
          }

          // Get player state
          try {
            const state = await TrackPlayer.getState();
            console.error("Player state during error:", state);
          } catch (stateError) {
            console.error("Could not get player state:", stateError);
          }

          set({ isError: true });
        }
      );

      // Enhanced state change logging
      stateSubscription = TrackPlayer.addEventListener(
        Event.PlaybackState,
        async (data) => {
          console.log("State changed to:", data.state);
          get().updateStateFlags(data.state);

          // Log when entering error state
          if (data.state === State.Error) {
            console.error("Player entered ERROR state");
            try {
              const currentTrack = await TrackPlayer.getActiveTrack();
              console.error("Track that caused error:", currentTrack);
            } catch (e) {
              console.error("Could not get track info in error state:", e);
            }
          }
        }
      );

      // Enhanced track change logging
      trackChangeSubscription = TrackPlayer.addEventListener(
        Event.PlaybackActiveTrackChanged,
        async (data) => {
          console.log("Track changed:", data);
          if (data.track) {
            console.log("New track URL:", data.track.url);
            console.log("Track exists:", data.track.url ? "YES" : "NO");

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

      console.log("✅ Listeners setup complete");
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
        console.log("▶️ Playing...");
        await TrackPlayer.play();
        console.log("✅ Play command sent");
      } catch (error) {
        console.error("❌ Failed to play:", error);
        set({ isError: true });
      }
    },

    /** Pause playback */
    pause: async () => {
      try {
        console.log("⏸️ Pausing...");
        await TrackPlayer.pause();
        console.log("✅ Pause command sent");
      } catch (error) {
        console.error("❌ Failed to pause:", error);
        set({ isError: true });
      }
    },

    /** Stop playback */
    stop: async () => {
      try {
        console.log("⏹️ Stopping...");
        await TrackPlayer.stop();
        console.log("✅ Stop command sent");
      } catch (error) {
        console.error("❌ Failed to stop:", error);
        set({ isError: true });
      }
    },

    /** Jump forward by specified seconds (default 15) */
    jumpForward: async (seconds = 15) => {
      try {
        const position = await TrackPlayer.getPosition();
        console.log(`⏭️ Jumping forward ${seconds}s from ${position}s`);
        await TrackPlayer.seekTo(position + seconds);
        console.log("✅ Jump forward complete");
      } catch (error) {
        console.error("❌ Failed to jump forward:", error);
        set({ isError: true });
      }
    },

    /** Jump backward by specified seconds (default 15) */
    jumpBackward: async (seconds = 15) => {
      try {
        const position = await TrackPlayer.getPosition();
        const newPosition = Math.max(0, position - seconds);
        console.log(
          `⏮️ Jumping backward ${seconds}s from ${position}s to ${newPosition}s`
        );
        await TrackPlayer.seekTo(newPosition);
        console.log("✅ Jump backward complete");
      } catch (error) {
        console.error("❌ Failed to jump backward:", error);
        set({ isError: true });
      }
    },

    /** Skip to the next track */
    skipToNext: async () => {
      try {
        console.log("⏭️ Skipping to next track...");
        await TrackPlayer.skipToNext();
        console.log("✅ Skip to next complete");
      } catch (error) {
        console.error("❌ Failed to skip to next:", error);
        set({ isError: true });
      }
    },

    /** Skip to the previous track */
    skipToPrevious: async () => {
      try {
        console.log("⏮️ Skipping to previous track...");
        await TrackPlayer.skipToPrevious();
        console.log("✅ Skip to previous complete");
      } catch (error) {
        console.error("❌ Failed to skip to previous:", error);
        set({ isError: true });
      }
    },

    /** Skip to specific track by ID */
    skipToTrack: async (trackId: string) => {
      try {
        console.log(`🎯 Skipping to track: ${trackId}`);
        const queue = await TrackPlayer.getQueue();
        const trackIndex = queue.findIndex((track) => track.id === trackId);

        if (trackIndex >= 0) {
          await TrackPlayer.skip(trackIndex);
          console.log(`✅ Skipped to track at index ${trackIndex}`);
        } else {
          console.warn("❌ Track not found in queue:", trackId);
        }
      } catch (error) {
        console.error("❌ Failed to skip to track:", error);
        set({ isError: true });
      }
    },

    /** Enhanced addToQueue with file validation */
    addToQueue: async (tracks: TrackType[]) => {
      if (!get().isSetup) {
        console.log("Player not setup, setting up...");
        await get().setup();
      }

      try {
        console.log("=== ADDING TRACKS TO QUEUE ===");

        // Validate each track before adding
        for (const track of tracks) {
          console.log("=== VALIDATING TRACK ===");
          console.log("Track:", JSON.stringify(track, null, 2));
          console.log("URL:", track.url);
          console.log(
            "URL type:",
            track.url?.startsWith("file://") ? "LOCAL FILE" : "OTHER"
          );

          // For local files, check if path looks valid
          if (track.url?.startsWith("file://")) {
            console.log("Local file path:", track.url);

            // Log the file extension
            const extension = track.url.split(".").pop()?.toLowerCase();
            console.log("File extension:", extension);

            const supportedFormats = ["mp3", "m4a", "aac", "wav", "flac"];
            if (!supportedFormats.includes(extension || "")) {
              console.warn("⚠️ Potentially unsupported format:", extension);
            } else {
              console.log("✅ File format supported:", extension);
            }
          }

          // Check required fields
          const requiredFields = ["id", "title", "url"];
          const missingFields = requiredFields.filter(
            (field) => !track[field as keyof TrackType]
          );

          if (missingFields.length > 0) {
            console.error("❌ Missing required fields:", missingFields);
            throw new Error(
              `Missing required fields: ${missingFields.join(", ")}`
            );
          }
        }

        console.log("🎵 Adding tracks to TrackPlayer...");
        await TrackPlayer.add(tracks);
        console.log("✅ Successfully added tracks to TrackPlayer");

        set({ queue: [...get().queue, ...tracks] });
        console.log("✅ Updated queue in store");
      } catch (error) {
        console.error("=== ADD TO QUEUE ERROR ===");
        console.error("Error:", error);
        console.error("Error message:", (error as Error).message);
        console.error("Error stack:", (error as Error).stack);
        console.error("Tracks that failed:", tracks);
        set({ isError: true });
        throw error;
      }
    },

    setShowMainPlayer: (show: boolean) => {
      set({ showMainPlayer: show });
    },

    setShowMiniPlayer: (show: boolean) => {
      set({ showMiniPlayer: show });
    },

    setNewDownloadedSong: (song: TrackType | null) => {
      set({ newDownloadedSong: song });
    },
  };
});
