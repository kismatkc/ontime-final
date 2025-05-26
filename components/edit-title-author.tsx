import React, { useState } from "react";
import { View } from "react-native";
import { Edit } from "lucide-react-native";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { modifySongTitleAndAuthor } from "~/lib/offlineStorage";
import { Button } from "./ui/button";

export default function EditProfile({
  songTitle,
  songAuthor,
  songId,
}: {
  songTitle: string;
  songAuthor: string;
  songId: string;
}) {
  const [title, setTitle] = useState(songTitle);
  const [artist, setArtist] = useState(songAuthor);

  const isSaveDisabled = () => {
    // Check if fields are empty
    if (title.trim() === "" || artist.trim() === "") {
      return true;
    }

    // Check if no changes were made
    return title === songTitle && artist === songAuthor;
  };

  return (
    <AlertDialog className="flex flex-col">
      <AlertDialogTrigger>
        <Text className="text-base font-semibold text-red-500">Edit</Text>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-full max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit details</AlertDialogTitle>
        </AlertDialogHeader>
        <View className="gap-y-4 py-4">
          <View className="gap-y-2">
            <Label nativeID="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              aria-labelledby="title"
              value={title}
              onChangeText={setTitle}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </View>

          <View className="gap-y-2">
            <Label nativeID="username" className="text-sm font-medium">
              Artist
            </Label>
            <Input
              aria-labelledby="username"
              value={artist}
              onChangeText={setArtist}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </View>
        </View>

        <AlertDialogFooter className="flex flex-col ">
          <AlertDialogAction
            className={isSaveDisabled() ? "" : "bg-green-500 "}
            disabled={isSaveDisabled()}
            onPress={() => {
              modifySongTitleAndAuthor({
                songId,
                newTitle: title,
                newAuthor: artist,
              });
            }}
          >
            <Text className="text-white font-bold">Save changes</Text>
          </AlertDialogAction>
          <AlertDialogCancel className="bg-red-500" asChild>
            <Button>
              <Text className="text-white font-bold ">Cancel</Text>
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
