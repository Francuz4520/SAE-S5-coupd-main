import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DEFAULT_AVATARS } from "../constants/defaultAvatars";

function DefaultAvatar({ avatarKey = "a1", size = 100 }) {
  const a = DEFAULT_AVATARS.find((x) => x.id === avatarKey) || DEFAULT_AVATARS[0];

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: a.bg,
        },
      ]}
    >
      <MaterialCommunityIcons name={a.icon} size={Math.round(size * 0.55)} color="#222" />
    </View>
  );
}

export default DefaultAvatar;

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
});
