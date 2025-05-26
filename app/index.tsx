import {
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Link } from "expo-router";
import DownloadUpdate from "~/lib/update";

// Define the specific topic paths
export type TopicPath =
  | "/streaks"
  | "/sleep"
  | "/ttc"
  | "/weather"
  | "/music"
  | "/translator"
  | "/tech_hype_and_llm"
  | "/french_roadmap";

export type TopicTitle =
  | "Streaks"
  | "Sleep"
  | "TTC"
  | "Weather"
  | "Music"
  | "Translator"
  | "Tech hype and LLM"
  | "French roadmap";

export interface Topic {
  title: TopicTitle;
  path: TopicPath;
}

export const topics: Topic[] = [
  { title: "Streaks", path: "/streaks" },
  { title: "Sleep", path: "/sleep" },
  { title: "TTC", path: "/ttc" },
  { title: "Weather", path: "/weather" },
  { title: "Music", path: "/music" },
  { title: "Translator", path: "/translator" },
  { title: "Tech hype and LLM", path: "/tech_hype_and_llm" },
  // { title: "Shifts", path: "/shifts" },
  { title: "French roadmap", path: "/french_roadmap" },
];

export default function Home() {
  return (
    <View className="h-full px-3">
      <View className="flex items-start pl-2 py-4 ">{<DownloadUpdate />}</View>
      <FlatList
        className="mt-4"
        data={topics}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Link href={`${item.path}`} asChild>
            <TouchableOpacity className="bg-card-light rounded-3xl mb-4 h-48 flex items-center justify-center ">
              <Text className="text-3xl font-bold text-foreground">
                {item.title}
              </Text>
            </TouchableOpacity>
          </Link>
        )}
        keyExtractor={(item) => item.title}
      />
    </View>
  );
}
