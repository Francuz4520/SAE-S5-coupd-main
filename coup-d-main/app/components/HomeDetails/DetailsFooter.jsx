import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function DetailFooter({ isHelpRequest, onPress }) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.actionButtonText}>
          {"Contacter"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    backgroundColor: "#29AAAB",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#29AAAB",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
  },
  actionButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});