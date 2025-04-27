import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";

const ImagePopupComponent = () => {
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      {/* Thumbnail that opens the modal */}
      <TouchableOpacity onPress={toggleModal}>
        <Image
          source={require("../assets/ttcMap.png")}
          style={styles.thumbnail}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Modal with full image */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Image
                source={require("../assets/ttcMap.png")}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnail: {
    width: 150,
    height: 150,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  fullImage: {
    width: windowWidth * 0.9,
    height: windowHeight * 0.9,
  },
});

export default ImagePopupComponent;
