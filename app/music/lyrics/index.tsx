import axios from "axios";
import { Search, ArrowRightCircle } from "lucide-react-native";
import React, { useState, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import Toast from "react-native-toast-message";

/* ───────── backend URL setup ───────── */
let url: string = `${process.env.EXPO_PUBLIC_BACKEND_URL}/scraper/scrape-lyrics`;
if (process.env.EXPO_PUBLIC_ENVIRONMENT === "development") {
  url = `${process.env.EXPO_PUBLIC_BACKEND_URL}:3001/scrape-lyrics`;
}

/* REST helper (same query params as your other component) */
async function fetchLyrics(trackName: string, linkIndex: string) {
  const { data } = await axios.get(url, {
    params: { songName: trackName, linkIndex },
  });
  return data.lyrics as string[];
}

/* ─────────────────────────────────────────────────────────── */

const AnySongLyrics: React.FC = () => {
  const [query, setQuery] = useState("");
  const [lyrics, setLyrics] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [linkIndex, setLinkIndex] = useState(0); // 0-based index for variants
  const overWriteLimit = 7; // cycle 0-6 then reset

  /* First (or reset) fetch */
  const loadLyrics = useCallback(async (song: string) => {
    if (!song) return;
    Keyboard.dismiss();
    setLoading(true);
    try {
      const res = await fetchLyrics(song, "0");
      setLyrics(res);
      setLinkIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /* Overwrite / next-translation */
  const overwriteLyrics = useCallback(async () => {
    if (!query) return;

    // exceeded limit → toast + reset
    if (linkIndex >= overWriteLimit - 1) {
      Toast.show({
        text1: "Desired lyrics not found",
        text2: "Resetting to most popular lyrics",
        position: "bottom",
        type: "info",
        visibilityTime: 2000,
        text1Style: { fontSize: 16, fontWeight: "bold" },
        text2Style: { fontSize: 14 },
      });
      await loadLyrics(query);
      return;
    }

    // fetch next candidate
    const nextIdx = linkIndex + 1;
    setLoading(true);
    try {
      const res = await fetchLyrics(query, nextIdx.toString());
      setLyrics(res);
      setLinkIndex(nextIdx);
    } finally {
      setLoading(false);
    }
  }, [query, linkIndex, loadLyrics]);

  /* Clear view if user empties the text field */
  useEffect(() => {
    if (query.trim() === "") {
      setLyrics(null);
      setLinkIndex(0);
    }
  }, [query]);

  /* ────────────────────────── UI ────────────────────────── */
  return (
    <SafeAreaView className="flex-1 bg-[#0A071E]">
      {/* Safe padding (pt-10 leaves room if you have absolute headers) */}
      <View className="pt-10 px-4 flex-1">
        {/* Search bar */}
        <View className="flex-row items-center bg-gray-800/90 rounded-full h-12 px-4 border border-gray-700">
          {/* Left icon (tap to search) */}
          <TouchableOpacity onPress={() => loadLyrics(query.trim())}>
            <Search size={24} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Text input */}
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="type any song name"
            placeholderTextColor="#9CA3AF"
            onSubmitEditing={() => loadLyrics(query.trim())}
            className="flex-1 text-[16px] text-white ml-3"
            returnKeyType="search"
          />

          {/* Explicit search button */}
          <TouchableOpacity
            onPress={() => loadLyrics(query.trim())}
            className="pl-3"
          >
            <ArrowRightCircle size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Lyrics list / loader */}
        <View className="flex-1 pt-6">
          {lyrics ? (
            <FlatList
              data={lyrics}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <Text className="text-white font-bold text-xl">{item}</Text>
              )}
              ListHeaderComponent={
                <TouchableOpacity
                  onPress={overwriteLyrics}
                  className="self-end pr-2 mb-4"
                >
                  <Text className="text-blue-400 font-bold">Change lyrics</Text>
                </TouchableOpacity>
              }
            />
          ) : loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="white" size="small" />
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AnySongLyrics;
