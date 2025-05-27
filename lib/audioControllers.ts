import axios from "axios";
import RNFetchBlob from "react-native-blob-util";
import { offlineSong } from "~/types";
import { pushNewSong } from "./offlineStorage";

let url: string = `${process.env.EXPO_PUBLIC_BACKEND_URL}/scraper`;
if (process.env.EXPO_PUBLIC_ENVIRONMENT === "development") {
  url = `${process.env.EXPO_PUBLIC_BACKEND_URL}:3001`;
}

function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return youtubeRegex.test(url);
}

export async function saveMp3ToDevice({
  base64Buffer,
  title,
  author,
  id,
}: {
  base64Buffer: string;
  title: string;
  author: string;
  id: string;
}) {
  try {
    const { fs } = RNFetchBlob;

    const { DocumentDir } = fs.dirs; // iOS sandboxed Documents folder

    // wavBuffer is your Buffer from ffmpeg conversion
    const filePath = `${DocumentDir}/downloads/${title}.mp3`;
    await RNFetchBlob.fs.writeFile(filePath, base64Buffer, "base64");
    const offlineSong: offlineSong = {
      id,
      title,
      artist: author || "Unknown",
      url: filePath,
    };

    pushNewSong(offlineSong);

    return offlineSong;
  } catch (error) {
    console.log("Error saving file:", error);
  }
}

export async function listDownloadedSongs() {
  const { fs } = RNFetchBlob;
  const { DocumentDir } = fs.dirs; // iOS Documents folder
  const downloadDir = `${DocumentDir}/downloads`;

  try {
    // 1. Get raw list of all items in downloads/
    const allItems = await fs.ls(downloadDir); // returns string[] :contentReference[oaicite:8]{index=8}

    const audioFiles = allItems.filter(
      (name) =>
        name.toLowerCase().endsWith(".mp3") ||
        name.toLowerCase().endsWith(".wav") ||
        name.toLowerCase().endsWith(".m4a")
    );

    return audioFiles;
  } catch (err) {
    console.error("Failed to list downloads folder:", err);
    return [];
  }
}

export async function deleteOfflineFile(fileUri: string): Promise<void> {
  try {
    // RNFetchBlob expects a filesystem path without the "file://" prefix
    const path = fileUri.replace(/^file:\/\//, "");

    // 1. Check if it exists
    const exists = await RNFetchBlob.fs.exists(path);
    if (!exists) {
      console.warn(`deleteOfflineFile: file not found at ${path}`);
      return;
    }

    // 2. Delete it
    await RNFetchBlob.fs.unlink(path);
    console.log(`deleteOfflineFile: successfully deleted ${path}`);
  } catch (error) {
    console.error("deleteOfflineFile: error deleting file", error);
  }
}

export async function getMp3FromYouTube(youtubeUrl: string): Promise<{
  base64Buffer: string;
  title: string;
  author: string;
} | null> {
  if (!isValidYouTubeUrl(youtubeUrl)) {
    console.error("Invalid YouTube URL");
    return null;
  }

  try {
    const response = await axios.get(`${url}/download-mp3`, {
      params: {
        url: youtubeUrl,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching MP3:", error);
    return null;
  }
}
