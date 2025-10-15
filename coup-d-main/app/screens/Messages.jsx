import { Text, View, StyleSheet } from "react-native";

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <Text>Messages screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});