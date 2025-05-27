import { Tabs } from "expo-router";

import {
  Download,
  Heart,
  Music,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react-native";
import { Image, Text, View } from "react-native";
import MainPlayer from "~/components/main-player";
import MiniPlayer from "~/components/mini-player";
import { useTrackStore } from "~/zustand_hooks/useTrackStore";

const MusicLayout = ({}) => {
  const { showMainPlayer, showMiniPlayer } = useTrackStore();
  return (
    <View className="flex-1 relative">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#fc3c44",

          tabBarInactiveTintColor: "grey",
          tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
          tabBarStyle: {
            borderTopWidth: 0,
            paddingTop: 18,
            backgroundColor: "#000000",
          },
        }}
        initialRouteName="index"
      >
        <Tabs.Screen
          name="playlists/index"
          options={{
            title: "playlists",
            tabBarIcon: ({ size, color }) => (
              <Heart size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "songs",
            tabBarIcon: ({ size, color }) => (
              <Music size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="download/index"
          options={{
            title: "Download",
            tabBarIcon: ({ size, color }) => (
              <Download size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      {showMainPlayer && <MainPlayer />}
      {showMiniPlayer && <MiniPlayer />}
    </View>
  );
};

export default MusicLayout;
