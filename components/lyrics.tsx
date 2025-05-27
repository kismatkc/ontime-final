import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { getLyricsById, saveLyricsById } from "~/lib/offlineStorage";

/* ───────── backend URL setup ───────── */
let url: string = `${process.env.EXPO_PUBLIC_BACKEND_URL}/scraper/scrape-lyrics`;
if (process.env.EXPO_PUBLIC_ENVIRONMENT === "development") {
  url = `${process.env.EXPO_PUBLIC_BACKEND_URL}:3001/scrape-lyrics`;
}

async function fetchLyricsFromAPI(
  trackName: string,
  linkIndex: string
): Promise<string[]> {
  // const { data } = await axios.get(`${url}/${trackName}`);
  const { data } = await axios.get(url, {
    params: {
      songName: trackName,
      linkIndex,
    },
  });

  return data.lyrics as string[];
}

interface Props {
  trackId?: string | null;
  trackName?: string | null;
}

const Lyrisc: React.FC<Props> = ({ trackId, trackName }) => {
  const [lyrics, setLyrics] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [overWriteButttonClickCount, setoverWriteButttonClickCount] =
    useState(1);

  /* 1️⃣  First-time load: check cache → else fetch & cache */
  const downloadAndCache = useCallback(async () => {
    if (!trackName) return;
    setLoading(true);
    try {
      const freshLyrics = await fetchLyricsFromAPI(trackName, "0"); // default to first link
      setLyrics(freshLyrics);
      if (trackId) await saveLyricsById(trackId, freshLyrics);
    } finally {
      setLoading(false);
    }
  }, [trackId, trackName]);

  /* 2️⃣  NEW: always fetch new lyrics and overwrite cache */
  const overwriteLyrics = useCallback(
    async (linkIndex: string) => {
      if (!trackName) return;
      setLoading(true);
      try {
        const newLyrics = await fetchLyricsFromAPI(trackName, linkIndex); // always remote
        setLyrics(newLyrics); // update UI immediately
        if (trackId) await saveLyricsById(trackId, newLyrics); // overwrite
      } finally {
        setLoading(false);
      }
    },
    [trackId, trackName]
  );

  /* ---------------- component mount / track change ---------------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!trackName) return;

      // try cache first
      if (trackId) {
        const cached = await getLyricsById(trackId);
        if (cached && !cancelled) {
          setLyrics(cached);
          return;
        }
      }
      if (!cancelled) await downloadAndCache();
    })();
    return () => {
      cancelled = true;
    };
  }, [trackId, trackName, downloadAndCache]);

  /* ---------------------------- UI ---------------------------- */
  return (
    <View className="flex-1 pt-1 pb-2 pl-4">
      {lyrics ? (
        <FlatList
          data={lyrics}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <Text className="text-white font-bold text-xl ">{item}</Text>
          )}
          ListHeaderComponent={
            <TouchableOpacity
              onPress={() => {
                if (overWriteButttonClickCount < 7) {
                  overwriteLyrics(overWriteButttonClickCount.toString());
                } else {
                  Toast.show({
                    text1Style: { fontSize: 16, fontWeight: "bold" },
                    text2Style: { fontSize: 14, fontWeight: "semibold" },
                    visibilityTime: 2000,
                    position: "bottom",
                    type: "info",
                    text1: "Desired Lyrics not found ",
                    text2: "Reseting to most popular lyrics",
                  });
                  setoverWriteButttonClickCount(1);
                  downloadAndCache(); // reset to first link
                }
                setoverWriteButttonClickCount((prev) => prev + 1);
              }} // default to first link
              className="mt-4 self-end pr-2 mb-4"
            >
              <Text className="text-blue-400 font-bold">Change lyrics</Text>
            </TouchableOpacity>
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="white" size="small" />
        </View>
      )}
    </View>
  );
};

export default Lyrisc;
