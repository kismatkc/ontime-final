import { View, Text, Pressable, Image, TouchableOpacity } from "react-native";
import { Slider } from "@miblanchard/react-native-slider";
import { AudioLines, ListMusic, Pause, Play } from "lucide-react-native";

import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";
import { useEffect, useState } from "react";

export default function MusicPlayer({
  className,
  track,
}: {
  className: string;
  track:
    | {
        title: string;
        fileUrl: string;
      }
    | undefined;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <View
      className={className}
      style={{ backgroundColor: "#313131", opacity: 0.75, height: "45%" }}
    >
      <Text className="text-white  text-3xl font-semibold p-3">
        {track?.title}
      </Text>

      <View className="my-6 px-5">
        <Slider thumbStyle={{ backgroundColor: "white" }} />
      </View>

      <View className="flex flex-row items-center justify-around">
        <View className="bg-white rounded-full p-2">
          <TouchableOpacity>
            <AudioLines color={"black"} size={30} />
          </TouchableOpacity>
        </View>
        <View className="flex flex-row items-center gap-x-3">
          <TouchableOpacity>
            <Image
              source={require("../assets/5-rewind.png")}
              className="w-10 h-10 scale-110"
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-white rounded-full p-2"
            onPress={async () => {
              setPlaying(!playing);
              const fileUri = `file://${track?.fileUrl}`; //
              const trackObj = {
                url: fileUri,
                title: "Bachau Malai",
                artist: "Albatross",
              };
              TrackPlayer.reset();
              TrackPlayer.add(trackObj);
              if (playing) {
                await TrackPlayer.pause();
              } else {
                await TrackPlayer.play();
              }
            }}
          >
            {playing ? (
              <Pause color={"black"} size={40} />
            ) : (
              <Play color={"black"} size={40} />
            )}
          </TouchableOpacity>

          <TouchableOpacity>
            <Image
              source={require("../assets/5-forward.png")}
              className="w-10 h-10 scale-110"
            />
          </TouchableOpacity>
        </View>
        <View className="bg-white rounded-full p-2">
          <TouchableOpacity>
            <ListMusic color={"black"} size={30} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
