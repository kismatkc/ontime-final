import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import * as Progress from "react-native-progress";
import { nanoid } from "nanoid/non-secure";
import { DownloadCloud } from "lucide-react-native";

import { getMp3FromYouTube, saveMp3ToDevice } from "~/lib/audioControllers";
import { useTrackStore } from "~/zustand_hooks/useTrackStore";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

/* ---------- URL helper ---------- */
function scraperBase(): string {
  if (process.env.EXPO_PUBLIC_ENVIRONMENT === "development") {
    return `${process.env.EXPO_PUBLIC_BACKEND_URL}:3001`;
  }
  return `${process.env.EXPO_PUBLIC_BACKEND_URL}/scraper`;
}

/* ---------- YouTube guard ---------- */
function isNotYouTubeUrl(url?: string) {
  if (!url) return true;
  return !/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url);
}

/* ---------- component ---------- */
const DownloadSongs: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState<string>();
  const [disabled, setDisabled] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | any>(null);
  const { setNewDownloadedSong } = useTrackStore();

  useEffect(() => setDisabled(isNotYouTubeUrl(youtubeUrl)), [youtubeUrl]);

  /* Clear interval on unmount */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /* ---------- Progress polling every 2 seconds ---------- */
  function startProgressPolling(id: string) {
    const base = scraperBase();

    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${base}/progress/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProgress(data.progress || 0);

          if (data.progress >= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
          }
        }
      } catch (error) {
        console.log("Progress error:", error);
      }
    }, 2000);
  }

  /* ---------- Download flow ---------- */
  async function handleDownload() {
    if (!youtubeUrl) return;

    const id = nanoid();

    try {
      setBusy(true);
      setProgress(0);

      startProgressPolling(id);

      const resp = await getMp3FromYouTube(youtubeUrl, id);
      if (!resp) throw new Error("No response");

      const song: any = await saveMp3ToDevice(resp);
      if (song) setNewDownloadedSong(song);

      setProgress(1);

      Toast.show({
        type: "success",
        text1: "The music is available offline now",
        position: "bottom",
        swipeable: true,
        visibilityTime: 2000,
      });

      router.push("/music");
    } catch (err) {
      console.log("Download error:", err);
      Toast.show({
        type: "error",
        text1: "Please try again",
        position: "bottom",
        swipeable: true,
      });
    } finally {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setBusy(false);
      setProgress(0);
      setYoutubeUrl(undefined);
    }
  }

  /* ---------- UI ---------- */
  return (
    <View style={styles.container}>
      <Input
        placeholder="https://www.youtube.com/watch?v=..."
        value={youtubeUrl}
        onChangeText={setYoutubeUrl}
        style={[styles.input, busy && styles.inputDisabled]}
        editable={!busy}
        selectTextOnFocus={!busy}
      />

      {busy && (
        <View style={styles.progressBox}>
          <Progress.Bar
            progress={progress}
            width={null}
            height={10}
            borderWidth={0}
            unfilledColor="#211A4D"
            color="#10B981"
            animated={true}
          />
          <Text style={styles.percentTxt}>{Math.floor(progress * 100)}%</Text>
        </View>
      )}

      <Button
        className="self-center bg-green-700 flex flex-row items-center"
        disabled={disabled || busy}
        onPress={handleDownload}
      >
        {busy ? (
          <ActivityIndicator />
        ) : (
          <>
            <DownloadCloud size={20} color="white" />
            <Text className="text-foreground px-2 text-xl font-semibold">
              Download
            </Text>
          </>
        )}
      </Button>
    </View>
  );
};

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A071E",
    paddingHorizontal: 8,
    justifyContent: "center",
    gap: 16,
  },
  input: { width: "100%" },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: "#1A1A2E",
  },
  progressBox: { marginVertical: 12 },
  percentTxt: {
    color: "#fff",
    marginTop: 6,
    alignSelf: "flex-end",
    fontVariant: ["tabular-nums"],
  },
});

export default DownloadSongs;
