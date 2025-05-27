import AsyncStorage from "@react-native-async-storage/async-storage";
import { offlineSong } from "~/types";
import RNFetchBlob from "react-native-blob-util";

const STORAGE_KEY = "OFFLINE_SONGS";

// 1. Helper to load the array (or return empty)
export async function loadSongs(): Promise<offlineSong[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  return raw ? JSON.parse(raw) : [];
}

// 2. Helper to save the full array
export async function saveSongs(songs: offlineSong[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}
export async function deleteAllSongs(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

// 3. Call this each time you finish downloading one
export async function pushNewSong(song: offlineSong): Promise<void> {
  // load current list
  const songs = await loadSongs();
  // push the new one
  songs.push(song);
  // save back
  await saveSongs(songs);
}

// 4. Delete a specific song by its ID
export async function deleteSongById(songId: string): Promise<boolean> {
  try {
    // Load current songs
    const songs = await loadSongs();

    // Find the index of the song with the matching ID
    const songIndex = songs.findIndex((song) => song.id === songId);

    // If song not found, return false
    if (songIndex === -1) {
      console.log(`Song with ID ${songId} not found.`);
      return false;
    }

    // Remove the song from the array
    songs.splice(songIndex, 1);

    // Save the updated array back to storage
    await saveSongs(songs);
    console.log(`Song with ID ${songId} has been deleted.`);
    return true;
  } catch (error) {
    console.error("Error deleting song:", error);
    return false;
  }
}

export async function modifySongTitleAndAuthor({
  songId,
  newTitle,
  newAuthor,
}: {
  songId: string;
  newTitle: string;
  newAuthor: string;
}): Promise<boolean> {
  try {
    // 1. Load all songs from AsyncStorage
    const songs = await loadSongs();

    // 2. Find the song to modify
    const songIndex = songs.findIndex((song) => song.id === songId);

    if (songIndex === -1) {
      console.log(`Song with ID ${songId} not found.`);
      return false;
    }

    const currentSong = songs[songIndex];
    const oldFilePath = currentSong.url;

    // 3. Create new file path with updated title
    const { fs } = RNFetchBlob;
    const { DocumentDir } = fs.dirs;
    const newFilePath = `${DocumentDir}/downloads/${newTitle}.wav`;

    // 4. Check if old file exists and rename it
    const oldPath = oldFilePath.replace(/^file:\/\//, "");
    const exists = await fs.exists(oldPath);

    if (exists) {
      // Move/rename the physical file
      await fs.mv(oldPath, newFilePath.replace(/^file:\/\//, ""));
      console.log(`File renamed from ${oldPath} to ${newFilePath}`);
    } else {
      console.warn(`Physical file not found at ${oldPath}`);
    }

    // 5. Update the song object in memory
    songs[songIndex] = {
      ...currentSong,
      title: newTitle,
      artist: newAuthor,
      url: `file://${newFilePath.replace(/^file:\/\//, "")}`,
    };

    // 6. Save updated songs array back to AsyncStorage
    await saveSongs(songs);

    console.log(
      `Song ${songId} updated: title="${newTitle}", artist="${newAuthor}"`
    );
    return true;
  } catch (error) {
    console.error("Error modifying song:", error);
    return false;
  }
}

// 5. Filter songs by title (case-insensitive search)
export async function filterByTitle(query?: string): Promise<offlineSong[]> {
  try {
    // Load all songs
    const allSongs = await loadSongs();

    // If no query provided, empty string, or just whitespace, return all songs
    if (!query || query.trim() === "") {
      return allSongs;
    }

    // Convert query to lowercase for case-insensitive search
    const searchQuery = query.trim().toLowerCase();

    // Filter songs that contain the query in their title
    const filteredSongs = allSongs.filter((song) => {
      // Handle edge case where song.title might be undefined or null
      const songTitle = song.title || "";
      return songTitle.toLowerCase().includes(searchQuery);
    });

    // If no matches found, return all songs as fallback
    if (filteredSongs.length === 0) {
      console.log(
        `No songs found matching query: "${query}". Returning all songs.`
      );
      return allSongs;
    }

    console.log(
      `Found ${filteredSongs.length} songs matching query: "${query}"`
    );
    return filteredSongs;
  } catch (error) {
    console.error("Error filtering songs by title:", error);
    // In case of error, fallback to loading all songs
    return await loadSongs();
  }
}

/** Get cached lyrics for a song (or null if absent) */
export async function getLyricsById(songId: string): Promise<string[] | null> {
  const songs = await loadSongs();
  const song = songs.find((s) => s.id === songId);
  return song?.lyrics ?? null;
}

/** Save / overwrite lyrics for a song */
export async function saveLyricsById(
  songId: string,
  lyrics: string[]
): Promise<void> {
  const songs = await loadSongs();
  const idx = songs.findIndex((s) => s.id === songId);
  if (idx === -1) return; // song not stored offline

  songs[idx] = { ...songs[idx], lyrics }; // overwrite or add
  await saveSongs(songs);
}
