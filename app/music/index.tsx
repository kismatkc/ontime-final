import axios from "axios";
import React, { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import Toast from "react-native-toast-message";
type Track = {
  title: string;
  playUrl: string;
};

const appwriteEndpoint =
  process.env.APPWRITE_URL_STORAGE || "https://fra.cloud.appwrite.io/v1";
const appwriteProjectId =
  process.env.APPWRITE_PROJECTID_music || "680176d3001131c8a4e7";
const appwriteApiKey =
  process.env.APPWRITE_API_KEY ||
  "standard_17844b2057d31a53694f426cdeaa3bd048df2a8e9f16f1d0a20ac41aeb231baf1198843cc4538a53296b2af451a12a0bdc78ccb6c78872e1a34265dfa8d44ce3d1b6569375d277c8b0adc81a4de3feedc81492bf6824e49ba82a9c0ab10fd36ac5ac4a8aef525ed125bc8fb21a9aec28b4b86031e8ce7d92c094792bef22958a";
const bucketId =
  process.env.APPWRITE_MUSIC_BUCKETNAME || "6801777c0003a97d6c14";

async function getTracks(setMusicCollection: (collection: Track[]) => void) {
  try {
    const response = await axios.get(
      `${appwriteEndpoint}/storage/buckets/${bucketId}/files`,
      {
        headers: {
          "X-Appwrite-Project": appwriteProjectId,
          "X-Appwrite-Key": appwriteApiKey,
        },
      }
    );
    // Extract files from the response
    const files = response.data.files;

    // Filter for MP3 files and map to include playable URLs
    const mp3Files: Track[] = files
      .filter((file: any) => file.name.toLowerCase().endsWith(".mp3"))
      .map((file: any) => ({
        title: file.name,
        playUrl: `${appwriteEndpoint}/storage/buckets/${bucketId}/files/${file.$id}/view?project=${appwriteProjectId}`,
      }));
    setMusicCollection(mp3Files);
    console.log(mp3Files);
  } catch (error) {
    console.log(error);
  }
}

import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
  Clipboard,
  ActivityIndicator,
} from "react-native";

import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import ReactNativeBlobUtil from "react-native-blob-util";
import {
  Ellipsis,
  Music2Icon,
  Music3Icon,
  MusicIcon,
  Trash,
} from "lucide-react-native";
import MusicPlayer from "~/components/music-player";
import { usePlaybackState } from "react-native-track-player";

function isNotYouTubeUrl(url: string | undefined) {
  if (!url) return true;
  // Regex that matches common YouTube URL patterns
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;

  // Return true if it does NOT match a YouTube URL
  return !youtubeRegex.test(url);
}

// Load MP3 files from DocumentDir

type tabsType = "Play" | "Download" | string;

