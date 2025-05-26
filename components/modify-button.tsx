import { Text, View, Animated } from "react-native";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useFetchTtcData } from "../lib/fetch-datas";
const AnimatedInput = Animated.createAnimatedComponent(Input);
const allowedValue = /^\d+(,\d+)*$/;
const ModifyStops = () => {
  const { stops, refreshBusTimes } = useFetchTtcData();
  const fadeInInitial = useRef(new Animated.Value(0)).current;
  const fadeOutInitial = useRef(new Animated.Value(1)).current;
  const [showInput, setShowInput] = useState(false);
  const [value, setValue] = useState<string>(stops);

  useEffect(() => {
    setValue(stops);
  }, [stops]);

  const FadeInInput = () => {
    Animated.timing(fadeInInitial, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };
  const FadeOutInput = () => {
    Animated.timing(fadeOutInitial, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View className="flex flex-row items-center gap-x-2 my-2 flex-wrap gap-y-2 mt-4">
      <AnimatedInput
        value={value}
        onChangeText={(value) => {
          setValue(value);
        }}
        className=" bg-white text-black"
        placeholder={"100,200,300..."}
        style={{
          opacity: !showInput ? fadeInInitial : fadeOutInitial,
          pointerEvents: !showInput ? "none" : "auto",
        }}
      />
      {showInput ? (
        <Button
          className="bg-green-500"
          disabled={!allowedValue.test(value) || value === stops}
          onPress={async () => {
            try {
              const stops = {
                stops: ` [${value}]`,
              };

              const response = await axios.post(
                "https://puppeter-kismat-kcs-projects.vercel.app/modify-stops",
                stops
              );
              await refreshBusTimes();
              FadeOutInput();
              setShowInput(false);
            } catch (error) {
              console.log(error);
            }
          }}
        >
          <Text className="text-white text-lg font-semibold">Confirm</Text>
        </Button>
      ) : (
        <Button
          variant="destructive"
          onPress={async () => {
            await refreshBusTimes();

            setShowInput(true);
            FadeInInput();
          }}
        >
          <Text className="text-white text-lg font-semibold">Modify stops</Text>
        </Button>
      )}
    </View>
  );
};

export default ModifyStops;
