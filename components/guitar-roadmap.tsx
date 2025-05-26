import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { frenchJourneyDataType } from "~/french_journey";
import { Button } from "./ui/button";
import useDecision from "./decision-dialog";
import { useColorScheme } from "~/lib/useColorScheme";
import { colorScheme } from "nativewind";

const DropdownComponent = ({
  frenchJourneyData,
  currenTopic,
  setCurrentTopic,
}: {
  frenchJourneyData: frenchJourneyDataType[];
  currenTopic: frenchJourneyDataType;
  setCurrentTopic: (item: frenchJourneyDataType) => void;
}) => {
  const [showSelect, setShowSelect] = useState(false);

  const { colorScheme, isDarkColorScheme } = useColorScheme();

  const { DecisionDialog, getDecision } = useDecision({
    dialogTitle: "Are you sure?",
    yesButtonText: "Yes",
    noButtonText: "No",
  });

  return (
    <View className="flex-1 ">
      <Text className="text-xl font-bold ml-4 mb-1 text-foreground">
        Current Level: {currenTopic.label}
      </Text>

      <View className="flex-1 ">
        <Button
          className={`self-end w-40 ${
            showSelect ? "bg-red-500" : "bg-green-500"
          }`}
          onPress={async () => {
            if (showSelect) {
              setShowSelect(!showSelect);
            } else {
              const decision = await getDecision();
              if (decision) {
                setShowSelect(!showSelect);
              }
            }
          }}
        >
          <Text className="text-white font-bold ">
            {showSelect ? "Cancel" : "Upgrade level"}
          </Text>
        </Button>
        {showSelect && (
          <View className="flex-1">
            <Text className="text-xl font-bold ml-4 mt-2 -mb-4 text-foreground">
              Upgrade level to:
            </Text>
            <Dropdown
              style={styles.dropdown}
              selectedTextStyle={{
                fontSize: 16,
                color: isDarkColorScheme ? "white" : "black",
              }}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={frenchJourneyData}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select item"
              searchPlaceholder="Search..."
              value={currenTopic}
              onChange={(item) => {
                setCurrentTopic(item);
                setShowSelect(false);
              }}
              renderItem={(item) => (
                <View className="flex-row items-center my-1 justify-start px-1 py-2">
                  <Text className="text-base font-bold">{item.label}</Text>
                </View>
              )}
            />
          </View>
        )}
      </View>
      <DecisionDialog />
    </View>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  dropdown: {
    marginLeft: 16,
    marginRight: 16,
    height: 80,
    width: "90%",
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
  },
  icon: {
    marginRight: 5,
  },

  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
