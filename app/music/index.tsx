import { Edit, Ellipsis, Search, Trash } from "lucide-react-native";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { Input } from "~/components/ui/input";
import { TrackType, useTrackStore } from "~/zustand_hooks/useTrackStore";
import { loadSongs, deleteSongById } from "~/lib/offlineStorage";
import { useState, useEffect, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";

import EditTitleAndAuthor from "~/components/edit-title-author";

const Songs = () => {
  const {
    setShowMiniPlayer,
    setTrack,
    track,
    addToQueue,
    skipToTrack,
    play,
    newDownloadedSong,
    setNewDownloadedSong,
  } = useTrackStore();

  const [songs, setSongs] = useState<TrackType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Initial loading logic - loads all songs on mount
  async function loadInitialSongs(setSongs: (songs: TrackType[]) => void) {
    try {
      const fresh: any = await loadSongs();
      setSongs(fresh); // Load all songs initially
    } catch (error) {
      console.log("Error loading initial songs:", error);
      setSongs([]);
    }
  }

  // Search-only logic - filters songs when user types
  async function searchSongs(
    query: string,
    setSongs: (songs: TrackType[]) => void
  ) {
    // Only search if there's a query
    if (query.trim().length === 0) {
      // When search is cleared, reload all songs
      await loadInitialSongs(setSongs);
      return;
    }

    try {
      // 1️⃣ hit disk
      const fresh: any = await loadSongs();

      // 2️⃣ filter with current query
      const q = query.trim().toLowerCase();
      const result = fresh.filter(
        (s: any) =>
          s.title.toLowerCase().includes(q) ||
          s.artist?.toLowerCase().includes(q)
      );

      setSongs(result); // 👈 filtered results
    } catch (error) {
      console.log("Error searching songs:", error);
      setSongs([]);
    }
  }

  useEffect(() => {
    // Load initial songs when component mounts
    if (newDownloadedSong) {
      // If a new song was downloaded, refresh the list
      setSongs((prevSongs) => [...prevSongs, newDownloadedSong]);
      setNewDownloadedSong(null); // Reset the newDownloadedSong state
    }
  }, [newDownloadedSong]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const id = setTimeout(() => searchSongs(searchQuery, setSongs), 400);
      return () => clearTimeout(id);
    } else {
      // When search is cleared, reload all songs
      loadInitialSongs(setSongs);
    }
  }, [searchQuery]);

  useEffect(() => {
    addToQueue(songs); // Update the queue whenever songs change
  }, [songs]);

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
              className="flex-row items-center justify-between gap-x-3 "
            >
              <TouchableOpacity
                className="flex-row items-center gap-x-3 my-3 shrink "
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
                <View className="flex-1">
                  <Text
                    className="text-white text-xl font-bold"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {song.title}
                  </Text>
                  <Text className="text-[#909097] text-xl font-semibold">
                    {song.artist}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* ── Context menu ─────────────────────────────────── */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="grow ">
                  <Ellipsis color="white" />
                </DropdownMenuTrigger>

                <DropdownMenuContent className="-mt-16">
                  <DropdownMenuItem
                    onPress={async () => {
                      await deleteSongById(song.id);
                      await searchSongs(searchQuery, setSongs); // keeps current query intact
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
