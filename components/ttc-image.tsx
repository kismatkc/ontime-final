import * as React from "react";
import { Image, TouchableOpacity } from "react-native";
import { Asset } from "expo-asset";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Text } from "~/components/ui/text";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { MapIcon } from "lucide-react-native";
export default function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <TouchableOpacity>
          <MapIcon color={"orange"} />
        </TouchableOpacity>
      </DialogTrigger>
      <DialogContent className="flex flex-1  p-2">
        <ReactNativeZoomableView
          initialZoom={0.2}
          maxZoom={2}
          minZoom={0.2}
          bindToBorders
        >
          <Image source={require("../assets/ttcMap.png")} />
        </ReactNativeZoomableView>
      </DialogContent>
    </Dialog>
  );
}
