import React, { useState, useRef } from "react";
import {View, Image, StyleSheet, Dimensions, Modal, Pressable, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function DetailHero({ imageUri }) {
  const [zoomVisible, setZoomVisible] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const openZoom = () => {
    setZoomVisible(true);

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start();
  };

  const closeZoom = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setZoomVisible(false);
    });
  };

  if (imageUri) {
    return (
      <>
        {/* IMAGE NORMALE */}
        <Pressable onPress={openZoom}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </Pressable>

        {/* MODAL AVEC ANIMATION */}
        <Modal visible={zoomVisible} transparent={true}>
          <Animated.View
            style={[
              styles.modalContainer,
              { opacity: opacityAnim }
            ]}
          >
            <Pressable style={styles.closeZone} onPress={closeZoom} />
            
            <Animated.Image
              source={{ uri: imageUri }}
              style={[
                styles.zoomImage,
                {
                  transform: [
                    {
                      scale: scaleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1],
                      }),
                    },
                  ],
                },
              ]}
            />

            <Pressable style={styles.closeButton} onPress={closeZoom}>
              <Ionicons name="close" size={40} color="#fff" />
            </Pressable>
          </Animated.View>
        </Modal>
      </>
    );
  }

  return (
    <View style={[styles.image, styles.placeholder]}>
      <Ionicons name="image-outline" size={50} color="#ccc" />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: width,
    height: 250,
    resizeMode: "contain",
    backgroundColor: "#f0f0f0",
  },

  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },

  zoomImage: {
    width: width * 0.85,
    height: height * 0.65,
    resizeMode: "contain",
  },

  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
  },

  closeZone: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});
