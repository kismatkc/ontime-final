import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { Link } from "expo-router";
import { SafeAreaView } from "react-native";
export type TopicTitle =
  | "Sleep"
  | "TTC"
  | "Weather"
  | "Translator"
  | "Tech hype and LLM"
  | "Shifts"
  | "Streaks"
  | "Music"
  | "Food"
  | "Guitar";

export const topics: { title: TopicTitle }[] = [
  { title: "Sleep" },
  { title: "TTC" },
  { title: "Weather" },
  { title: "Translator" },
  { title: "Tech hype and LLM" },
  { title: "Shifts" },
  { title: "Streaks" },
  { title: "Guitar" },
  { title: "Music" },
  { title: "Food" },
];

export default function Home() {
  return (
    <View className="h-full px-3">
      <FlatList
        data={topics}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Link href={`/${item.title.toLowerCase()}`} asChild>
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
