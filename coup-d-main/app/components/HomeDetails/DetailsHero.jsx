import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function DetailHero({ imageUri }) {
  if (imageUri) {
    return <Image source={{ uri: imageUri }} style={styles.image} />;
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
    resizeMode: "cover",
    backgroundColor: "#f0f0f0",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
});