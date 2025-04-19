import { View, Clipboard, TouchableOpacity, Text } from "react-native";
import { Textarea } from "./ui/textarea";
import { Copy } from "lucide-react-native";
import { useEffect, useState } from "react";
import Pronounce from "./pronounce";

const InputText = ({
  textAreaOne,
  setTextAreaOne,
  sourceLanguage,
  targetLanguage,
  fetchTranslation,
  translation,
  wordBreakdown,
  fetchWordBreakDOwn,
}: {
  textAreaOne: string;
  setTextAreaOne: (text: string) => void;
  sourceLanguage: string;
  targetLanguage: string;
  fetchWordBreakDOwn: (text: string) => void;
  wordBreakdown: string | null;
  fetchTranslation: (
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ) => void;
  translation: string | null;
}) => {
  const [areaOneCopy, setAreaOneCopy] = useState<boolean>(false);
  const [areaTwoCopy, setAreaTwoCopy] = useState<boolean>(false);

  useEffect(() => {
    if (translation) {
      fetchWordBreakDOwn(translation);
    }
  }, [translation]);

  const handleCopy = (text: string) => {
    if (text.trim().length > 0) {
      Clipboard.setString(text);
    }
  };

  return (
    <View className="flex flex-col mt-8 gap-y-8 px-6">
      <View
        className="bg-background rounded-2xl mt-8 flex flex-col justify-between"
        style={{ height: "30%" }}
      >
        <Textarea
          className="rounded-lg text-foreground font-bold text-2xl"
          multiline={true}
          style={{ borderWidth: 0 }}
          value={textAreaOne}
          onChangeText={(text) => {
            // Allow setting to empty string
            setTextAreaOne(text);
          }}
        />
        <View className="flex flex-row gap-x-3 justify-end items-center p-2">
          <Copy
            color={areaOneCopy ? "green" : "grey"}
            onPress={() => {
              if (!textAreaOne.trim()) return;
              setAreaOneCopy(!areaOneCopy);
              handleCopy(textAreaOne);
              setTimeout(() => {
                setAreaOneCopy(false);
              }, 2000);
            }}
          />
        </View>
      </View>
      <View className="flex items-center justify-center ">
        <TouchableOpacity
          className="bg-green-500 px-5 py-3 rounded-full"
          onPress={() => {
            fetchTranslation(textAreaOne, sourceLanguage, targetLanguage);
          }}
        >
          <Text className="text-foreground text-xl font-semibold">
            Translate
          </Text>
        </TouchableOpacity>
      </View>
      <View
        className="bg-background rounded-2xl mt-8 flex flex-col justify-between"
        style={{ height: "30%" }}
      >
        <View className="grow">
          <Text className="text-foreground text-xl font-semibold p-2">
            {translation ? translation : "Translation will appear here"}
          </Text>
        </View>
        <View className="flex flex-row justify-between items-center">
          <View className="flex">
            {translation &&
              /^[^\s]+$/.test(translation.trim()) &&
              wordBreakdown && (
                <Text className=" text-foreground text-xl font-semibold pl-3">
                  {wordBreakdown}
                </Text>
              )}
          </View>
          <View className="flex flex-row gap-x-3 justify-end items-center p-2">
            <Copy
              color={areaTwoCopy ? "green" : "grey"}
              onPress={() => {
                if (!translation) return;
                setAreaTwoCopy(!areaTwoCopy);
                handleCopy(translation);
                setTimeout(() => {
                  setAreaTwoCopy(false);
                }, 2000);
              }}
            />

            <Pronounce
              text={translation || ""}
              targetLanguage={targetLanguage}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default InputText;
