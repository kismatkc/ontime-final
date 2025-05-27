import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import { getMp3FromYouTube, saveMp3ToDevice } from "~/lib/audioControllers";
import { useTrackStore } from "~/zustand_hooks/useTrackStore";

function isNotYouTubeUrl(url: string | undefined) {
  if (!url) return true;
  // Regex that matches common YouTube URL patterns
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;

  // Return true if it does NOT match a YouTube URL
  return !youtubeRegex.test(url);
}

const DownloadSongs = ({}) => {
  const [youtbeUrl, setYoutbeUrl] = useState<string | undefined>(undefined);
  const [downloadButton, setDownloadButton] = useState<boolean>(
    isNotYouTubeUrl(youtbeUrl)
  );

  const [downloading, setDownloading] = useState(false);
  const { setNewDownloadedSong } = useTrackStore();

  return (
    <View className=" flex flex-col justify-center gap-y-4 px-2 bg-[#0A071E] h-full">
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
            const response = await getMp3FromYouTube(youtbeUrl);

            if (!response) {
              Toast.show({
                type: "error",
                text1: "Please try again",
                position: "bottom",
                swipeable: true,
              });
              return;
            }
            const newSong: any = await saveMp3ToDevice(response as any);

            if (newSong) {
              setNewDownloadedSong(newSong);
            }

            Toast.show({
              type: "success",
              text1: "The music is available offline now",
              position: "bottom",
              swipeable: true,
              visibilityTime: 2000,
            });

            router.push("/music");
            setDownloading(false);
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
  );
};

export default DownloadSongs;
