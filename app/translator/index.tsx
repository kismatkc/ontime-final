import { Repeat } from "lucide-react-native";
import { useEffect, useState } from "react";

import {
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import InputText from "~/components/input-text-box";
import { useTranslator } from "~/lib/use-translator";

const Translator = () => {
  const [clicked, setClicked] = useState<boolean>(false);
  const [textAreaOne, setTextAreaOne] = useState<string>("");
  const {
    translation,
    setTranslation,
    fetchTranslation,
    wordBreakdown,
    fetchWordBreakDOwn,
    setWordBreakdown,
  } = useTranslator();

  useEffect(() => {
    if (!(textAreaOne.length > 0)) {
      setTranslation(null);
      setWordBreakdown(null);
    }
  }, [textAreaOne, translation]);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="bg-background_translator h-full ">
        <View className="mt-20 flex flex-row justify-evenly ">
          <View
            className="bg-background grow flex-row justify-center items-center rounded-lg mx-3"
            data-lan={clicked ? "fr" : "en"}
          >
            <Text className="text-foreground text-2xl font-medium">
              {clicked ? "French" : "English"}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-blue-500 rounded-full p-2"
            onPress={() => setClicked(!clicked)}
          >
            <Repeat color={"white"} size={30} />
          </TouchableOpacity>
          <View
            className="bg-background grow flex-row justify-center items-center rounded-lg mx-2"
            data-lan={clicked ? "fr" : "en"}
          >
            <Text className="text-foreground text-2xl font-medium">
              {clicked ? "English" : "French"}
            </Text>
          </View>
        </View>
        <InputText
          textAreaOne={textAreaOne}
          setTextAreaOne={setTextAreaOne}
          sourceLanguage={clicked ? "fr" : "en"}
          translation={translation}
          fetchTranslation={fetchTranslation}
          targetLanguage={clicked ? "en" : "fr"}
          wordBreakdown={wordBreakdown}
          fetchWordBreakDOwn={fetchWordBreakDOwn}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Translator;