const Music = () => {
  const [tab, setTab] = useState<tabsType>("Play");
  const [MusicCollection, setMusicCollection] = useState<Track[]>([]);
  const [youtbeUrl, setYoutbeUrl] = useState<string | undefined>(undefined);
  const [downloadButton, setDownloadButton] = useState<boolean>(
    isNotYouTubeUrl(youtbeUrl)
  );
  const [downloading, setDownloading] = useState(false);
  const [track, setTrack] = useState<Track>();
  useEffect(() => {
    // getMp3AndSave("https://youtube.com/shorts/AshSzm7z0e8?si=e7cS2ilXIaViyN7x");
    // test();

    (async function () {
      const clipboardUrl = await Clipboard.getString();
      getTracks(setMusicCollection);
      if (!isNotYouTubeUrl(clipboardUrl)) {
        setYoutbeUrl(clipboardUrl);
        setDownloadButton(false);
      }
    })();
  }, []);

  return (
    <View className=" w-full mt-14 my-10 flex flex-col justify-between h-full">
      <Tabs
        value={tab}
        onValueChange={(val) => setTab(val)}
        className="w-full bg-background "
      >
        <TabsList className="flex-row w-full ">
          <TabsTrigger value="Play" className="flex-1">
            <Text className="text-xl font-semibold text-foreground">Play</Text>
          </TabsTrigger>
          <TabsTrigger value="Download" className="flex-1">
            <Text className="text-xl font-semibold text-foreground">
              Download
            </Text>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Play">
          <FlatList
            data={MusicCollection}
            keyExtractor={(item, index) => item.title}
            renderItem={({ item }) => (
              <View className="flex flex-row items-center w-full px-2 my-4">
                <Pressable
                  style={({ pressed }) => [
                    // You can return a style object for the pressed state:
                    { opacity: pressed ? 0 : 1 },
                  ]}
                  className=" flex flex-row items-center my-1 bg-background flex-nowrap justify-between w-full "
                >
                  <TouchableOpacity
                    className="flex-shrink flex flex-row gap-x-3 items-center flex-nowrap "
                    onPress={() => setTrack(item)}
                  >
                    <MusicIcon color="green" className="bg-black" size={24} />
                    <Text className="text-foreground text-xl font-semibold overflow-ellipsis">
                      {item.title.length > 28
                        ? ` ${item.title.substring(0, 28)}...`
                        : item.title}
                    </Text>
                  </TouchableOpacity>

                  <View>
                    <Trash
                      color="red"
                      onPress={async (e) => {
                        e.stopPropagation();
                      }}
                    />
                  </View>
                </Pressable>
              </View>
            )}
          />
        </TabsContent>
        <TabsContent value="Download" className="h-full">
          <View className="mt-52 flex flex-col items-start gap-y-4 px-2">
            <Input
              placeholder="https://www.youtube.com/watch?v=8SbUC-UaAxE"
              value={youtbeUrl}
              className="w-full"
              onChangeText={(url) => {
                setYoutbeUrl(url);
                setDownloadButton(isNotYouTubeUrl(url));
              }}
            />

            <Button
              className="self-center bg-green-700 flex justify-center items-center"
              disabled={downloadButton}
              onPress={async () => {
                try {
                  setDownloading(true);
                  if (!youtbeUrl) return;
                  setDownloadButton(true);
                  Toast.show({
                    type: "success",
                    text1: "The music is available offline now",
                    position: "bottom",
                    swipeable: true,
                  });
                  setDownloading(false);
                  setTab("Play");
                  setYoutbeUrl(undefined);
                } catch (error) {
                  Toast.show({
                    type: "error",
                    text1: "Please try again",
                    position: "bottom",
                    swipeable: true,
                  });
                }
              }}
            >
              {downloading ? (
                <ActivityIndicator />
              ) : (
                <Text className="text-foreground px-3 text-xl font-semibold">
                  Download
                </Text>
              )}
            </Button>
          </View>
        </TabsContent>
      </Tabs>
      <MusicPlayer className="rounded-2xl" track={track} />
    </View>
  );
};

export default Music;

// import React, { useEffect, useState } from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import TrackPlayer, {
//   useTrackPlayerEvents,
//   Event,
//   State,
// } from "react-native-track-player";

// const AudioPlayer = ({
//   url = "https://fra.cloud.appwrite.io/v1/storage/buckets/6801777c0003a97d6c14/files/680178130024ae78766f/view?project=680176d3001131c8a4e7",
//   title = "Audio Track",
// }) => {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isReady, setIsReady] = useState(false);

//   // Initialize the player
//   useEffect(() => {
//     const setupPlayer = async () => {
//       try {
//         // Initialize the player
//         await TrackPlayer.setupPlayer();

//         // Add the track
//         await TrackPlayer.add({
//           id: "1",
//           url: url,
//           title: title,
//           artist: "Unknown Artist",
//         });

//         setIsReady(true);
//       } catch (error) {
//         console.error("Error setting up track player:", error);
//       }
//     };

//     setupPlayer();

//     // Cleanup when component unmounts
//     return () => {
//       TrackPlayer.destroy();
//     };
//   }, [url, title]);

//   // Listen to playback state changes
//   useTrackPlayerEvents([Event.PlaybackState], async (event) => {
//     if (event.state === State.Playing) {
//       setIsPlaying(true);
//     } else {
//       setIsPlaying(false);
//     }
//   });

//   const togglePlayback = async () => {
//     if (!isReady) return;

//     const currentState = await TrackPlayer.getState();

//     if (currentState === State.Playing) {
//       await TrackPlayer.pause();
//     } else {
//       await TrackPlayer.play();
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{title}</Text>

//       <TouchableOpacity
//         style={styles.playButton}
//         onPress={togglePlayback}
//         disabled={!isReady}
//       >
//         <Text style={styles.playButtonText}>
//           {!isReady ? "Loading..." : isPlaying ? "Pause" : "Play"}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: "#f5f5f5",
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 16,
//   },
//   playButton: {
//     backgroundColor: "#4285F4",
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 24,
//   },
//   playButtonText: {
//     color: "#ffffff",
//     fontWeight: "bold",
//   },
// });

// export default AudioPlayer;

// Usage:
// <AudioPlayer url="https://example.com/song.mp3" title="My Song" />
