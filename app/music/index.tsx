import { Edit, Ellipsis, Search, Trash } from "lucide-react-native";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { Input } from "~/components/ui/input";
import { TrackType, useTrackStore } from "~/hooks/useTrackStore";
import { loadSongs, deleteSongById } from "~/lib/offlineStorage";
import { offlineSong } from "~/types";
import { useState, useEffect, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { useFocusEffect } from "@react-navigation/native";

import EditTitleAndAuthor from "~/components/edit-title-author";

const Songs = () => {
  const { setShowMiniPlayer, setTrack, track, addToQueue, skipToTrack, play } =
    useTrackStore();

  const [songs, setSongs] = useState<TrackType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  /** Always pull the latest library, then apply the current query */
  const refreshSongs = useCallback(async () => {
    const library: any = await loadSongs(); // 1️⃣ read disk

    const q = searchQuery.trim().toLowerCase(); // 3️⃣ filter (if any)
    setSongs(
      q.length === 0
        ? library
        : library.filter(
            (s: any) =>
              s.title.toLowerCase().includes(q) ||
              s.artist?.toLowerCase().includes(q)
          )
    );
  }, [searchQuery]);

  useFocusEffect(() => {
    refreshSongs(); // Refresh whenever this screen gains focus
  });

  useEffect(() => {
    addToQueue(songs); // Update the queue whenever songs change
  }, [songs]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshSongs();
    }, 300); // 300ms debounce time
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery, refreshSongs]);
  return (
    <View className="flex-1 bg-black">
      <Text className="text-white text-4xl mt-12 ml-2 font-bold">Songs</Text>

      {/* ── Search box ────────────────────────────────────────────── */}
      <View className="flex-row items-center gap-x-3 mt-6">
        <Search color="#909097" size={22} />
        <Input
          placeholder="Find songs"
          placeholderTextColor="#909097"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 bg-[#252525] text-2xl font-bold text-white"
        />
      </View>

      {/* ── Song list ─────────────────────────────────────────────── */}
      <ScrollView className={`mt-6 flex-1 ${track ? "mb-32" : ""}`}>
        {songs.length === 0 ? (
          <Text className="text-center text-[#909097] text-xl mt-8">
            No songs found
          </Text>
        ) : (
          songs.map((song) => (
            <View
              key={song.id}
              className="flex-row items-center justify-between"
            >
              <TouchableOpacity
                className="flex-row items-center gap-x-3 my-3"
                onPress={() => {
                  setShowMiniPlayer(true);
                  setTrack(song);
                  skipToTrack(song.id);
                  play();

                  /* TODO: start playback */
                }}
              >
                <Image
                  source={require("~/assets/unknown_track.png")}
                  className="w-16 h-16 rounded-lg"
                />
                <View>
                  <Text className="text-white text-2xl font-bold">
                    {song.title.length > 28
                      ? song.title.slice(0, 28) + "…"
                      : song.title}
                  </Text>
                  <Text className="text-[#909097] text-xl font-semibold">
                    {song.artist}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* ── Context menu ─────────────────────────────────── */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Ellipsis color="white" />
                </DropdownMenuTrigger>

                <DropdownMenuContent className="-mt-16">
                  <DropdownMenuItem
                    onPress={async () => {
                      await deleteSongById(song.id);
                      await refreshSongs(); // keeps current query intact
                    }}
                    className="flex-row gap-x-3"
                  >
                    <Trash color="red" size={16} />
                    <Text className="font-bold text-red-500">Delete</Text>
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <Edit color="red" size={16} />
                    <EditTitleAndAuthor
                      songTitle={song.title}
                      songAuthor={song.artist}
                      songId={song.id}
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default Songs;
