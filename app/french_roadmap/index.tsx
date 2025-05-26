import axios from "axios";
import { use, useEffect, useRef, useState } from "react";
import { ScrollView, Text, View, Animated } from "react-native";
import DropdownComponent from "~/components/guitar-roadmap";
import frenchJourneyData, { frenchJourneyDataType } from "~/french_journey";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { X } from "lucide-react-native";
let getTopicUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}/get-last-french-topic`;

if (process.env.EXPO_PUBLIC_ENVIRONMENT === "development") {
  getTopicUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}:3000/get-last-french-topic`;
}

let setTopicUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}/set-last-french-topic`;

if (process.env.EXPO_PUBLIC_ENVIRONMENT === "development") {
  setTopicUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}:3000/set-last-french-topic`;
}

// import { Text } from '~/components/ui/text';
async function getLastFrenchToppic(
  setCurrentTopic: (topic: frenchJourneyDataType) => void
) {
  try {
    const response = await axios.get(getTopicUrl);

    const topic = frenchJourneyData.find(
      (item) => item.week === response.data.data
    );
    if (!topic) return;
    setCurrentTopic(topic);
  } catch (error) {
    console.log(error);
  }
}
async function setLastFrenchToppic(currentTopic: frenchJourneyDataType) {
  try {
    await axios.post(setTopicUrl, {
      topic: currentTopic.week,
    });
  } catch (error) {
    console.log(error);
  }
}
const FrenchRoadmap = ({}) => {
  const [currentTopic, setCurrentTopic] = useState(frenchJourneyData[0]);
  const scrollViewRef = useRef<ScrollView>(null);
  const offsets = useRef<{ [key: string]: number }>({});
  const isFirstRender = useRef(true);
  const glowAnim = new Animated.Value(0);

  useEffect(() => {
    getLastFrenchToppic(setCurrentTopic);
  }, []);

  useEffect(() => {
    if (!currentTopic) return;

    setLastFrenchToppic(currentTopic);
    const offset = offsets.current[currentTopic.week];

    if (offset !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: offset - 100,
        animated: !isFirstRender.current, // Changed to false for immediate positioning without animation
      });
      isFirstRender.current = false; // Set to false after the first render
    }
  }, [currentTopic]);
  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1], // Shadow opacity varies from 20% to 80%
  });

  useEffect(() => {
    if (!currentTopic) return;
    // Step 3: Create an infinite loop animation
    Animated.loop(
      // Step 4: Define a sequence of animations
      Animated.sequence([
        // Step 5: Animate to full glow (0 → 1)
        Animated.timing(glowAnim, {
          toValue: 1, // Target value
          duration: 1000, // Duration in milliseconds
          useNativeDriver: false, // Required for animating certain properties
        }),
        // Step 6: Animate back to normal (1 → 0)
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start(); // Step 7: Start the animation
  }, [currentTopic]);

  return (
    <View className="flex flex-1 items-center ">
      <View className="absolute top-0 left-0 right-0 z-10 flex-row justify-between items-center px-3 mt-14">
        <DropdownComponent
          frenchJourneyData={frenchJourneyData}
          currenTopic={currentTopic}
          setCurrentTopic={setCurrentTopic}
        />
      </View>

      {/* <View className="flex flex-1 items-center justify-center "></View> */}
      <ScrollView className="flex-1 w-full mt-[18.5rem]" ref={scrollViewRef}>
        <View className="flex flex-1 items-start ml-10">
          <View className="bg-[#00563B] p-2 rounded-md border-2 -ml-4">
            <Text className="text-white text-xl font-semibold">
              French journey
            </Text>
          </View>

          {frenchJourneyData.map((item, i) => (
            <View
              className="flex-col justify-center items-center "
              key={++i}
              onLayout={(event) => {
                const layout = event.nativeEvent.layout;

                offsets.current[item.week] = layout.y;
              }}
            >
              <View className="flex flex-row ">
                <Animated.View
                  className="h-36 w-2  "
                  style={{
                    backgroundColor:
                      item.week <= currentTopic.week ? "#00563B" : "grey",
                    opacity:
                      item.week === currentTopic.week ? shadowOpacity : 1,
                  }}
                ></Animated.View>
              </View>

              <Animated.View
                className="rounded-full w-24 h-24 flex items-center justify-center "
                style={{
                  borderColor:
                    item.week <= currentTopic.week ? "#00563B" : "grey",
                  borderWidth: item.week === currentTopic.week ? 11 : 10,
                  opacity: item.week === currentTopic.week ? shadowOpacity : 1,
                }}
              >
                <View className="flex flex-row flex-1 items-center  w-full">
                  <View className="flex flex-col items-center justify-center  ml-3">
                    <Text className="text-lg font-bold  text-foreground">
                      Week
                    </Text>
                    <Text className="text-xl font-bold  text-foreground">
                      {++i}
                    </Text>
                  </View>
                  <View className="flex flex-row items-center">
                    <View
                      className="h-2 w-36   ml-5"
                      style={{
                        backgroundColor:
                          item.week <= currentTopic.week ? "#00563B" : "grey",
                      }}
                    ></View>

                    <Dialog>
                      <DialogTrigger asChild className="opacity-1">
                        <Button variant="outline">
                          <Text className="text-foreground font-semibold opacity-1">
                            Show content
                          </Text>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] flex-col ">
                        <DialogClose className=" self-end mt-4 ">
                          <X className="text-foreground" />
                        </DialogClose>
                        <Text className="self-center text-foreground font-bold text-xl ">
                          {item.label}
                        </Text>
                        <ScrollView>
                          <Text className="text-foreground font-semibold ">
                            {item.value}
                          </Text>
                        </ScrollView>
                      </DialogContent>
                    </Dialog>
                  </View>
                </View>
              </Animated.View>
              <Animated.View
                className="h-36 w-2  "
                style={{
                  backgroundColor:
                    item.week <= currentTopic.week ? "#00563B" : "grey",
                  opacity: item.week === currentTopic.week ? shadowOpacity : 1,
                }}
              ></Animated.View>
            </View>
          ))}

          <View className="bg-[#00563B] p-2 rounded-md">
            <Text className="text-foreground text-xl font-semibold">
              Congrats
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default FrenchRoadmap;
