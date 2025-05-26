import axios from "axios";
import { Activity } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Text, View, FlatList, ActivityIndicator } from "react-native";

let url: string = `${process.env.EXPO_PUBLIC_BACKEND_URL}/scraper/scrape-lyrics`;
if (process.env.EXPO_PUBLIC_ENVIRONMENT === "development") {
  url = `${process.env.EXPO_PUBLIC_BACKEND_URL}:3001/scrape-lyrics`;
}

async function getLyrics(
  trackName: string | null,
  setLyrics: (lyrics: string[]) => void
) {
  try {
    if (!trackName) {
      console.log("No track name provided");
      return;
    }
    const response = await axios.get(`${url}/${trackName}`);
    const lyrics = response.data.lyrics;
    setLyrics(lyrics);
  } catch (error) {
    console.log(error);
  }
}

const Lyrisc = ({ trackName }: { trackName: string | null }) => {
  const [lyrics, setLyrics] = useState<string[] | null>(null);
  useEffect(() => {
    getLyrics(trackName, setLyrics);
  }, [trackName]);

  return (
    <View className="flex-1 pt-1 pb-2 pl-4 ">
      {lyrics ? (
        <FlatList
          data={lyrics}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <Text className="text-white font-bold text-xl ">{item}</Text>
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center ">
          <ActivityIndicator color={"white"} size="small" />
        </View>
      )}
    </View>
  );
};

export default Lyrisc;
